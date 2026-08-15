# Rex (ریکس) v5.0

> The World's Simplest Programming Language — No semicolons. No brackets. No quotes needed.

Rex is a unified programming language designed to replace Python, HTML, CSS, and JavaScript with one simple, intuitive syntax. Write web pages, logic, functions, and styles — all in plain English.

Created by **Abdullah Anser** (Director) and **Box** (AI CEO) at **Digital Creators**.

## Features

- *No semicolons, no brackets, no quotes* — just plain readable text
- *Unified language* — HTML, CSS, and JavaScript in one syntax
- *Bilingual keywords* — works in English AND Urdu (e.g., `p` / `dikha` for print)
- *Auto-generation* — skip CSS and Rex creates a beautiful dark theme automatically; skip JS and Rex adds interactions
- *Live server* — built-in dev server for `.rexweb` files
- *VS Code extension* — syntax highlighting, snippets, run from editor (Ctrl+Shift+R)
- *Two interpreters* — Python (`rex.py`) and JavaScript (`rex.js`) — zero dependencies

## Quick Start

### Print
```rex
p Hello World
x = 42
p The answer is {x}
```

### Variables & Math
```rex
name = Abdullah
age = 25
p {name} is {age} years old
p {age + 5} years from now
```

### If / Else
```rex
if age >= 18
  p You are an adult
else
  p You are a minor
end
```

### Loops
```rex
repeat 5 times
  p Hello
end

each fruit in [apple banana cherry]
  p Fruit: {fruit}
end

i = 0
while i < 10
  p Count: {i}
  i = i + 1
end
```

### Functions
```rex
func greet(name)
  p Hello {name}!
end

greet(World)

func factorial(n)
  if n <= 1
    return 1
  end
  return n * factorial(n - 1)
end

p {factorial(5)}
```

### Web Pages (.rexweb)
```rex
page
  header
    heading "My Website"
  end
  card
    paragraph "Welcome to Rex"
    button "Click Me" click: sayHi()
  end
end

style
body: background: #1a1a2e color: white padding: 20px
card: background: rgba(255,255,255,0.05) radius: 15px padding: 25px
button: background: #0f3460 color: white radius: 8px
end

script
func sayHi()
  alert("Hello from Rex!")
end
end
```

### Try/Catch
```rex
try
  p {10 / 0}
catch
  p Cannot divide by zero
end
```

## Running Rex

### With Python
```bash
python3 rex.py run myfile.rex
python3 rex.py serve mypage.rexweb
python3 rex.py test
```

### With Node.js
```bash
node rex.js run myfile.rex
node rex.js serve mypage.rexweb
node rex.js test
```

## VS Code Extension

Install `rex-language-5.0.0.vsix` from the `rex-vscode/` folder:

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Click "..." > "Install from VSIX"
4. Select `rex-language-5.0.0.vsix`

Features:
- Syntax highlighting for `.rex` and `.rexweb` files
- Code snippets for functions, loops, if/else, web blocks
- Run from editor: `Ctrl+Shift+R`
- Live server for `.rexweb` files

## Language Reference

| Keyword | Purpose |
|---------|---------|
| `p` / `dikha` | Print output |
| `=` | Variable assignment |
| `if` / `agar` | Conditional |
| `else` / `warna` | Else branch |
| `repeat` | Fixed count loop |
| `while` / `jab` | Conditional loop |
| `each` | Iterate list |
| `func` / `kaam` | Define function |
| `return` / `wapas` | Return value |
| `end` / `khatam` | Close block |
| `try` / `koshish` | Error handling |
| `catch` / `pakar` | Catch errors |
| `page` | Web page block |
| `style` | CSS block |
| `script` | JS block |

## Built-in Functions

`sqrt`, `abs`, `pow`, `max`, `min`, `round`, `floor`, `ceil`, `random`, `range`, `len`, `upper`, `lower`, `find`, `cut`, `push`, `sort`, `reverse`, `type`

## License

MIT License — see [LICENSE](LICENSE)

## Credits

- **Creator:** Abdullah Anser (Director, Digital Creators)
- **Co-creator:** Box (AI CEO)
- **Company:** Digital Creators — Digital Creative Agency

---

*Rex — because code should feel like English.*
