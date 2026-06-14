// Generated Go 1.26.4 standard-library data. Do not edit.
export const standardLibraryMetadata = Object.freeze({
  "toolchain": "go version go1.26.4 windows/amd64",
  "packages": [
    "strings",
    "strconv",
    "sort",
    "math",
    "bytes"
  ],
  "functionCount": 236
});

export const standardLibrary = Object.freeze({
  "bytes": [
    {
      "name": "Clone",
      "params": [
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "Compare",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "Contains",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "ContainsAny",
      "params": [
        "[]byte",
        "string"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "ContainsFunc",
      "params": [
        "[]byte",
        "func(rune) bool"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "ContainsRune",
      "params": [
        "[]byte",
        "rune"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "Count",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "Cut",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "[]byte",
        "[]byte",
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "CutPrefix",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "[]byte",
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "CutSuffix",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "[]byte",
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "Equal",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "EqualFold",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "Fields",
      "params": [
        "[]byte"
      ],
      "results": [
        "[][]byte"
      ],
      "variadic": false
    },
    {
      "name": "FieldsFunc",
      "params": [
        "[]byte",
        "func(rune) bool"
      ],
      "results": [
        "[][]byte"
      ],
      "variadic": false
    },
    {
      "name": "FieldsFuncSeq",
      "params": [
        "[]byte",
        "func(rune) bool"
      ],
      "results": [
        "iter.Seq[[]byte]"
      ],
      "variadic": false
    },
    {
      "name": "FieldsSeq",
      "params": [
        "[]byte"
      ],
      "results": [
        "iter.Seq[[]byte]"
      ],
      "variadic": false
    },
    {
      "name": "HasPrefix",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "HasSuffix",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "Index",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "IndexAny",
      "params": [
        "[]byte",
        "string"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "IndexByte",
      "params": [
        "[]byte",
        "byte"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "IndexFunc",
      "params": [
        "[]byte",
        "func(r rune) bool"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "IndexRune",
      "params": [
        "[]byte",
        "rune"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "Join",
      "params": [
        "[][]byte",
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "LastIndex",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "LastIndexAny",
      "params": [
        "[]byte",
        "string"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "LastIndexByte",
      "params": [
        "[]byte",
        "byte"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "LastIndexFunc",
      "params": [
        "[]byte",
        "func(r rune) bool"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "Lines",
      "params": [
        "[]byte"
      ],
      "results": [
        "iter.Seq[[]byte]"
      ],
      "variadic": false
    },
    {
      "name": "Map",
      "params": [
        "func(r rune) rune",
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "NewBuffer",
      "params": [
        "[]byte"
      ],
      "results": [
        "*bytes.Buffer"
      ],
      "variadic": false
    },
    {
      "name": "NewBufferString",
      "params": [
        "string"
      ],
      "results": [
        "*bytes.Buffer"
      ],
      "variadic": false
    },
    {
      "name": "NewReader",
      "params": [
        "[]byte"
      ],
      "results": [
        "*bytes.Reader"
      ],
      "variadic": false
    },
    {
      "name": "Repeat",
      "params": [
        "[]byte",
        "int"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "Replace",
      "params": [
        "[]byte",
        "[]byte",
        "[]byte",
        "int"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "ReplaceAll",
      "params": [
        "[]byte",
        "[]byte",
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "Runes",
      "params": [
        "[]byte"
      ],
      "results": [
        "[]rune"
      ],
      "variadic": false
    },
    {
      "name": "Split",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "[][]byte"
      ],
      "variadic": false
    },
    {
      "name": "SplitAfter",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "[][]byte"
      ],
      "variadic": false
    },
    {
      "name": "SplitAfterN",
      "params": [
        "[]byte",
        "[]byte",
        "int"
      ],
      "results": [
        "[][]byte"
      ],
      "variadic": false
    },
    {
      "name": "SplitAfterSeq",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "iter.Seq[[]byte]"
      ],
      "variadic": false
    },
    {
      "name": "SplitN",
      "params": [
        "[]byte",
        "[]byte",
        "int"
      ],
      "results": [
        "[][]byte"
      ],
      "variadic": false
    },
    {
      "name": "SplitSeq",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "iter.Seq[[]byte]"
      ],
      "variadic": false
    },
    {
      "name": "Title",
      "params": [
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "ToLower",
      "params": [
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "ToLowerSpecial",
      "params": [
        "unicode.SpecialCase",
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "ToTitle",
      "params": [
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "ToTitleSpecial",
      "params": [
        "unicode.SpecialCase",
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "ToUpper",
      "params": [
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "ToUpperSpecial",
      "params": [
        "unicode.SpecialCase",
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "ToValidUTF8",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "Trim",
      "params": [
        "[]byte",
        "string"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "TrimFunc",
      "params": [
        "[]byte",
        "func(r rune) bool"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "TrimLeft",
      "params": [
        "[]byte",
        "string"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "TrimLeftFunc",
      "params": [
        "[]byte",
        "func(r rune) bool"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "TrimPrefix",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "TrimRight",
      "params": [
        "[]byte",
        "string"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "TrimRightFunc",
      "params": [
        "[]byte",
        "func(r rune) bool"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "TrimSpace",
      "params": [
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "TrimSuffix",
      "params": [
        "[]byte",
        "[]byte"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    }
  ],
  "math": [
    {
      "name": "Abs",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Acos",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Acosh",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Asin",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Asinh",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Atan",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Atan2",
      "params": [
        "float64",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Atanh",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Cbrt",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Ceil",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Copysign",
      "params": [
        "float64",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Cos",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Cosh",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Dim",
      "params": [
        "float64",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Erf",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Erfc",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Erfcinv",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Erfinv",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Exp",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Exp2",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Expm1",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "FMA",
      "params": [
        "float64",
        "float64",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Float32bits",
      "params": [
        "float32"
      ],
      "results": [
        "uint32"
      ],
      "variadic": false
    },
    {
      "name": "Float32frombits",
      "params": [
        "uint32"
      ],
      "results": [
        "float32"
      ],
      "variadic": false
    },
    {
      "name": "Float64bits",
      "params": [
        "float64"
      ],
      "results": [
        "uint64"
      ],
      "variadic": false
    },
    {
      "name": "Float64frombits",
      "params": [
        "uint64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Floor",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Frexp",
      "params": [
        "float64"
      ],
      "results": [
        "float64",
        "int"
      ],
      "variadic": false
    },
    {
      "name": "Gamma",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Hypot",
      "params": [
        "float64",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Ilogb",
      "params": [
        "float64"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "Inf",
      "params": [
        "int"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "IsInf",
      "params": [
        "float64",
        "int"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "IsNaN",
      "params": [
        "float64"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "J0",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "J1",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Jn",
      "params": [
        "int",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Ldexp",
      "params": [
        "float64",
        "int"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Lgamma",
      "params": [
        "float64"
      ],
      "results": [
        "float64",
        "int"
      ],
      "variadic": false
    },
    {
      "name": "Log",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Log10",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Log1p",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Log2",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Logb",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Max",
      "params": [
        "float64",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Min",
      "params": [
        "float64",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Mod",
      "params": [
        "float64",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Modf",
      "params": [
        "float64"
      ],
      "results": [
        "float64",
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "NaN",
      "params": [],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Nextafter",
      "params": [
        "float64",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Nextafter32",
      "params": [
        "float32",
        "float32"
      ],
      "results": [
        "float32"
      ],
      "variadic": false
    },
    {
      "name": "Pow",
      "params": [
        "float64",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Pow10",
      "params": [
        "int"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Remainder",
      "params": [
        "float64",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Round",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "RoundToEven",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Signbit",
      "params": [
        "float64"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "Sin",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Sincos",
      "params": [
        "float64"
      ],
      "results": [
        "float64",
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Sinh",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Sqrt",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Tan",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Tanh",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Trunc",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Y0",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Y1",
      "params": [
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    },
    {
      "name": "Yn",
      "params": [
        "int",
        "float64"
      ],
      "results": [
        "float64"
      ],
      "variadic": false
    }
  ],
  "sort": [
    {
      "name": "Find",
      "params": [
        "int",
        "func(int) int"
      ],
      "results": [
        "int",
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "Float64s",
      "params": [
        "[]float64"
      ],
      "results": [],
      "variadic": false
    },
    {
      "name": "Float64sAreSorted",
      "params": [
        "[]float64"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "Ints",
      "params": [
        "[]int"
      ],
      "results": [],
      "variadic": false
    },
    {
      "name": "IntsAreSorted",
      "params": [
        "[]int"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "IsSorted",
      "params": [
        "sort.Interface"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "Reverse",
      "params": [
        "sort.Interface"
      ],
      "results": [
        "sort.Interface"
      ],
      "variadic": false
    },
    {
      "name": "Search",
      "params": [
        "int",
        "func(int) bool"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "SearchFloat64s",
      "params": [
        "[]float64",
        "float64"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "SearchInts",
      "params": [
        "[]int",
        "int"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "SearchStrings",
      "params": [
        "[]string",
        "string"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "Slice",
      "params": [
        "any",
        "func(i int, j int) bool"
      ],
      "results": [],
      "variadic": false
    },
    {
      "name": "SliceIsSorted",
      "params": [
        "any",
        "func(i int, j int) bool"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "SliceStable",
      "params": [
        "any",
        "func(i int, j int) bool"
      ],
      "results": [],
      "variadic": false
    },
    {
      "name": "Sort",
      "params": [
        "sort.Interface"
      ],
      "results": [],
      "variadic": false
    },
    {
      "name": "Stable",
      "params": [
        "sort.Interface"
      ],
      "results": [],
      "variadic": false
    },
    {
      "name": "Strings",
      "params": [
        "[]string"
      ],
      "results": [],
      "variadic": false
    },
    {
      "name": "StringsAreSorted",
      "params": [
        "[]string"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    }
  ],
  "strconv": [
    {
      "name": "AppendBool",
      "params": [
        "[]byte",
        "bool"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "AppendFloat",
      "params": [
        "[]byte",
        "float64",
        "byte",
        "int",
        "int"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "AppendInt",
      "params": [
        "[]byte",
        "int64",
        "int"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "AppendQuote",
      "params": [
        "[]byte",
        "string"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "AppendQuoteRune",
      "params": [
        "[]byte",
        "rune"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "AppendQuoteRuneToASCII",
      "params": [
        "[]byte",
        "rune"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "AppendQuoteRuneToGraphic",
      "params": [
        "[]byte",
        "rune"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "AppendQuoteToASCII",
      "params": [
        "[]byte",
        "string"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "AppendQuoteToGraphic",
      "params": [
        "[]byte",
        "string"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "AppendUint",
      "params": [
        "[]byte",
        "uint64",
        "int"
      ],
      "results": [
        "[]byte"
      ],
      "variadic": false
    },
    {
      "name": "Atoi",
      "params": [
        "string"
      ],
      "results": [
        "int",
        "error"
      ],
      "variadic": false
    },
    {
      "name": "CanBackquote",
      "params": [
        "string"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "FormatBool",
      "params": [
        "bool"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "FormatComplex",
      "params": [
        "complex128",
        "byte",
        "int",
        "int"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "FormatFloat",
      "params": [
        "float64",
        "byte",
        "int",
        "int"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "FormatInt",
      "params": [
        "int64",
        "int"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "FormatUint",
      "params": [
        "uint64",
        "int"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "IsGraphic",
      "params": [
        "rune"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "IsPrint",
      "params": [
        "rune"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "Itoa",
      "params": [
        "int"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "ParseBool",
      "params": [
        "string"
      ],
      "results": [
        "bool",
        "error"
      ],
      "variadic": false
    },
    {
      "name": "ParseComplex",
      "params": [
        "string",
        "int"
      ],
      "results": [
        "complex128",
        "error"
      ],
      "variadic": false
    },
    {
      "name": "ParseFloat",
      "params": [
        "string",
        "int"
      ],
      "results": [
        "float64",
        "error"
      ],
      "variadic": false
    },
    {
      "name": "ParseInt",
      "params": [
        "string",
        "int",
        "int"
      ],
      "results": [
        "int64",
        "error"
      ],
      "variadic": false
    },
    {
      "name": "ParseUint",
      "params": [
        "string",
        "int",
        "int"
      ],
      "results": [
        "uint64",
        "error"
      ],
      "variadic": false
    },
    {
      "name": "Quote",
      "params": [
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "QuoteRune",
      "params": [
        "rune"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "QuoteRuneToASCII",
      "params": [
        "rune"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "QuoteRuneToGraphic",
      "params": [
        "rune"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "QuoteToASCII",
      "params": [
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "QuoteToGraphic",
      "params": [
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "QuotedPrefix",
      "params": [
        "string"
      ],
      "results": [
        "string",
        "error"
      ],
      "variadic": false
    },
    {
      "name": "Unquote",
      "params": [
        "string"
      ],
      "results": [
        "string",
        "error"
      ],
      "variadic": false
    },
    {
      "name": "UnquoteChar",
      "params": [
        "string",
        "byte"
      ],
      "results": [
        "rune",
        "bool",
        "string",
        "error"
      ],
      "variadic": false
    }
  ],
  "strings": [
    {
      "name": "Clone",
      "params": [
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "Compare",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "Contains",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "ContainsAny",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "ContainsFunc",
      "params": [
        "string",
        "func(rune) bool"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "ContainsRune",
      "params": [
        "string",
        "rune"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "Count",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "Cut",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "string",
        "string",
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "CutPrefix",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "string",
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "CutSuffix",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "string",
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "EqualFold",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "Fields",
      "params": [
        "string"
      ],
      "results": [
        "[]string"
      ],
      "variadic": false
    },
    {
      "name": "FieldsFunc",
      "params": [
        "string",
        "func(rune) bool"
      ],
      "results": [
        "[]string"
      ],
      "variadic": false
    },
    {
      "name": "FieldsFuncSeq",
      "params": [
        "string",
        "func(rune) bool"
      ],
      "results": [
        "iter.Seq[string]"
      ],
      "variadic": false
    },
    {
      "name": "FieldsSeq",
      "params": [
        "string"
      ],
      "results": [
        "iter.Seq[string]"
      ],
      "variadic": false
    },
    {
      "name": "HasPrefix",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "HasSuffix",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "bool"
      ],
      "variadic": false
    },
    {
      "name": "Index",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "IndexAny",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "IndexByte",
      "params": [
        "string",
        "byte"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "IndexFunc",
      "params": [
        "string",
        "func(rune) bool"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "IndexRune",
      "params": [
        "string",
        "rune"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "Join",
      "params": [
        "[]string",
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "LastIndex",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "LastIndexAny",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "LastIndexByte",
      "params": [
        "string",
        "byte"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "LastIndexFunc",
      "params": [
        "string",
        "func(rune) bool"
      ],
      "results": [
        "int"
      ],
      "variadic": false
    },
    {
      "name": "Lines",
      "params": [
        "string"
      ],
      "results": [
        "iter.Seq[string]"
      ],
      "variadic": false
    },
    {
      "name": "Map",
      "params": [
        "func(rune) rune",
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "NewReader",
      "params": [
        "string"
      ],
      "results": [
        "*strings.Reader"
      ],
      "variadic": false
    },
    {
      "name": "NewReplacer",
      "params": [
        "[]string"
      ],
      "results": [
        "*strings.Replacer"
      ],
      "variadic": true
    },
    {
      "name": "Repeat",
      "params": [
        "string",
        "int"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "Replace",
      "params": [
        "string",
        "string",
        "string",
        "int"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "ReplaceAll",
      "params": [
        "string",
        "string",
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "Split",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "[]string"
      ],
      "variadic": false
    },
    {
      "name": "SplitAfter",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "[]string"
      ],
      "variadic": false
    },
    {
      "name": "SplitAfterN",
      "params": [
        "string",
        "string",
        "int"
      ],
      "results": [
        "[]string"
      ],
      "variadic": false
    },
    {
      "name": "SplitAfterSeq",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "iter.Seq[string]"
      ],
      "variadic": false
    },
    {
      "name": "SplitN",
      "params": [
        "string",
        "string",
        "int"
      ],
      "results": [
        "[]string"
      ],
      "variadic": false
    },
    {
      "name": "SplitSeq",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "iter.Seq[string]"
      ],
      "variadic": false
    },
    {
      "name": "Title",
      "params": [
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "ToLower",
      "params": [
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "ToLowerSpecial",
      "params": [
        "unicode.SpecialCase",
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "ToTitle",
      "params": [
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "ToTitleSpecial",
      "params": [
        "unicode.SpecialCase",
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "ToUpper",
      "params": [
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "ToUpperSpecial",
      "params": [
        "unicode.SpecialCase",
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "ToValidUTF8",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "Trim",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "TrimFunc",
      "params": [
        "string",
        "func(rune) bool"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "TrimLeft",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "TrimLeftFunc",
      "params": [
        "string",
        "func(rune) bool"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "TrimPrefix",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "TrimRight",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "TrimRightFunc",
      "params": [
        "string",
        "func(rune) bool"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "TrimSpace",
      "params": [
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    },
    {
      "name": "TrimSuffix",
      "params": [
        "string",
        "string"
      ],
      "results": [
        "string"
      ],
      "variadic": false
    }
  ]
});
