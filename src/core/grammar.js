function collectReferences(node, found) {
  if (!node) return found;
  if (node.kind === "reference") found.add(node.name);
  if (node.value && typeof node.value === "object") collectReferences(node.value, found);
  if (node.start) collectReferences(node.start, found);
  if (node.end) collectReferences(node.end, found);
  for (const child of node.items ?? node.options ?? []) collectReferences(child, found);
  return found;
}
function formatNode(node) {
  switch (node.kind) {
    case "empty":
      return "ε";
    case "reference":
      return node.name;
    case "literal":
      return `${node.quote}${node.value}${node.quote}`;
    case "prose":
      return `‹${node.value}›`;
    case "group":
      return `( ${formatNode(node.value)} )`;
    case "optional":
      return `[ ${formatNode(node.value)} ]`;
    case "repeat":
      return `{ ${formatNode(node.value)} }`;
    case "range":
      return `${formatNode(node.start)} … ${formatNode(node.end)}`;
    case "sequence":
      return node.items.map(formatNode).join(" ");
    case "choice":
      return node.options.map(formatNode).join(" | ");
    default:
      throw new TypeError(`Unknown grammar node: ${node.kind}`);
  }
}

export class GrammarCatalog {
  constructor(metadata, productions) {
    this.metadata = metadata;
    this.productions = productions;
  }

  has(name) {
    return Object.hasOwn(this.productions, name);
  }

  get(name) {
    if (!this.has(name)) throw new RangeError(`Unknown Go production: ${name}`);
    return this.productions[name];
  }

  references(name) {
    return [...collectReferences(this.get(name), new Set())];
  }

  format(name) {
    return `${name} = ${formatNode(this.get(name))} .`;
  }
}
