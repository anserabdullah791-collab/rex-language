# Rex (ریکس) — NPM Package

The World's Simplest Programming Language — now on NPM.

## Install

```bash
npm install -g rex-lang
```

## Quick Start

```bash
# Run a Rex script
rex run hello.rex

# Start interactive mode
rex repl

# Run test suite
rex test

# Convert Rex Web to HTML
rex web page.rexweb

# Start live server
rex serve .
```

## Writing Rex Code

Create a file `hello.rex`:

```rex
p Hello World
x = 10
y = 20
p {x + y}

name = Abdullah
p My name is {name}

if x > 5
  p Big number
else
  p Small number
end

repeat 3
  p Rex is Number 1!
end

func greet(name)
  p Hello {name}
end
greet("Director")
```

Run it:

```bash
rex run hello.rex
```

## Rex Web — Build Websites

Create `page.rexweb`:

```rex
page
  heading "My Website"
  paragraph "Built with Rex"
  button "Click Me" click: hello()
end

style
heading: size: 40px color: blue
button: background: blue color: white radius: 10px
end

script
func hello()
  alert("Hello from Rex!")
end
end
```

Convert and serve:

```bash
rex web page.rexweb
rex serve .
```

## Bilingual Keywords

Rex supports both English and Urdu:

1. print / dikha / show / say
2. if / agar / when
3. else / warna
4. while / jab
5. repeat / dohra
6. each / har
7. func / kaam / function
8. return / wapis
9. end / khatam / done
10. break / tootta
11. true / sahi
12. false / galat

## No Semicolons. No Brackets. No Quotes Needed.

Just write English. Rex understands.

## License

MIT © Abdullah Anser
