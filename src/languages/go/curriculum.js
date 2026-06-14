const syntax = [
  ["package", "pkg", "PackageClause", "package"],
  ["short", ":=", "ShortVarDecl", "statement"],
  ["variable", "var", "VarDecl", "declaration"],
  ["constant", "const", "ConstDecl", "declaration"],
  ["expression", "+", "Expression", "expression"],
  ["function", "func", "FunctionDecl", "declaration"],
  ["branch", "if", "IfStmt", "statement"],
  ["loop", "for", "ForStmt", "statement"],
  ["range", "range", "RangeClause", "range"],
  ["slice", "[]", "SliceType", "type"],
  ["map", "map", "MapType", "type"],
  ["struct", "struct", "StructType", "type"],
  ["method", "()", "MethodDecl", "declaration"],
  ["interface", "interface", "InterfaceType", "type"],
  ["pointer", "*", "PointerType", "type"],
  ["defer", "defer", "DeferStmt", "statement"],
  ["goroutine", "go", "GoStmt", "statement"],
  ["channel", "<-", "ChannelType", "type"],
  ["select", "select", "SelectStmt", "statement"],
  ["generic", "[T]", "TypeParameters", "typeParameters"],
  ["file", "main.go", "SourceFile", "file"],
].map(([id, glyph, production, context], index) => ({
  id,
  glyph,
  production,
  context,
  mode: "syntax",
  expansion: {
    profile: id === "expression" ? "expression" : ["defer", "goroutine"].includes(id) ? "call" : "simple",
    complexity: id === "expression" ? 0.12 : Math.min(0.15 + index * 0.014, 0.42),
    maxDepth: 7 + Math.floor(index / 6),
    maxRepeat: index < 5 ? 1 : 2,
    maxTokens: 36 + index * 3,
  },
}));

const meaning = [
  ["values", "1+1", "Expression", "expression"],
  ["branches", "if?", "IfStmt", "branch"],
  ["loops", "loop", "ForStmt", "loop"],
  ["slices", "len", "SliceType", "slice"],
  ["maps", "k:v", "MapType", "map"],
  ["defer", "LIFO", "DeferStmt", "defer"],
  ["closures", "fn", "FunctionLit", "closure"],
  ["channels", "<-", "SendStmt", "channel"],
].map(([id, glyph, production, family]) => ({
  id,
  glyph,
  production,
  family,
  mode: "meaning",
}));

const library = [
  ["strings", "strings.", "strings"],
  ["strconv", "strconv.", "strconv"],
  ["sort", "sort.", "sort"],
  ["math", "math.", "math"],
  ["bytes", "bytes.", "bytes"],
].map(([id, glyph, packagePath]) => ({
  id,
  glyph,
  production: "Selector",
  packagePath,
  mode: "library",
}));

export const tracks = [
  { id: "syntax", label: "Syntax", description: "Recognize and construct valid forms", stages: syntax },
  { id: "meaning", label: "Behavior", description: "Predict what generated code does", stages: meaning },
  { id: "library", label: "Library", description: "Complete standard-library calls", stages: library },
];
