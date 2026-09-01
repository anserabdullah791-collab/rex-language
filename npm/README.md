# Rex (ریکس) v6.0

> The World's Simplest Programming Language — No semicolons. No brackets. No quotes needed. Just write English.

Rex is a unified programming language designed to replace Python, HTML, CSS, and JavaScript with one simple, intuitive syntax. Write web pages, logic, functions, classes, and styles — all in plain English (or Urdu).

Created by **Abdullah Anser** (Director) and **Box** (AI CEO) at **Digital Creators**.

## What's New in v6.0

- **Cybersecurity Module** — `sha256()`, `sha512()`, `md5()`, `encrypt()`, `decrypt()`, `base64encode()`, `base64decode()`, `password()`, `uuid()`, `hmac()`, `sanitize()`, `token()`, `import crypto`
- **HTTP/Network** — `httpget()`, `httppost()`, `http()`, `fetch()`, `import http` with get/post/put/delete
- **Regex Support** — `rematch()`, `rereplace()`, `retest()`, `resplit()`, `import regex`
- **Logging System** — `log()`, `warn()`, `error()`, `debug()`, `import logger` with info/warn/error/debug/success/fatal
- **OS/System Module** — `platform()`, `cpu()`, `memory()`, `hostname()`, `uptime()`, `shell()`, `env()`, `args()`, `import os`
- **Color Module** — `hex()`, `rgb()`, `random()`, `invert()`, `lighten()`, `darken()`, `import color`
- **Advanced Math** — `clamp()`, `lerp()`, `maprange()`, `tofixed()`, `isfinite()`, `isnan()`
- **Advanced Strings** — `capitalize()`, `titlecase()`, `camelcase()`, `snakecase()`, `kebabcase()`, `pad()`, `count()`, `index()`
- **Data Structures** — `unique()`, `merge()`, `keys()`, `values()`, `entries()`, `set()`
- **File Operations** — `copyfile()`, `delfile()`, `mkdir()`, `filesize()`, `modified()`
- **System Access** — `whoami()`, `cwd()`, `shell()`, `env()`, `args()`
- **50 Tests Passing** — Full test suite covering all v5.1 + v6.0 features

### Also from v5.1 (still included)

- **Classes & OOP** — `class`, `new`, `this`, `extends`, inheritance, method overrides
- **Import System** — `import math`, `import json`, `import fs`, `import time`, `import string`
- **Match / Case** — Pattern matching like switch statements
- **JSON Support** — `jsonparse()` and `jsonstring()` built-in functions
- **Date/Time** — `today()`, `year()`, `clock()`, `now()`, `date()`, `month()`, `day()`, `hour()`
- **Enhanced Strings** — `.trim()`, `.starts()`, `.ends()`, `.repeat()`, `.replaceAll()`, `.format()`
- **Standard Library** — Built-in modules: `math`, `string`, `time`, `json`, `fs`

## Installation

### Via npm (recommended)
```bash
npm install -g rex-lang
```

Then use the `rex` command anywhere:
```bash
rex run myfile.rex
rex repl
rex test
rex web page.rexweb
rex serve .
```

### Direct with Node.js
```bash
node rex.js run myfile.rex
node rex.js test
```

---

## Full Language Guide

### 1. Print Output
The `p` command prints anything — no quotes needed.
```rex
p Hello World
p This is Rex v5.1
x = 42
p The answer is {x}
p {x + 8}
```

### 2. Variables
Just use `=` to assign. No `let`, `var`, or `const`.
```rex
name = Abdullah
age = 25
score = 95.5
is_active = true
items = [apple banana cherry]
```

### 3. String Interpolation
Use `{}` to embed any expression inside print statements.
```rex
name = Abdullah
p My name is {name}
p {name.upper}
p Length: {name.len}
p {10 * 3 + 2}
p {name.contains("dullah")}
```

### 4. Math Operations
```rex
p {10 + 5}      # 15
p {10 - 3}      # 7
p {10 * 2}      # 20
p {10 / 3}      # 3.333...
p {10 % 3}      # 1
p {2 ^ 10}      # 1024
```

### 5. Built-in Math Functions
```rex
p {sqrt(16)}        # 4
p {abs(-5)}          # 5
p {round(3.7)}       # 4
p {floor(3.9)}       # 3
p {ceil(3.1)}        # 4
p {pow(2, 10)}       # 1024
p {max(5, 10, 3)}    # 10
p {min(5, 10, 3)}    # 5
p {random(1, 100)}   # random number 1-100
p {pi()}             # 3.14159...
```

### 6. If / Else
```rex
score = 85

if score >= 90
  p A grade
else if score >= 80
  p B grade
else if score >= 70
  p C grade
else
  p Fail
end
```

### 7. Loops

#### While Loop
```rex
i = 0
while i < 10
  p Count: {i}
  i = i + 1
end
```

#### Repeat Loop
```rex
repeat 5 times
  p Hello
end
```

#### Each Loop (iterate lists)
```rex
fruits = [apple banana cherry mango]

each fruit in fruits
  p Fruit: {fruit}
end
```

### 8. Break & Skip
```rex
i = 1
while i <= 100
  if i == 5
    break
  end
  p Loop: {i}
  i = i + 1
end

each num in range(1, 10)
  if num % 2 == 0
    skip
  end
  p Odd: {num}
end
```

### 9. Functions
```rex
func greet(name)
  p Hello {name}!
  return "Greeted"
end

greet(World)

func add(a, b)
  return a + b
end

p {add(5, 10)}   # 15
```

### 10. Recursion
```rex
func factorial(n)
  if n <= 1
    return 1
  else
    return n * factorial(n - 1)
  end
end

p {factorial(5)}    # 120
p {factorial(10)}   # 3628800
```

### 11. FizzBuzz (full example)
```rex
n = 1
while n <= 15
  if n % 3 == 0 and n % 5 == 0
    p FizzBuzz
  else if n % 3 == 0
    p Fizz
  else if n % 5 == 0
    p Buzz
  else
    p {n}
  end
  n = n + 1
end
```

### 12. Lists
```rex
fruits = [apple banana cherry mango]

p {fruits[0]}        # apple
p {fruits.len}       # 4
p {fruits.first}     # apple
p {fruits.last}      # mango

fruits.push(orange)
p {fruits.reverse}
p {fruits.sort}
p {fruits.contains("banana")}  # true

each fruit in fruits
  p {fruit}
end
```

### 13. Strings
```rex
name = "Abdullah"

p {name.upper}        # ABDULLAH
p {name.lower}        # abdullah
p {name.len}          # 8

text = "Hello World"
p {text.contains("World")}     # true
p {text.replace("World", "Rex")}  # Hello Rex
p {text.starts("Hello")}       # true
p {text.ends("World")}         # true
p {"  spaced  ".trim()}        # "spaced"
p {text.split(" ")}            # ["Hello", "World"]
p {text.upper}                 # HELLO WORLD
```

### 14. Classes & OOP (v5.1)

#### Define a Class
```rex
class Person
  init(name, age)
    this.name = name
    this.age = age
  end
  greet()
    p Hi, I am {this.name} and I am {this.age} years old
  end
  birthday()
    this.age = this.age + 1
    p {this.name} is now {this.age}
  end
end
```

#### Create Instances
```rex
person = new Person("Abdullah", 25)
person.greet()       # Hi, I am Abdullah and I am 25 years old
person.birthday()    # Abdullah is now 26
p {person.name}      # Abdullah
p {person.age}       # 26
```

#### Inheritance
```rex
class Animal
  init(name)
    this.name = name
  end
  speak()
    p {this.name} makes a sound
  end
end

class Dog extends Animal
  speak()
    p {this.name} says Woof!
  end
  fetch()
    p {this.name} fetches the ball
  end
end

class Cat extends Animal
  speak()
    p {this.name} says Meow!
  end
end

dog = new Dog("Rex")
cat = new Cat("Whiskers")

dog.speak()    # Rex says Woof!
dog.fetch()    # Rex fetches the ball
cat.speak()    # Whiskers says Meow!
```

### 15. Match / Case (v5.1)
```rex
day = "Monday"

match day
  case "Monday"
    p Start of week
  end
  case "Friday"
    p Weekend coming!
  end
  case "Saturday"
    p Party time
  end
  default
    p Regular day
  end
end
```

### 16. Try / Catch
```rex
try
  p {10 / 0}
catch
  p Cannot divide by zero
end

try
  data = jsonparse(bad_input)
catch
  p Error: {error}
end
```

### 17. Import System (v5.1)

#### Math Module
```rex
import math as m

p {m.pi}            # 3.14159...
p {m.sqrt(144)}     # 12
p {m.pow(2, 10)}    # 1024
p {m.max(5, 10)}    # 10
p {m.floor(3.9)}    # 3
p {m.random()}      # 0 to 1
```

#### String Module
```rex
import string as s

p {s.upper("hello")}              # HELLO
p {s.contains("hello world", "world")}  # true
p {s.trim("  spaced  ")}          # spaced
```

#### Time Module
```rex
import time as t

p {t.now()}     # timestamp
p {t.today()}   # 2026-09-01
p {t.clock()}   # 05:55:00
p {t.year()}    # 2026
p {t.month()}   # 9
p {t.day()}     # 1
```

#### JSON Module
```rex
import json

data = json.parse('{"name":"Rex","version":5}')
p {data.name}              # Rex
p {data.version}           # 5
p {json.stringify(data)}   # formatted JSON string
```

#### File System Module
```rex
import fs

content = fs.read("data.txt")
fs.write("output.txt", "Hello from Rex")
fs.append("log.txt", "New entry")
p {fs.exists("data.txt")}  # true
p {fs.list(".")}           # array of files
```

### 18. JSON Built-in Functions (v5.1)
```rex
data = jsonparse('{"name":"Rex","version":5.1,"features":["classes","import","match"]}')

p {data.name}              # Rex
p {data.version}           # 5.1
p {data.features[0]}       # classes
p {data.features.len}      # 3
p {jsonstring(data)}       # pretty JSON string
```

### 19. Date/Time Functions (v5.1)
```rex
p {today()}     # 2026-09-01
p {year()}      # 2026
p {month()}     # 9
p {day()}       # 1
p {hour()}      # 5
p {clock()}      # 05:55:00
p {now()}       # 2026-09-01T00:55:00.000Z
p {time()}      # 1725149700000 (timestamp)
p {date()}      # 2026-09-01
```

### 20. Type Checking
```rex
p {type(42)}          # number
p {type("hello")}     # text
p {type([1 2 3])}     # list
p {type(true)}        # boolean
p {type(null)}        # null

# Type conversion
p {number("42")}      # 42
p {text(42)}          # "42"
p {boolean(1)}        # true
```

### 21. File I/O
```rex
# Read a file
content = readfile("data.txt")
p {content}

# Write a file
writefile("output.txt", "Hello from Rex")

# Append to a file
append("log.txt", "New entry")

# Check if file exists
if exists("data.txt")
  p File found
end

# List files in directory
each file in files(".")
  p {file}
end
```

### 22. Web Pages (.rexweb)

RexWeb lets you build complete HTML pages with CSS and JavaScript — all in plain English.

```rex
page
  header
    heading "My Website"
  end
  card
    paragraph "Welcome to Rex"
    button "Click Me" click: sayHi()
  end
  container
    heading "Features"
    list
      item "No semicolons"
      item "No brackets"
      item "No quotes needed"
    end
  end
end

style
body: background: #1a1a2e color: white padding: 20px
card: background: rgba(255,255,255,0.05) radius: 15px padding: 25px
button: background: #0f3460 color: white radius: 8px padding: 12px 24px
button hover: transform: scale(1.05) background: #533483
end

script
func sayHi()
  alert("Hello from Rex!")
end
end
```

#### Auto-Generation (50/50 Model)
If you skip the `style` block, Rex creates a beautiful dark gradient theme automatically (glassmorphism cards, gradient buttons, hover effects). If you skip the `script` block, Rex adds button interactions automatically. You write structure, Rex handles the rest.

### 23. Comments
```rex
# This is a comment
// This is also a comment
p Hello  # Inline comments work too
```

---

## Running Rex

### CLI Commands
```bash
rex run myfile.rex         # Run a Rex file
rex repl                   # Interactive mode
rex test                   # Run test suite
rex web page.rexweb        # Convert RexWeb to HTML
rex serve .                # Start live server (port 8000)
rex version                # Check version
```

### With Node.js directly
```bash
node rex.js run myfile.rex
node rex.js repl
node rex.js test
node rex.js web page.rexweb
node rex.js serve .
```

---

## VS Code Extension

Install `rex-language-6.0.0.vsix` from the `rex-vscode/` folder:

```bash
code --install-extension rex-language-6.0.0.vsix
```

Features:
- Syntax highlighting for `.rex` and `.rexweb` files
- Code snippets (functions, loops, classes, match, import, and more)
- Run from editor: `Ctrl+Shift+R`
- Live server for `.rexweb` files
- Convert `.rexweb` to HTML command

---

## Complete Keyword Reference

| Keyword | Urdu | Purpose |
|---------|------|---------|
| `p` | `dikha` | Print output |
| `ask` | `lo` | Get input |
| `if` | `agar` | Conditional |
| `else` | `warna` | Else branch |
| `repeat` | `dohra` | Fixed count loop |
| `while` | `jab` | Conditional loop |
| `each` | `har` | Iterate list |
| `func` | `kaam` | Define function |
| `return` | `wapis` | Return value |
| `end` | `khatam` | Close block |
| `break` | `tootta` | Break loop |
| `skip` | `agla` | Skip iteration |
| `try` | — | Try block |
| `catch` | — | Catch errors |
| `class` | — | Define class (v5.1) |
| `new` | `naya` | Create instance (v5.1) |
| `this` | `yeh` | Self reference (v5.1) |
| `extends` | `inherit` | Inheritance (v5.1) |
| `import` | `laao` | Import module (v5.1) |
| `export` | `bhejo` | Export symbol (v5.1) |
| `match` | — | Pattern match (v5.1) |
| `case` | — | Match case (v5.1) |
| `default` | — | Match default (v5.1) |
| `true` | `sahi` | Boolean true |
| `false` | `galat` | Boolean false |
| `null` | `khaali` | Null value |
| `and` | `aur` | Logical and |
| `or` | `ya` | Logical or |
| `not` | `nahi` | Logical not |
| `times` | `baar` | Repeat count |
| `in` | — | In (each loop) |
| `is` | — | Equality check |

## Built-in Functions

### String
`len`, `upper`, `lower`, `cut`, `replace`, `contains`, `find`, `split`, `join`, `trim`, `starts`, `ends`, `repeat`, `format`, `char`, `code`

### Math
`sqrt`, `abs`, `round`, `floor`, `ceil`, `pow`, `max`, `min`, `random`, `sin`, `cos`, `tan`, `log`, `log10`, `pi`, `e`

### Array
`push`, `pop`, `sort`, `reverse`, `sum`, `range`, `len`, `first`, `last`, `contains`

### Date/Time (v5.1)
`now`, `today`, `time`, `year`, `month`, `day`, `hour`, `date`, `clock`

### JSON (v5.1)
`jsonparse`, `jsonstring`

### File I/O
`readfile`, `writefile`, `exists`, `files`, `append`

### Type
`type`, `number`, `text`, `string`, `boolean`

### System
`os`, `version`, `exit`, `whoami`, `cwd`, `shell`, `env`, `args`, `platform`, `cpu`, `memory`, `hostname`, `uptime`

### Cybersecurity (v6.0)
`hash`, `sha256`, `sha512`, `md5`, `sha1`, `encrypt`, `decrypt`, `base64encode`, `base64decode`, `password`, `uuid`, `token`, `hmac`, `sanitize`, `urlencode`, `urldecode`

### Regex (v6.0)
`rematch`, `rereplace`, `retest`, `resplit`

### Logging (v6.0)
`log`, `warn`, `error`, `debug`

### HTTP (v6.0)
`httpget`, `httppost`, `http`, `fetch`

### Advanced Math (v6.0)
`clamp`, `lerp`, `maprange`, `tofixed`, `toint`, `tofloat`, `isfinite`, `isnan`, `parseint`, `parsefloat`

### Advanced String (v6.0)
`capitalize`, `titlecase`, `camelcase`, `snakecase`, `kebabcase`, `reverse_str`, `pad`, `count`, `index`, `lastindex`

### Color (v6.0)
`hex`, `rgb`

### Data Structures (v6.0)
`unique`, `merge`, `keys`, `values`, `entries`, `set`

### File Advanced (v6.0)
`copyfile`, `delfile`, `mkdir`, `filesize`, `modified`

## Standard Library Modules (v5.1)

| Module | Functions |
|--------|-----------|
| `math` | sqrt, abs, pow, floor, ceil, round, sin, cos, tan, log, pi, e, max, min, random |
| `string` | upper, lower, trim, split, replace, contains, len, repeat |
| `time` | now, date, today, year, month, day, hour, clock |
| `json` | parse, stringify |
| `fs` | read, write, exists, list, append |
| `crypto` (v6.0) | hash, sha256, sha512, md5, encrypt, decrypt, base64encode, base64decode, password, uuid, token, hmac, sanitize, urlencode, urldecode |
| `http` (v6.0) | get, post, put, delete, head |
| `regex` (v6.0) | match, replace, test, split, extract |
| `os` (v6.0) | platform, arch, cpu, cpus, memory, freememory, hostname, uptime, homedir, tmpdir, shell, env, args |
| `color` (v6.0) | hex, rgb, random, invert, lighten, darken |
| `logger` (v6.0) | info, warn, error, debug, success, fatal |

---

## npm Package

Install globally:
```bash
npm install -g rex-lang
```

URL: https://www.npmjs.com/package/rex-lang

## License

MIT License — see [LICENSE](LICENSE)

## Credits

- **Creator:** Abdullah Anser (Director, Digital Creators)
- **Co-creator:** Box (AI CEO)
- **Company:** Digital Creators — Digital Creative Agency

---

*Rex — because code should feel like English.*
