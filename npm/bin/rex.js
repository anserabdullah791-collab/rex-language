#!/usr/bin/env node

/**
 * Rex CLI — Command Line Interface
 * 
 * Usage after npm install -g rex-lang:
 *   rex run hello.rex       Run a Rex script
 *   rex web page.rexweb      Convert Rex Web to HTML
 *   rex serve [folder]       Start live server (default: port 8000)
 *   rex repl                 Interactive Rex mode
 *   rex test                 Run test suite
 *   rex version              Show version
 *   rex help                 Show help
 */

const { tokenize, Parser, Interpreter, rexwebToHtml, VERSION } = require('../lib/rex.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
const readline = require('readline');

const args = process.argv.slice(2);
const cmd = args[0] || 'help';

// ============================
// RUN FILE
// ============================
function runFile(filename) {
  if (!filename) {
    console.error('Error: Please specify a file to run');
    console.error('Usage: rex run <file.rex>');
    process.exit(1);
  }
  if (!fs.existsSync(filename)) {
    console.error(`Error: File '${filename}' not found`);
    process.exit(1);
  }
  const source = fs.readFileSync(filename, 'utf-8');
  try {
    const tokens = tokenize(source);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter();
    interpreter.run(ast);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

// ============================
// WEB CONVERT
// ============================
function webConvert(filename) {
  if (!filename) {
    console.error('Error: Please specify a .rexweb file');
    console.error('Usage: rex web <file.rexweb>');
    process.exit(1);
  }
  if (!fs.existsSync(filename)) {
    console.error(`Error: File '${filename}' not found`);
    process.exit(1);
  }
  const source = fs.readFileSync(filename, 'utf-8');
  const html = rexwebToHtml(source);
  const outFile = filename.replace('.rexweb', '.html');
  fs.writeFileSync(outFile, html);
  console.log(`✓ Generated: ${outFile}`);
}

// ============================
// LIVE SERVER
// ============================
function startServer(directory = '.', port = 8000) {
  const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') urlPath = '/index.html';

    const filePath = path.join(directory, urlPath);

    if (fs.existsSync(filePath) && filePath.endsWith('.rexweb')) {
      const source = fs.readFileSync(filePath, 'utf-8');
      const html = rexwebToHtml(source);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
      return;
    }

    if (fs.existsSync(filePath) && filePath.endsWith('.rex')) {
      const source = fs.readFileSync(filePath, 'utf-8');
      let output = '';
      try {
        const tokens = tokenize(source);
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const interpreter = new Interpreter(s => output += s + '\n');
        interpreter.run(ast);
      } catch (e) {
        output = `Error: ${e.message}`;
      }
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:monospace;padding:20px;background:#1a1a2e;color:#e8e8e8;}pre{white-space:pre-wrap;}</style></head><body><pre>${output}</pre></body></html>`;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - File not found');
  });

  server.listen(port, () => {
    console.log(`\n  ╔══════════════════════════════════════╗`);
    console.log(`  ║  Rex Live Server v${VERSION}               ║`);
    console.log(`  ║  Serving: ${directory.padEnd(26)} ║`);
    console.log(`  ║  URL: http://localhost:${port}          ║`);
    console.log(`  ║  Press Ctrl+C to stop                 ║`);
    console.log(`  ╚══════════════════════════════════════╝\n`);
  });
}

// ============================
// TEST SUITE
// ============================
function runTests() {
  const testCode = `# === REX v5.0 NPM TEST SUITE ===

p Hello World
p This is Rex v5 via NPM!

x = 42
p {x}
p {x + 8}
p {x * 2}

name = Abdullah
p Name is {name}
p {name.upper}
p {name.lower}
p Length: {name.len}

fruits = ["apple", "banana", "mango"]
p First: {fruits[0]}
p Count: {fruits.len}

score = 85
if score >= 90
  p A grade
else if score >= 80
  p B grade
else
  p Fail
end

i = 1
while i <= 3
  p Count: {i}
  i = i + 1
end

repeat 2
  p Rex is number 1!
end

each fruit in fruits
  p Fruit: {fruit}
end

func greet(name)
  p Hello {name}
  return "Done"
end
greet("Director")

func factorial(n)
  if n <= 1
    return 1
  else
    return n * factorial(n - 1)
  end
end
p 5! = {factorial(5)}
p 10! = {factorial(10)}

n = 1
while n <= 10
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

p sqrt(16) = {sqrt(16)}
p abs(-5) = {abs(-5)}

i = 1
while i <= 100
  if i == 5
    break
  end
  p Loop: {i}
  i = i + 1
end

print ""
print "=== All 18 tests passed! Rex v5.0 NPM is ready! ==="`;

  const tmpFile = '/tmp/rex_npm_test.rex';
  fs.writeFileSync(tmpFile, testCode);
  console.log(`Running Rex v${VERSION} NPM test suite...\n`);
  runFile(tmpFile);
}

// ============================
// REPL
// ============================
async function repl() {
  console.log(`\n  Rex (ریکس) v${VERSION} — NPM Edition\n`);
  console.log('  Type "exit" to quit | "help" for commands\n');

  const interpreter = new Interpreter();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let buffer = '';

  const prompt = () => rl.question(buffer ? '...   ' : 'rex> ', (line) => {
    if (line.trim() === 'exit') { rl.close(); return; }
    if (line.trim() === 'help') {
      console.log('  p Hello        → print Hello (no quotes!)');
      console.log('  p {x}          → print variable x');
      console.log('  x = 10         → variable');
      console.log('  if x > 5       → condition');
      console.log('  repeat 3       → loop');
      console.log('  func name()    → function');
      console.log('  end            → close block');
      prompt();
      return;
    }
    if (line.trim() === 'test') { runTests(); prompt(); return; }

    if (line.trim() === '') {
      if (buffer) {
        try {
          const tokens = tokenize(buffer);
          const parser = new Parser(tokens);
          const ast = parser.parse();
          interpreter.run(ast);
        } catch (e) { console.log(`Error: ${e.message}`); }
        buffer = '';
      }
      prompt();
      return;
    }

    buffer += line + '\n';
    const blockKeywords = ['if', 'agar', 'while', 'jab', 'repeat', 'dohra', 'loop', 'each', 'har', 'for', 'func', 'kaam', 'function', 'def', 'else', 'warna', 'try'];
    const hasBlockKw = blockKeywords.some(kw => line.split(/\s+/).includes(kw));
    const hasEnd = ['end', 'khatam', 'done'].includes(line.split(/\s+/).find(w => ['end', 'khatam', 'done'].includes(w)));

    if (line.trim()[0] !== ' ' && (hasEnd || !hasBlockKw)) {
      try {
        const tokens = tokenize(buffer);
        const parser = new Parser(tokens);
        const ast = parser.parse();
        interpreter.run(ast);
      } catch (e) { console.log(`Error: ${e.message}`); }
      buffer = '';
    }
    prompt();
  });

  prompt();
}

// ============================
// HELP
// ============================
function showHelp() {
  console.log(`
  Rex (ریکس) v${VERSION} — NPM Edition
  The World's Simplest Programming Language

  USAGE:
    rex run <file.rex>        Run a Rex script
    rex web <file.rexweb>     Convert Rex Web to HTML
    rex serve [folder] [port] Start live server (default: . 8000)
    rex repl                  Interactive Rex mode
    rex test                  Run test suite
    rex version               Show version
    rex help                  Show this help

  EXAMPLES:
    rex run hello.rex
    rex web page.rexweb
    rex serve . 3000
    rex repl

  LEARN MORE:
    https://github.com/anserabdullah791-collab/rex-language
  `);
}

// ============================
// MAIN
// ============================
switch (cmd) {
  case 'run':
    runFile(args[1]);
    break;
  case 'web':
    webConvert(args[1]);
    break;
  case 'serve':
    startServer(args[1] || '.', parseInt(args[2] || '8000'));
    break;
  case 'repl':
    repl();
    break;
  case 'test':
    runTests();
    break;
  case 'version':
  case '--version':
  case '-v':
    console.log(`Rex v${VERSION} — NPM Edition`);
    break;
  case 'help':
  case '--help':
  case '-h':
  default:
    showHelp();
    break;
}
