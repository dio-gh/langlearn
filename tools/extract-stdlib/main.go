package main

import (
	"encoding/json"
	"fmt"
	"go/importer"
	"go/types"
	"os"
	"sort"
)

type function struct {
	Name     string   `json:"name"`
	Params   []string `json:"params"`
	Results  []string `json:"results"`
	Variadic bool     `json:"variadic"`
}

func typeName(t types.Type) string {
	return types.TypeString(t, func(p *types.Package) string {
		return p.Name()
	})
}

func tupleNames(tuple *types.Tuple) []string {
	names := make([]string, tuple.Len())
	for i := 0; i < tuple.Len(); i++ {
		names[i] = typeName(tuple.At(i).Type())
	}
	return names
}

func main() {
	result := map[string][]function{}
	for _, path := range os.Args[1:] {
		pkg, err := importer.Default().Import(path)
		if err != nil {
			fmt.Fprintf(os.Stderr, "%s: %v\n", path, err)
			os.Exit(1)
		}
		names := pkg.Scope().Names()
		sort.Strings(names)
		for _, name := range names {
			object := pkg.Scope().Lookup(name)
			fn, ok := object.(*types.Func)
			if !ok || !fn.Exported() {
				continue
			}
			signature, ok := fn.Type().(*types.Signature)
			if !ok || signature.TypeParams().Len() > 0 {
				continue
			}
			result[path] = append(result[path], function{
				Name:     name,
				Params:   tupleNames(signature.Params()),
				Results:  tupleNames(signature.Results()),
				Variadic: signature.Variadic(),
			})
		}
	}
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(result); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
