# Rex (ریکس) v5.0 — The World's #1 Simplest Programming Language



**If you can read English, you can code in Rex.**

Created by **Director Abdullah Anser** & **Box (CEO)** — August 15, 2026

---

## Why Rex?

| Language | Hello World |
|----------|------------|
| Java | `System.out.println("Hello World");` |
| JavaScript | `console.log("Hello World")` |
| Python | `print("Hello World")` |
| **Rex** | `p Hello World` |

No semicolons. No brackets. No quotes needed. Just write.

---

## Features

- **Ultra-short print**: `p Hello` — no quotes, no parentheses
- **Variable interpolation**: `p {name}` — print variable values
- **Variables**: just `x = 10` — no keyword needed
- **If/Else**: `if x > 5` ... `else` ... `end`
- **Loops**: `repeat 5`, `while x < 10`, `each item in list`
- **Functions**: `func name(params)` ... `end`
- **Lists**: `["apple", "banana", "mango"]`
- **Try/Catch**: `try` ... `catch` ... `end`
- **File I/O**: `readfile()`, `writefile()`
- **Math**: `sqrt()`, `abs()`, `random()`, `pow()`
- **Rex Web**: Write HTML in Rex syntax (`.rexweb` files)
- **Rex Style**: Write CSS in Rex syntax (style blocks)
- **Rex Logic**: Write JavaScript in Rex syntax (script blocks)
- **Live Server**: `node rex.js serve .` — serves `.rexweb` as live HTML
- **Urdu Keywords**: `agar` (if), `jab` (while), `khatam` (end), `dikha` (print)

---

## Installation

### Install from VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Rex Programming Language"
4. Click Install

### Install from VSIX file
```bash
code --install rex-language-5.0.0.vsix
```

### Manual install
1. Clone this repository
2. Copy to `~/.vscode/extensions/rex-language/`
3. Restart VS Code

---

## Usage

### Run a Rex file
1. Open any `.rex` file
2. Press `Ctrl+Shift+R` or right-click → "Rex: Run File"

### Convert RexWeb to HTML
1. Open any `.rexweb` file
2. Right-click → "Rex: Convert RexWeb to HTML"

### Start Live Server
1. Command Palette (Ctrl+Shift+P) → "Rex: Start Live Server"
2. Opens `http://localhost:8000` in your browser
3. `.rexweb` files render as full HTML pages

---

## Quick Examples

### Hello World
```
p Hello World
```

### Variables
```
x = 10
name = Abdullah
p Name: {name}, Age: {x}
```

### If/Else
```
if age >= 18
  p Adult
else
  p Minor
end
```

### Functions
```
func greet(name)
  p Hello {name}
  return "Done"
end
greet("Director")
```

### Factorial
```
func factorial(n)
  if n <= 1
    return 1
  else
    return n * factorial(n - 1)
  end
end
p 5! = {factorial(5)}
```

### Rex Web Page
```
page
  header
    heading "My Website"
  end
  card
    paragraph "Built with Rex!"
    button "Click Me" click: hello()
  end
end

style
heading: color: cyan, font-size: 32px
button: background: blue, color: white
end

script
func hello()
  alert("Hello from Rex!")
end
end
```

---

## Run from Command Line

```bash
# Run a Rex script
node rex.js run hello.rex

# Convert RexWeb to HTML
node rex.js web page.rexweb

# Start live server
node rex.js serve .

# Interactive REPL
node rex.js repl

# Run tests
node rex.js test
```

---

## License

MIT License — Free to use, modify, and distribute.

---

## Credits

- **Creator**: Director Abdullah Anser
- **Co-creator**: Box (AI CEO)
- **Company**: Digital Creators
- **Date**: August 15, 2026

*Rex — The world's simplest language. Now go build something.*
