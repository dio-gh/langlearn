import { GrammarExpander } from "./grammar-expander.js";
import { formatGoTokens } from "./grammar-expander.js";
import { Random } from "./random.js";

function uniqueOptions(answer, candidates, random, count = 3) {
  const values = [...new Set(candidates.map(String).filter((value) => value !== String(answer)))];
  for (let offset = 1; values.length < count - 1; offset += 1) {
    values.push(`${answer}${offset}`);
  }
  return random.shuffled([String(answer), ...values.slice(0, count - 1)]);
}

function answerOptions(answer, random, supplied = []) {
  const numeric = Number(answer);
  const suppliedValues = supplied.map((item) => item.value);
  if (Number.isFinite(numeric) && String(numeric) === String(answer)) {
    return uniqueOptions(answer, [
      ...suppliedValues,
      numeric + 1,
      numeric - 1,
      numeric + random.integer(2, 7),
      numeric * 2,
      Math.abs(numeric),
      0,
    ], random);
  }
  return uniqueOptions(answer, [
    ...suppliedValues,
    [...String(answer)].reverse().join(""),
    String(answer).slice(1),
    `${answer}${answer}`,
    "",
  ], random);
}

function integerExpression(random, depth = 0) {
  if (depth >= 2 || random.chance(0.35)) {
    const value = random.integer(1, 12);
    return {
      code: String(value),
      value,
      distractors: [
        { value: value + 1, misconception: "off-by-one" },
        { value: -value, misconception: "sign" },
      ],
      facet: "literal",
    };
  }
  const left = integerExpression(random, depth + 1);
  const right = integerExpression(random, depth + 1);
  const operator = random.pick(["+", "-", "*", "%"]);
  const safeRight = operator === "%" && right.value === 0
    ? { code: "1", value: 1 }
    : right;
  const value = {
    "+": left.value + safeRight.value,
    "-": left.value - safeRight.value,
    "*": left.value * safeRight.value,
    "%": left.value % safeRight.value,
  }[operator];
  return {
    code: `(${left.code} ${operator} ${safeRight.code})`,
    value,
    distractors: [
      { value: left.value, misconception: "left-only" },
      { value: safeRight.value, misconception: "right-only" },
      { value: value + 1, misconception: "operator" },
    ],
    facet: `operator:${operator}`,
  };
}

function semanticCase(family, random) {
  if (family === "expression") {
    return integerExpression(random);
  }

  if (family === "branch") {
    const value = random.integer(-8, 12);
    const pivot = random.integer(-4, 8);
    const yes = random.integer(10, 30);
    const no = random.integer(31, 50);
    const operator = random.pick([">", "<", ">=", "<=", "==", "!="]);
    const condition = {
      ">": value > pivot,
      "<": value < pivot,
      ">=": value >= pivot,
      "<=": value <= pivot,
      "==": value === pivot,
      "!=": value !== pivot,
    }[operator];
    return {
      code: `func() int {\n\tx := ${value}\n\tif x ${operator} ${pivot} {\n\t\treturn ${yes}\n\t}\n\treturn ${no}\n}()`,
      value: condition ? yes : no,
      facet: `comparison:${operator}`,
      distractors: [
        { value: condition ? no : yes, misconception: "branch-inversion" },
        { value: value, misconception: "condition-value" },
      ],
    };
  }

  if (family === "loop") {
    const start = random.integer(0, 3);
    const stop = random.integer(start + 2, start + 8);
    const step = random.integer(1, 2);
    let total = 0;
    for (let index = start; index < stop; index += step) total += index;
    return {
      code: `func() int {\n\ttotal := 0\n\tfor i := ${start}; i < ${stop}; i += ${step} {\n\t\ttotal += i\n\t}\n\treturn total\n}()`,
      value: total,
      facet: `loop-step:${step}`,
      distractors: [
        { value: total - (stop - step), misconception: "loop-last-omitted" },
        { value: stop - start, misconception: "loop-count-vs-sum" },
      ],
    };
  }

  if (family === "slice") {
    const values = Array.from({ length: random.integer(3, 6) }, () => random.integer(1, 20));
    const mode = random.pick(["len", "index", "sum"]);
    if (mode === "len") {
      return {
        code: `len([]int{${values.join(", ")}})`,
        value: values.length,
        facet: "slice-length",
        distractors: [
          { value: values.length - 1, misconception: "last-index-vs-length" },
          { value: values.reduce((sum, value) => sum + value, 0), misconception: "length-vs-sum" },
        ],
      };
    }
    if (mode === "index") {
      const index = random.integer(0, values.length - 1);
      return {
        code: `[]int{${values.join(", ")}}[${index}]`,
        value: values[index],
        facet: "slice-index",
        distractors: [
          { value: index, misconception: "index-vs-value" },
          { value: values[Math.max(0, index - 1)], misconception: "one-based-index" },
        ],
      };
    }
    return {
      code: `func() int {\n\ttotal := 0\n\tfor _, value := range []int{${values.join(", ")}} {\n\t\ttotal += value\n\t}\n\treturn total\n}()`,
      value: values.reduce((sum, value) => sum + value, 0),
      facet: "slice-range",
      distractors: [
        { value: values.length, misconception: "sum-vs-length" },
        { value: values.slice(0, -1).reduce((sum, value) => sum + value, 0), misconception: "range-last-omitted" },
      ],
    };
  }

  if (family === "map") {
    const keys = ["go", "map", "key", "type"];
    const entries = random.shuffled(keys).slice(0, random.integer(2, 4))
      .map((key) => [key, random.integer(1, 20)]);
    const known = random.chance(0.8);
    const key = known ? random.pick(entries)[0] : "none";
    const value = entries.find(([entry]) => entry === key)?.[1] ?? 0;
    const literal = entries.map(([entry, number]) => `${JSON.stringify(entry)}: ${number}`).join(", ");
    return {
      code: `map[string]int{${literal}}[${JSON.stringify(key)}]`,
      value,
      facet: known ? "map-hit" : "map-zero-value",
      distractors: known
        ? [
          { value: 0, misconception: "map-always-zero" },
          { value: entries.length, misconception: "map-length-vs-value" },
        ]
        : [
          { value: entries[0][1], misconception: "missing-map-arbitrary-value" },
          { value: -1, misconception: "missing-map-sentinel" },
        ],
    };
  }

  if (family === "defer") {
    const alphabet = ["a", "b", "c", "d", "e", "f"];
    const immediate = random.pick(alphabet);
    const deferred = random.shuffled(alphabet.filter((value) => value !== immediate))
      .slice(0, random.integer(1, 3));
    const lines = deferred.map((value) => `\tdefer func() { text += ${JSON.stringify(value)} }()`);
    return {
      code: `func() (text string) {\n${lines.join("\n")}\n\ttext += ${JSON.stringify(immediate)}\n\treturn\n}()`,
      value: immediate + [...deferred].reverse().join(""),
      facet: `defer-depth:${deferred.length}`,
      distractors: [
        { value: immediate + deferred.join(""), misconception: "defer-fifo" },
        { value: immediate, misconception: "defer-ignored" },
      ],
    };
  }

  if (family === "closure") {
    const start = random.integer(0, 8);
    const first = random.integer(1, 5);
    const second = random.integer(1, 5);
    return {
      code: `func() int {\n\tn := ${start}\n\tadd := func(value int) int {\n\t\tn += value\n\t\treturn n\n\t}\n\tadd(${first})\n\treturn add(${second})\n}()`,
      value: start + first + second,
      facet: "closure-capture",
      distractors: [
        { value: start + second, misconception: "closure-first-call-ignored" },
        { value: second, misconception: "closure-no-capture" },
      ],
    };
  }

  if (family === "channel") {
    const first = random.integer(1, 20);
    const second = random.integer(1, 20);
    const operator = random.pick(["-", "-", "+", "*"]);
    const value = {
      "+": first + second,
      "-": first - second,
      "*": first * second,
    }[operator];
    return {
      code: `func() int {\n\tch := make(chan int, 2)\n\tch <- ${first}\n\tch <- ${second}\n\treturn <-ch ${operator} <-ch\n}()`,
      value,
      facet: `channel-order:${operator}`,
      distractors: [
        {
          value: operator === "-" ? second - first : first,
          misconception: "channel-receive-order",
        },
        { value: second, misconception: "channel-single-receive" },
      ],
    };
  }

  throw new RangeError(`Unknown semantic family ${family}`);
}

function argumentFor(type, random) {
  if (type === "string") return JSON.stringify(random.pick(["go", "gopher", "a,b", " Go ", "123"]));
  if (type === "bool") return String(random.chance());
  if (["int", "int8", "int16", "int32", "int64", "uint", "uint8", "uint16", "uint32", "uint64", "uintptr", "byte", "rune"].includes(type)) {
    return String(random.integer(0, 12));
  }
  if (["float32", "float64"].includes(type)) return `${random.integer(1, 12)}.${random.integer(0, 9)}`;
  if (type === "[]string") {
    return `[]string{${Array.from({ length: random.integer(2, 4) }, () => JSON.stringify(random.pick(["go", "do", "run", "x"]))).join(", ")}}`;
  }
  if (type === "[]int") {
    return `[]int{${Array.from({ length: random.integer(2, 5) }, () => random.integer(0, 20)).join(", ")}}`;
  }
  if (type === "[]byte") {
    return `[]byte(${JSON.stringify(random.pick(["go", "a,b", "text", "bytes"]))})`;
  }
  if (type === "any" || type === "interface{}") return String(random.integer(0, 20));
  return null;
}

function resultPrefix(results) {
  if (results.length === 0) return "";
  return `${Array.from({ length: results.length }, () => "_").join(", ")} = `;
}

export class SyntaxSynthesizer {
  constructor(grammar) {
    this.expander = new GrammarExpander(grammar);
  }

  generate(stage, seed) {
    const derivation = this.expander.expand(stage.production, seed, stage.expansion);
    const candidate = Number(seed.split(":").at(-1));
    if (candidate % 3 !== 0) {
      const probe = syntaxContrast(derivation.tokens, new Random(`${seed}:contrast`));
      return {
        kind: "choice",
        code: "",
        options: probe.options,
        answer: derivation.code,
        diagnostics: probe.diagnostics,
        facets: ["contrast", ...probe.facets],
        context: stage.context,
        derivation: derivation.trace,
      };
    }
    return {
      kind: "typing",
      code: derivation.code,
      context: stage.context,
      derivation: derivation.trace,
      facets: ["construction"],
    };
  }
}

export class MeaningSynthesizer {
  generate(stage, seed) {
    const random = new Random(seed);
    const generated = semanticCase(stage.family, random);
    const answer = String(generated.value);
    const options = answerOptions(answer, random, generated.distractors);
    const diagnostics = Object.fromEntries(options
      .filter((option) => option !== answer)
      .map((option) => {
        const match = generated.distractors?.find((item) => String(item.value) === option);
        return [option, match?.misconception ?? `${stage.family}:near-miss`];
      }));
    return {
      kind: "choice",
      code: `fmt.Print(${generated.code})`,
      expression: generated.code,
      options,
      answer,
      diagnostics,
      facets: [...new Set([stage.family, generated.facet ?? stage.family])],
    };
  }
}

export class LibrarySynthesizer {
  constructor(catalog) {
    this.catalog = catalog;
  }

  generate(stage, seed) {
    const random = new Random(seed);
    const functions = this.catalog[stage.packagePath] ?? [];
    if (functions.length < 3) throw new RangeError(`No generated API catalog for ${stage.packagePath}`);
    const target = random.pick(functions);
    const fixed = target.variadic ? target.params.slice(0, -1) : target.params;
    const args = fixed.map((type) => argumentFor(type, random));
    if (args.some((value) => value === null)) {
      throw new RangeError(`Unsupported generated parameter in ${stage.packagePath}.${target.name}`);
    }
    const namesInPackage = new Set(functions.map((item) => item.name));
    const otherNames = Object.entries(this.catalog)
      .filter(([path]) => path !== stage.packagePath)
      .flatMap(([, items]) => items)
      .filter((item) => !namesInPackage.has(item.name))
      .map((item) => item.name);
    const distractors = random.shuffled([...new Set(otherNames)])
      .slice(0, 7);
    const options = random.shuffled([target.name, ...distractors.slice(0, 3)]);
    const call = `${stage.packagePath}.BOX(${args.join(", ")})`;
    return {
      kind: "choice",
      code: `${resultPrefix(target.results)}${call.replace("BOX", "?")}`,
      sourceTemplate: `${resultPrefix(target.results)}${call}`,
      packagePath: stage.packagePath,
      options,
      answer: target.name,
      diagnostics: Object.fromEntries(options
        .filter((option) => option !== target.name)
        .map((option) => [option, `api:${option}`])),
      facets: [`package:${stage.packagePath}`, `arity:${fixed.length}`],
    };
  }
}

export class SynthesizerRegistry {
  constructor(grammar, catalog) {
    this.items = {
      syntax: new SyntaxSynthesizer(grammar),
      meaning: new MeaningSynthesizer(),
      library: new LibrarySynthesizer(catalog),
    };
  }

  has(mode) {
    return Boolean(this.items[mode]);
  }

  generate(stage, seed) {
    const synthesizer = this.items[stage.mode];
    if (!synthesizer) throw new RangeError(`Unknown synthesizer mode ${stage.mode}`);
    return synthesizer.generate(stage, seed);
  }
}

const delimiterPairs = {
  "(": "]",
  ")": "}",
  "[": "(",
  "]": ")",
  "{": "[",
  "}": "]",
};

const operatorTokens = new Set([
  "+", "-", "*", "/", "%", "&", "|", "^", "<<", ">>", "&^",
  "==", "!=", "<", "<=", ">", ">=", "&&", "||", "<-", "=", ":=",
]);

const keywords = new Set([
  "break", "case", "chan", "const", "continue", "default", "defer", "else",
  "fallthrough", "for", "func", "go", "goto", "if", "import", "interface",
  "map", "package", "range", "return", "select", "struct", "switch", "type", "var",
]);

function mutationCandidates(tokens) {
  const candidates = [];
  tokens.forEach((token, index) => {
    if (delimiterPairs[token]) {
      candidates.push({
        facet: "delimiter",
        apply(copy) {
          copy[index] = delimiterPairs[token];
        },
      });
      candidates.push({
        facet: "delimiter",
        apply(copy) {
          copy.splice(index, 1);
        },
      });
    }
    if ([",", ";", ".", ":"].includes(token)) {
      candidates.push({
        facet: "separator",
        apply(copy) {
          copy.splice(index, 1);
        },
      });
    }
    if (operatorTokens.has(token)) {
      candidates.push({
        facet: "operator",
        apply(copy) {
          copy[index] = "::";
        },
      });
    }
    if (keywords.has(token)) {
      candidates.push({
        facet: "keyword",
        apply(copy) {
          copy.splice(index, 1);
        },
      });
    }
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(token) && !keywords.has(token)) {
      candidates.push({
        facet: "identifier",
        apply(copy) {
          copy[index] = "for";
        },
      });
    }
  });
  return candidates;
}

function syntaxContrast(tokens, random) {
  const mutations = random.shuffled(mutationCandidates(tokens));
  const variants = [];
  for (const mutation of mutations) {
    const copy = [...tokens];
    mutation.apply(copy);
    const code = formatGoTokens(copy);
    if (code && !variants.some((item) => item.code === code)) {
      variants.push({ code, facet: mutation.facet });
    }
    if (variants.length === 4) break;
  }
  while (variants.length < 2) {
    const copy = [...tokens, "}"];
    const code = formatGoTokens(copy);
    variants.push({ code: `${code}${" ".repeat(variants.length)}`, facet: "delimiter" });
  }
  const selected = variants.slice(0, 2);
  const options = random.shuffled([formatGoTokens(tokens), ...selected.map((item) => item.code)]);
  return {
    options,
    diagnostics: Object.fromEntries(selected.map((item) => [item.code, `syntax:${item.facet}`])),
    facets: [...new Set(selected.map((item) => `syntax:${item.facet}`))],
  };
}

export { argumentFor, semanticCase, syntaxContrast };
