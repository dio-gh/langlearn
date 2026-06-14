import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultSpec = resolve(root, ".research/go/doc/go_spec.html");
const defaultOutput = resolve(root, "src/data/go-grammar.generated.js");

const entities = {
  amp: "&",
  apos: "'",
  gt: ">",
  hellip: "…",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

export function decodeHtml(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity) => {
      if (entity[0] === "#") {
        const radix = entity[1].toLowerCase() === "x" ? 16 : 10;
        const digits = radix === 16 ? entity.slice(2) : entity.slice(1);
        return String.fromCodePoint(Number.parseInt(digits, radix));
      }
      return entities[entity.toLowerCase()] ?? `&${entity};`;
    })
    .replace(/\r\n?/g, "\n");
}

export function tokenize(source) {
  const tokens = [];
  let index = 0;

  while (index < source.length) {
    const rest = source.slice(index);
    const whitespace = rest.match(/^\s+/);
    if (whitespace) {
      index += whitespace[0].length;
      continue;
    }

    if (rest.startsWith("/*")) {
      const end = source.indexOf("*/", index + 2);
      if (end < 0) throw new SyntaxError("Unclosed prose terminal");
      tokens.push({ type: "prose", value: source.slice(index + 2, end).trim() });
      index = end + 2;
      continue;
    }

    const first = source[index];
    if (first === '"' || first === "`") {
      const quote = first;
      let cursor = index + 1;
      let value = "";
      while (cursor < source.length) {
        const character = source[cursor];
        if (character === quote) break;
        if (quote === '"' && character === "\\" && cursor + 1 < source.length) {
          value += character + source[cursor + 1];
          cursor += 2;
          continue;
        }
        value += character;
        cursor += 1;
      }
      if (source[cursor] !== quote) throw new SyntaxError("Unclosed grammar literal");
      tokens.push({ type: "literal", value, quote });
      index = cursor + 1;
      continue;
    }

    const identifier = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (identifier) {
      tokens.push({ type: "identifier", value: identifier[0] });
      index += identifier[0].length;
      continue;
    }

    if ("=.|()[]{}".includes(first) || first === "…") {
      tokens.push({ type: first, value: first });
      index += 1;
      continue;
    }

    throw new SyntaxError(`Unexpected grammar character ${JSON.stringify(first)}`);
  }

  return tokens;
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }

  peek(type) {
    return this.tokens[this.index]?.type === type;
  }

  take(type) {
    const token = this.tokens[this.index];
    if (!token || token.type !== type) {
      throw new SyntaxError(`Expected ${type}, found ${token?.type ?? "end of input"}`);
    }
    this.index += 1;
    return token;
  }

  parseAll() {
    const productions = {};
    while (this.index < this.tokens.length) {
      const name = this.take("identifier").value;
      this.take("=");
      const expression = this.parseChoice(new Set(["."]));
      this.take(".");
      productions[name] = expression;
    }
    return productions;
  }

  parseChoice(stops) {
    const options = [this.parseSequence(new Set([...stops, "|"]))];
    while (this.peek("|")) {
      this.take("|");
      options.push(this.parseSequence(new Set([...stops, "|"])));
    }
    return options.length === 1 ? options[0] : { kind: "choice", options };
  }

  parseSequence(stops) {
    const items = [];
    while (this.index < this.tokens.length && !stops.has(this.tokens[this.index].type)) {
      items.push(this.parseFactor());
    }
    if (items.length === 0) return { kind: "empty" };
    return items.length === 1 ? items[0] : { kind: "sequence", items };
  }

  parseFactor() {
    let node;
    const token = this.tokens[this.index];

    if (token.type === "identifier") {
      node = { kind: "reference", name: this.take("identifier").value };
    } else if (token.type === "literal") {
      const literal = this.take("literal");
      node = { kind: "literal", value: literal.value, quote: literal.quote };
    } else if (token.type === "prose") {
      node = { kind: "prose", value: this.take("prose").value };
    } else if (token.type === "(") {
      this.take("(");
      node = { kind: "group", value: this.parseChoice(new Set([")"])) };
      this.take(")");
    } else if (token.type === "[") {
      this.take("[");
      node = { kind: "optional", value: this.parseChoice(new Set(["]"])) };
      this.take("]");
    } else if (token.type === "{") {
      this.take("{");
      node = { kind: "repeat", value: this.parseChoice(new Set(["}"])) };
      this.take("}");
    } else {
      throw new SyntaxError(`Unexpected ${token.type} in production`);
    }

    if (this.peek("…")) {
      this.take("…");
      const end = this.parseFactor();
      node = { kind: "range", start: node, end };
    }

    return node;
  }
}

export function parseGrammar(source) {
  return new Parser(tokenize(source)).parseAll();
}

export function extractSpec(html) {
  const blocks = [...html.matchAll(/<pre class="ebnf">([\s\S]*?)<\/pre>/g)]
    .map((match) => decodeHtml(match[1]).trim())
    .filter(Boolean);
  const subtitle = html.match(/"Subtitle":\s*"Language version ([^"]+)"/)?.[1]
    ?? html.match(/Language version\s+(go[\d.]+)/)?.[1]
    ?? "unknown";

  return {
    version: subtitle,
    source: blocks.join("\n"),
    blocks: blocks.length,
  };
}

function gitRevision(specPath) {
  const repo = resolve(dirname(specPath), "..");
  try {
    const head = readFileSync(resolve(repo, ".git/HEAD"), "utf8").trim();
    if (/^[0-9a-f]{40}$/i.test(head)) return head;
  } catch {
    // Fall through to git for ordinary branch checkouts.
  }
  try {
    return execFileSync("git", ["-c", `safe.directory=${repo}`, "-C", repo, "rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

function generateModule(specPath) {
  const html = readFileSync(specPath, "utf8");
  const extracted = extractSpec(html);
  const productions = parseGrammar(extracted.source);
  const metadata = {
    languageVersion: extracted.version,
    productionCount: Object.keys(productions).length,
    ebnfBlockCount: extracted.blocks,
    revision: gitRevision(specPath),
    source: "https://go.dev/ref/spec",
  };

  return `// Generated by tools/extract-grammar.mjs. Do not edit by hand.
export const grammarMetadata = Object.freeze(${JSON.stringify(metadata, null, 2)});

export const grammarProductions = Object.freeze(${JSON.stringify(productions, null, 2)});
`;
}

function main() {
  const specPath = resolve(process.argv[2] ?? defaultSpec);
  const outputPath = resolve(process.argv[3] ?? defaultOutput);
  writeFileSync(outputPath, generateModule(specPath), "utf8");
  const shown = relative(root, outputPath);
  console.log(`wrote ${shown}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
