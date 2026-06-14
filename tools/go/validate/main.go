package main

import (
	"encoding/json"
	"fmt"
	"go/ast"
	"go/importer"
	"go/parser"
	"go/token"
	"go/types"
	"os"
)

type request struct {
	ID     string `json:"id"`
	Mode   string `json:"mode"`
	Source string `json:"source"`
}

type response struct {
	ID    string `json:"id"`
	Valid bool   `json:"valid"`
	Error string `json:"error,omitempty"`
}

func validate(item request) response {
	files := token.NewFileSet()
	file, err := parser.ParseFile(files, "generated.go", item.Source, parser.AllErrors)
	if err != nil {
		return response{ID: item.ID, Error: err.Error()}
	}
	if item.Mode == "parse" {
		return response{ID: item.ID, Valid: true}
	}
	if item.Mode != "typecheck" {
		return response{ID: item.ID, Error: "unknown validation mode"}
	}
	config := types.Config{Importer: importer.Default()}
	if _, err := config.Check("generated", files, []*ast.File{file}, nil); err != nil {
		return response{ID: item.ID, Error: err.Error()}
	}
	return response{ID: item.ID, Valid: true}
}

func main() {
	var requests []request
	if err := json.NewDecoder(os.Stdin).Decode(&requests); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	responses := make([]response, len(requests))
	for index, item := range requests {
		responses[index] = validate(item)
	}
	if err := json.NewEncoder(os.Stdout).Encode(responses); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
