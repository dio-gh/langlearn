package main

import (
	"encoding/json"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"unicode"
)

type counts map[string]int

type counter struct {
	values counts
	seen   map[string]bool
}

type vocabulary struct {
	Packages  []string `json:"packages"`
	Variables []string `json:"variables"`
	Functions []string `json:"functions"`
	Methods   []string `json:"methods"`
	Types     []string `json:"types"`
	Fields    []string `json:"fields"`
}

var blocked = map[string]bool{
	"_": true, "any": true, "append": true, "bool": true, "byte": true,
	"cap": true, "close": true, "comparable": true, "complex": true,
	"complex64": true, "complex128": true, "copy": true, "delete": true,
	"dst": true, "err": true, "error": true, "false": true, "float32": true,
	"float64": true, "imag": true, "init": true, "int": true, "int8": true,
	"int16": true, "int32": true, "int64": true, "iota": true, "len": true,
	"main": true, "make": true, "new": true, "nil": true, "ok": true,
	"panic": true, "print": true, "println": true, "ptr": true, "real": true,
	"recover": true, "rune": true, "src": true, "string": true, "tmp": true,
	"true": true, "uint": true, "uint8": true, "uint16": true, "uint32": true,
	"uint64": true, "uintptr": true,
}

var blockedRoots = map[string]bool{
	"cmd": true, "internal": true, "runtime": true, "syscall": true,
	"testdata": true, "unsafe": true, "vendor": true,
}

var preferredPackages = map[string]bool{
	"atomic": true, "base64": true, "big": true, "binary": true,
	"bits": true, "bufio": true, "build": true, "bytes": true,
	"cgi": true, "cipher": true, "color": true, "comment": true,
	"context": true, "crypto": true, "csv": true, "doc": true,
	"draw": true, "errors": true, "exec": true, "filepath": true,
	"flag": true, "flate": true, "fmt": true, "gob": true,
	"gzip": true, "heap": true, "hex": true, "html": true,
	"http": true, "image": true, "jpeg": true, "json": true,
	"list": true, "log": true, "maps": true, "math": true,
	"mime": true, "multipart": true, "net": true, "os": true,
	"parser": true, "path": true, "printer": true, "rand": true,
	"reflect": true, "regexp": true, "ring": true, "scanner": true,
	"signal": true, "slices": true, "sort": true, "strconv": true,
	"strings": true, "sync": true, "tar": true, "template": true,
	"textproto": true, "time": true, "token": true, "types": true,
	"unicode": true, "url": true, "user": true, "xml": true, "zip": true,
}

func newCounter() *counter {
	return &counter{values: counts{}, seen: map[string]bool{}}
}

func (table *counter) add(scope, name string) {
	key := scope + "\x00" + name
	if name != "" && !table.seen[key] {
		table.seen[key] = true
		table.values[name]++
	}
}

func addFields(table *counter, scope string, fields *ast.FieldList) {
	if fields == nil {
		return
	}
	for _, field := range fields.List {
		for _, name := range field.Names {
			table.add(scope, name.Name)
		}
	}
}

func readable(name, category string) bool {
	if blocked[name] || !token.IsIdentifier(name) || token.Lookup(name).IsKeyword() {
		return false
	}
	if len(name) > 18 {
		return false
	}
	for index, value := range name {
		allowed := unicode.IsLetter(value) || (category == "packages" && index > 0 && unicode.IsDigit(value))
		if value > unicode.MaxASCII || !allowed {
			return false
		}
	}
	for index := 1; index < len(name); index++ {
		if unicode.IsUpper(rune(name[index-1])) && unicode.IsUpper(rune(name[index])) {
			return false
		}
	}
	lower := strings.ToLower(name)
	if strings.HasPrefix(lower, "test") ||
		strings.HasPrefix(lower, "benchmark") ||
		strings.HasPrefix(lower, "example") ||
		strings.HasPrefix(lower, "must") ||
		strings.HasPrefix(lower, "zz") {
		return false
	}
	if category == "packages" {
		return preferredPackages[name]
	}
	if category == "functions" || category == "methods" {
		return len(name) >= 3
	}
	return len(name) >= 4
}

func ranked(table counts, category string, limit int) []string {
	names := make([]string, 0, len(table))
	for name := range table {
		if readable(name, category) {
			names = append(names, name)
		}
	}
	sort.Slice(names, func(left, right int) bool {
		if table[names[left]] != table[names[right]] {
			return table[names[left]] > table[names[right]]
		}
		return names[left] < names[right]
	})
	if len(names) > limit {
		names = names[:limit]
	}
	return names
}

func publicStandardLibrary(root, path string) bool {
	relative, err := filepath.Rel(root, path)
	if err != nil {
		return false
	}
	slash := filepath.ToSlash(relative)
	first := strings.Split(slash, "/")[0]
	return !blockedRoots[first] &&
		!strings.Contains(slash, "/internal/") &&
		!strings.Contains(slash, "/vendor/") &&
		!strings.Contains(slash, "/testdata/") &&
		!strings.Contains(slash, "/cmd/")
}

func main() {
	root := filepath.Join(runtime.GOROOT(), "src")
	packages := counts{}
	variables := newCounter()
	functions := newCounter()
	methods := newCounter()
	types := newCounter()
	fields := newCounter()

	_ = filepath.WalkDir(root, func(path string, entry os.DirEntry, walkErr error) error {
		if walkErr != nil {
			return nil
		}
		if entry.IsDir() {
			if path != root && !publicStandardLibrary(root, path+string(filepath.Separator)) {
				return filepath.SkipDir
			}
			return nil
		}
		if !publicStandardLibrary(root, path) ||
			!strings.HasSuffix(entry.Name(), ".go") ||
			strings.HasSuffix(entry.Name(), "_test.go") {
			return nil
		}

		file, err := parser.ParseFile(token.NewFileSet(), path, nil, parser.ParseComments)
		if err != nil || ast.IsGenerated(file) {
			return nil
		}
		scope, _ := filepath.Rel(root, filepath.Dir(path))
		packages[file.Name.Name]++
		ast.Inspect(file, func(node ast.Node) bool {
			switch value := node.(type) {
			case *ast.FuncDecl:
				if value.Recv == nil {
					functions.add(scope, value.Name.Name)
				} else {
					methods.add(scope, value.Name.Name)
					addFields(variables, scope, value.Recv)
				}
			case *ast.FuncType:
				addFields(variables, scope, value.Params)
				addFields(variables, scope, value.Results)
			case *ast.TypeSpec:
				types.add(scope, value.Name.Name)
			case *ast.ValueSpec:
				for _, name := range value.Names {
					variables.add(scope, name.Name)
				}
			case *ast.AssignStmt:
				if value.Tok == token.DEFINE {
					for _, expression := range value.Lhs {
						if name, ok := expression.(*ast.Ident); ok {
							variables.add(scope, name.Name)
						}
					}
				}
			case *ast.RangeStmt:
				if value.Tok == token.DEFINE {
					if name, ok := value.Key.(*ast.Ident); ok {
						variables.add(scope, name.Name)
					}
					if name, ok := value.Value.(*ast.Ident); ok {
						variables.add(scope, name.Name)
					}
				}
			case *ast.StructType:
				addFields(fields, scope, value.Fields)
			}
			return true
		})
		return nil
	})

	output := vocabulary{
		Packages:  ranked(packages, "packages", 64),
		Variables: ranked(variables.values, "variables", 96),
		Functions: ranked(functions.values, "functions", 96),
		Methods:   ranked(methods.values, "methods", 96),
		Types:     ranked(types.values, "types", 96),
		Fields:    ranked(fields.values, "fields", 96),
	}
	_ = json.NewEncoder(os.Stdout).Encode(output)
}
