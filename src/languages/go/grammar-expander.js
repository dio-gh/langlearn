import { Random } from "../../core/random.js";
import { identifierVocabulary } from "./data/names.generated.js";

const reserved = new Set([
  "break", "default", "func", "interface", "select",
  "case", "defer", "go", "map", "struct",
  "chan", "else", "goto", "package", "switch",
  "const", "fallthrough", "if", "range", "type",
  "continue", "for", "import", "return", "var",
]);

const identifierRoles = Object.freeze({
  PackageName: "packages",
  FunctionName: "functions",
  MethodName: "methods",
  FieldName: "fields",
  TypeName: "types",
  TypeSpec: "types",
  TypeDef: "types",
  AliasDecl: "types",
  ReceiverType: "types",
  BaseType: "types",
  TypeParamDecl: "types",
});

function identifierRole(state) {
  for (let index = state.stack.length - 1; index >= 0; index -= 1) {
    const role = identifierRoles[state.stack[index]];
    if (role) return role;
  }
  return identifierRoles[state.owner] ?? "variables";
}

function generatedIdentifier(random, state) {
  const role = identifierRole(state);
  const fallbacks = [
    identifierVocabulary[role],
    identifierVocabulary.variables,
    identifierVocabulary.fields,
    identifierVocabulary.functions,
    identifierVocabulary.types,
  ];
  for (const pool of fallbacks) {
    const available = pool.filter(
      (value) => !reserved.has(value) && !state.identifiers.has(value),
    );
    if (available.length) {
      const value = random.pick(available);
      state.identifiers.add(value);
      return value;
    }
  }
  throw new RangeError("Identifier vocabulary exhausted");
}

function digits(random, radix, min = 1, max = 4) {
  const alphabet = "0123456789abcdef".slice(0, radix);
  const length = random.integer(min, max);
  let value = "";
  for (let index = 0; index < length; index += 1) {
    const start = index === 0 && length > 1 ? 1 : 0;
    value += alphabet[random.integer(start, alphabet.length - 1)];
  }
  return value;
}

function quotedString(random) {
  const fragments = ["go", "do", "run", "type", "loop", "map", "chan", "byte"];
  return JSON.stringify(Array.from(
    { length: random.integer(1, 3) },
    () => random.pick(fragments),
  ).join(random.chance(0.3) ? " " : ""));
}

const lexicalProviders = {
  identifier(random, state) {
    return generatedIdentifier(random, state);
  },
  int_lit(random) {
    const radix = random.pick([2, 8, 10, 10, 10, 16]);
    const prefix = { 2: "0b", 8: "0o", 10: "", 16: "0x" }[radix];
    return prefix + digits(random, radix);
  },
  float_lit(random) {
    return `${digits(random, 10)}.${digits(random, 10, 1, 3)}`;
  },
  imaginary_lit(random) {
    return `${digits(random, 10)}i`;
  },
  rune_lit(random) {
    return `'${random.pick(["a", "g", "o", "x", "\\n", "\\t"])}'`;
  },
  string_lit(random) {
    return quotedString(random);
  },
  raw_string_lit(random) {
    return `\`${quotedString(random).slice(1, -1)}\``;
  },
  interpreted_string_lit(random) {
    return quotedString(random);
  },
  unicode_char(random) {
    return random.pick(["a", "b", "g", "o", "x"]);
  },
  unicode_letter(random) {
    return random.pick(["a", "b", "g", "o", "x"]);
  },
  unicode_digit(random) {
    return String(random.integer(0, 9));
  },
  newline() {
    return "\n";
  },
};

const expansionProfiles = {
  simple: {
    choices: {
      Expression: [0],
      UnaryExpr: [0],
      PrimaryExpr: [0],
      Operand: [0, 1],
      Literal: [0],
      Type: [0],
      TypeName: [0],
      Statement: [2],
      SimpleStmt: [5],
      Declaration: [2],
      InterfaceElem: [0],
      VarDecl: [0],
      ConstDecl: [0],
      TypeDecl: [0],
      ImportDecl: [0],
      TopLevelDecl: [1],
    },
    repeats: {
      IdentifierList: 0,
      ExpressionList: 0,
      ParameterList: 0,
      TypeElem: 0,
    },
  },
  expression: {
    choices: {
      Expression: [0, 1],
      UnaryExpr: [0, 1],
      PrimaryExpr: [0],
      Operand: [0, 1, 2],
      Literal: [0],
      Type: [0],
      TypeName: [0],
    },
    repeats: {
      IdentifierList: 0,
      ExpressionList: 0,
    },
  },
  call: {
    choices: {
      Expression: [0],
      UnaryExpr: [0],
      PrimaryExpr: [7],
      Operand: [1],
      Type: [0],
      TypeName: [0],
    },
    repeats: {
      ExpressionList: 0,
      IdentifierList: 0,
    },
  },
};

function nodeChildren(node) {
  if (node.items) return node.items;
  if (node.options) return node.options;
  if (node.value && typeof node.value === "object") return [node.value];
  if (node.start || node.end) return [node.start, node.end].filter(Boolean);
  return [];
}

function computeMinimumCosts(productions, providers) {
  const costs = Object.fromEntries(Object.keys(productions).map((name) => [
    name,
    providers[name] ? 1 : Number.POSITIVE_INFINITY,
  ]));

  const costOf = (node) => {
    switch (node.kind) {
      case "empty":
        return 0;
      case "literal":
      case "prose":
        return 1;
      case "reference":
        return costs[node.name] ?? Number.POSITIVE_INFINITY;
      case "optional":
      case "repeat":
        return 0;
      case "group":
        return costOf(node.value);
      case "range":
        return 1;
      case "sequence":
        return node.items.reduce((sum, child) => sum + costOf(child), 0);
      case "choice":
        return Math.min(...node.options.map(costOf));
      default:
        return Number.POSITIVE_INFINITY;
    }
  };

  for (let pass = 0; pass < 256; pass += 1) {
    let changed = false;
    for (const [name, node] of Object.entries(productions)) {
      if (providers[name]) continue;
      const next = costOf(node);
      if (next < costs[name]) {
        costs[name] = next;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return { costs, costOf };
}

function chooseWeighted(random, options, complexity) {
  if (options.length === 1) return options[0];
  const ordered = [...options].sort((left, right) => left.cost - right.cost);
  if (complexity <= 0.25) return ordered[random.integer(0, Math.min(1, ordered.length - 1))];
  const index = Math.floor(Math.pow(random.next(), 1 / (0.7 + complexity)) * ordered.length);
  return ordered[Math.min(index, ordered.length - 1)];
}

export class GrammarExpander {
  constructor(grammar, providers = lexicalProviders) {
    this.grammar = grammar;
    this.providers = providers;
    const minimums = computeMinimumCosts(grammar.productions, providers);
    this.costs = minimums.costs;
    this.costOf = minimums.costOf;
  }

  expand(production, seed, options = {}) {
    const random = new Random(seed);
    const state = {
      complexity: options.complexity ?? 0.55,
      depth: 0,
      maxDepth: options.maxDepth ?? 12,
      maxRepeat: options.maxRepeat ?? 2,
      remaining: options.maxTokens ?? 90,
      identifiers: new Set(),
      stack: [],
      trace: [],
      owner: "",
      profile: expansionProfiles[options.profile] ?? expansionProfiles.simple,
      recursion: 0,
    };
    const tokens = this.expandProduction(production, random, state);
    return {
      tokens,
      code: formatGoTokens(tokens),
      trace: state.trace,
    };
  }

  expandProduction(name, random, state) {
    const provider = this.providers[name];
    state.trace.push(name);
    if (provider) {
      state.remaining -= 1;
      return [provider(random, state)];
    }

    const node = this.grammar.get(name);
    const recursions = state.stack.filter((item) => item === name).length;
    const previousOwner = state.owner;
    const previousRecursion = state.recursion;
    state.owner = name;
    state.recursion = recursions;
    state.stack.push(name);
    state.depth += 1;
    const previousComplexity = state.complexity;
    if (recursions > 0 || state.depth >= state.maxDepth || state.remaining < 8) {
      state.complexity = 0;
    }
    const tokens = this.expandNode(node, random, state);
    state.complexity = previousComplexity;
    state.depth -= 1;
    state.stack.pop();
    state.owner = previousOwner;
    state.recursion = previousRecursion;
    return tokens;
  }

  expandNode(node, random, state) {
    switch (node.kind) {
      case "empty":
        return [];
      case "literal":
        state.remaining -= 1;
        return [node.value];
      case "prose":
        state.remaining -= 1;
        return ["x"];
      case "reference":
        return this.expandProduction(node.name, random, state);
      case "group":
        return this.expandNode(node.value, random, state);
      case "range": {
        const start = node.start.value.codePointAt(0);
        const end = node.end.value.codePointAt(0);
        state.remaining -= 1;
        return [String.fromCodePoint(random.integer(start, end))];
      }
      case "optional":
        return random.chance(0.12 + state.complexity * 0.5)
          ? this.expandNode(node.value, random, state)
          : [];
      case "repeat": {
        const affordable = Math.max(0, Math.floor(state.remaining / Math.max(1, this.costOf(node.value))));
        const profileLimit = state.profile.repeats?.[state.owner];
        const limit = Math.min(profileLimit ?? state.maxRepeat, affordable);
        const count = state.complexity === 0 ? 0 : random.integer(0, limit);
        return Array.from({ length: count }, () => this.expandNode(node.value, random, state)).flat();
      }
      case "sequence":
        return node.items.flatMap((child) => this.expandNode(child, random, state));
      case "choice": {
        const allowed = state.recursion === 0 ? state.profile.choices?.[state.owner] : null;
        const source = allowed
          ? node.options.filter((_, index) => allowed.includes(index))
          : node.options;
        const options = source.map((value) => ({ value, cost: this.costOf(value) }))
          .filter((option) => Number.isFinite(option.cost) && option.cost <= Math.max(1, state.remaining));
        const candidates = options.length ? options : source.map((value) => ({
          value,
          cost: this.costOf(value),
        }));
        const chosen = state.recursion > 0 || state.complexity === 0
          ? [...candidates].sort((left, right) => left.cost - right.cost)[0]
          : chooseWeighted(random, candidates, state.complexity);
        return this.expandNode(chosen.value, random, state);
      }
      default:
        throw new TypeError(`Unknown grammar node ${node.kind}`);
    }
  }
}

function isWord(token) {
  return /^[\p{L}\p{N}_'"`]/u.test(token);
}

function isOperator(token) {
  return /^(?:\+|-|\*|\/|%|&|\||\^|<<|>>|&\^|==|!=|<|<=|>|>=|&&|\|\||<-|=|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|<<=|>>=|&\^=|:=)$/.test(token);
}

export function formatGoTokens(tokens) {
  let output = "";
  let indent = 0;
  let lineStart = true;
  let previous = "";

  const write = (value) => {
    if (lineStart && value !== "\n") {
      output += "\t".repeat(indent);
      lineStart = false;
    }
    output += value;
  };
  const newline = () => {
    output = output.replace(/[ \t]+$/g, "");
    if (!output.endsWith("\n")) output += "\n";
    lineStart = true;
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const next = tokens[index + 1] ?? "";
    if (token === ";" || token === "\n") {
      newline();
      previous = token;
      continue;
    }
    if (token === "{") {
      if (!lineStart && previous !== " " && previous !== "\n") write(" ");
      write("{");
      indent += 1;
      newline();
      previous = token;
      continue;
    }
    if (token === "}") {
      indent = Math.max(0, indent - 1);
      if (!lineStart) newline();
      write("}");
      if (next !== "else" && next !== ")" && next !== "," && next !== ";") newline();
      previous = token;
      continue;
    }
    if (token === ",") {
      write(",");
      write(" ");
      previous = token;
      continue;
    }
    if (token === ".") {
      write(".");
      previous = token;
      continue;
    }
    if (token === ":") {
      write(":");
      if (next !== "=") write(" ");
      previous = token;
      continue;
    }
    if (token === ")" || token === "]") {
      write(token);
      previous = token;
      continue;
    }
    if (token === "(" || token === "[") {
      if (previous && isWord(previous) && previous !== "func" && token === "(") {
        // Function calls and declarations do not need a separating space.
      }
      write(token);
      previous = token;
      continue;
    }

    const needsSpace = output
      && !lineStart
      && previous !== "("
      && previous !== "["
      && previous !== "."
      && (isWord(previous) && isWord(token) || isOperator(previous) || isOperator(token) || previous === "else");
    if (needsSpace && !output.endsWith(" ")) write(" ");
    write(token);
    previous = token;
  }
  return output.trim();
}

export { lexicalProviders };
