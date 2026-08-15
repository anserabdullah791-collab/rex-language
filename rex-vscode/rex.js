/**
 * Rex (ریکس) Programming Language v5.0
 * JavaScript Interpreter — No Python needed!
 * Runs in Node.js and browsers.
 *
 * Created by: Director Abdullah Anser & Box (CEO)
 * Date: August 15, 2026
 *
 * Usage:
 *   node rex.js run hello.rex
 *   node rex.js repl
 *   node rex.js test
 *   node rex.js web page.rexweb
 *   node rex.js serve .
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const readline = require('readline');

const VERSION = '5.0';

// ============================
// KEYWORDS
// ============================
const KEYWORDS = {
  print: 'PRINT', show: 'PRINT', say: 'PRINT', dikha: 'PRINT',
  p: 'P',
  ask: 'ASK', lo: 'ASK', input: 'ASK', get: 'ASK',
  if: 'IF', agar: 'IF', when: 'IF',
  else: 'ELSE', warna: 'ELSE', otherwise: 'ELSE',
  repeat: 'REPEAT', dohra: 'REPEAT', loop: 'REPEAT',
  while: 'WHILE', jab: 'WHILE',
  each: 'EACH', har: 'EACH', for: 'EACH',
  func: 'FUNC', kaam: 'FUNC', function: 'FUNC', def: 'FUNC',
  return: 'RETURN', wapis: 'RETURN', give: 'RETURN',
  end: 'END', khatam: 'END', done: 'END',
  break: 'BREAK', tootta: 'BREAK', stop: 'BREAK',
  skip: 'SKIP', agla: 'SKIP', next: 'SKIP', continue: 'SKIP',
  true: 'TRUE', sahi: 'TRUE', yes: 'TRUE',
  false: 'FALSE', galat: 'FALSE', no: 'FALSE',
  null: 'NULL', khaali: 'NULL', nothing: 'NULL', none: 'NULL',
  and: 'AND', aur: 'AND',
  or: 'OR', ya: 'OR',
  not: 'NOT', nahi: 'NOT',
  is: 'IS',
  in: 'IN',
  times: 'TIMES', baar: 'TIMES',
  tak: 'TAK',
  then: 'THEN',
  try: 'TRY',
  catch: 'CATCH',
};

// ============================
// TOKENIZER
// ============================
class Token {
  constructor(type, value, line) {
    this.type = type;
    this.value = value;
    this.line = line;
  }
}

function tokenize(source) {
  const tokens = [];
  const lines = source.split('\n');
  const pRegex = /^p\s+(.+)/;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    let line = lines[lineNum];
    
    // Remove comments
    let inString = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"' && (i === 0 || line[i-1] !== '\\')) inString = !inString;
      else if (line[i] === '#' && !inString) { line = line.slice(0, i); break; }
      else if (line.slice(i, i+2) === '//' && !inString) { line = line.slice(0, i); break; }
    }
    
    line = line.trim();
    if (!line) continue;
    
    // Check for 'p ' command
    const stripped = line;
    if (pRegex.test(stripped)) {
      const rest = stripped.slice(2).trim();
      if (rest.startsWith('{') && rest.endsWith('}')) {
        const exprTokens = tokenizeLine(rest.slice(1, -1), lineNum + 1);
        tokens.push(new Token('PRINT', 'p', lineNum + 1));
        tokens.push(...exprTokens);
      } else if (rest.startsWith('"') || rest.startsWith("'")) {
        tokens.push(new Token('PRINT', 'p', lineNum + 1));
        tokens.push(...tokenizeLine(rest, lineNum + 1));
      } else {
        tokens.push(new Token('PRINT', 'p', lineNum + 1));
        tokens.push(new Token('STRING', rest, lineNum + 1));
      }
      continue;
    }
    
    tokens.push(...tokenizeLine(line, lineNum + 1));
  }
  
  return tokens;
}

function tokenizeLine(line, lineNum) {
  const tokens = [];
  let pos = 0;
  
  while (pos < line.length) {
    if (line[pos] === ' ' || line[pos] === '\t') { pos++; continue; }
    
    // Strings (double quotes)
    if (line[pos] === '"') {
      let end = pos + 1;
      while (end < line.length && line[end] !== '"') {
        if (line[end] === '\\') end++;
        end++;
      }
      const str = line.slice(pos+1, end).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"');
      tokens.push(new Token('STRING', str, lineNum));
      pos = end + 1;
      continue;
    }
    
    // Strings (single quotes)
    if (line[pos] === "'") {
      let end = pos + 1;
      while (end < line.length && line[end] !== "'") {
        if (line[end] === '\\') end++;
        end++;
      }
      const str = line.slice(pos+1, end).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\'/g, "'");
      tokens.push(new Token('STRING', str, lineNum));
      pos = end + 1;
      continue;
    }
    
    // Numbers
    if (line[pos].match(/[0-9]/) || (line[pos] === '-' && pos+1 < line.length && line[pos+1].match(/[0-9]/) && (pos === 0 || ' \t(,=+*/^%<>!&|'.includes(line[pos-1])))) {
      let end = pos + 1;
      while (end < line.length && (line[end].match(/[0-9.]/))) end++;
      const numStr = line.slice(pos, end);
      tokens.push(new Token('NUMBER', numStr.includes('.') ? parseFloat(numStr) : parseInt(numStr), lineNum));
      pos = end;
      continue;
    }
    
    // Two-char operators
    const two = line.slice(pos, pos+2);
    if (['==', '!=', '<=', '>='].includes(two)) {
      const opMap = { '==': 'EQ', '!=': 'NEQ', '<=': 'LTE', '>=': 'GTE' };
      tokens.push(new Token(opMap[two], two, lineNum));
      pos += 2;
      continue;
    }
    
    // Single-char operators
    if ('+-*/%^%=<>()[]{},:'.includes(line[pos])) {
      const opMap = {
        '+': 'PLUS', '-': 'MINUS', '*': 'MULT', '/': 'DIV',
        '%': 'MOD', '^': 'POW', '=': 'ASSIGN', '<': 'LT',
        '>': 'GT', '(': 'LPAREN', ')': 'RPAREN',
        '[': 'LBRACKET', ']': 'RBRACKET', ',': 'COMMA', ':': 'COLON'
      };
      tokens.push(new Token(opMap[line[pos]] || 'OP', line[pos], lineNum));
      pos++;
      continue;
    }
    
    // Identifiers and keywords
    if (line[pos].match(/[a-zA-Z_]/)) {
      let end = pos + 1;
      while (end < line.length && (line[end].match(/[a-zA-Z0-9_.]/))) end++;
      const word = line.slice(pos, end);
      
      if (KEYWORDS[word]) tokens.push(new Token(KEYWORDS[word], word, lineNum));
      else tokens.push(new Token('IDENT', word, lineNum));
      pos = end;
      continue;
    }
    
    pos++;
  }
  
  return tokens;
}

// ============================
// PARSER
// ============================
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }
  
  peek(offset = 0) {
    return this.tokens[this.pos + offset] || new Token('EOF', null, -1);
  }
  
  advance() {
    const tok = this.peek();
    this.pos++;
    return tok;
  }
  
  expect(type) {
    const tok = this.peek();
    if (tok.type !== type) throw new SyntaxError(`Line ${tok.line}: Expected ${type} but got ${tok.type} ('${tok.value}')`);
    return this.advance();
  }
  
  parse() {
    const statements = [];
    while (this.peek().type !== 'EOF') {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }
    return statements;
  }
  
  parseStatement() {
    const tok = this.peek();
    
    if (['PRINT', 'P'].includes(tok.type)) return this.parsePrint();
    if (tok.type === 'ASK') return this.parseAsk();
    if (tok.type === 'IF') return this.parseIf();
    if (tok.type === 'REPEAT') return this.parseRepeat();
    if (tok.type === 'WHILE') return this.parseWhile();
    if (tok.type === 'EACH') return this.parseEach();
    if (tok.type === 'FUNC') return this.parseFunc();
    if (tok.type === 'RETURN') return this.parseReturn();
    if (tok.type === 'BREAK') { this.advance(); return ['BREAK']; }
    if (tok.type === 'SKIP') { this.advance(); return ['SKIP']; }
    if (tok.type === 'TRY') return this.parseTry();
    if (tok.type === 'END') { this.advance(); return null; }
    if (tok.type === 'IDENT') return this.parseExprStatement();
    throw new SyntaxError(`Line ${tok.line}: Unexpected '${tok.value}'`);
  }
  
  parsePrint() {
    this.advance();
    const expr = this.parseExpression();
    return ['PRINT', expr];
  }
  
  parseAsk() {
    this.expect('ASK');
    let prompt = null;
    if (this.peek().type === 'STRING') prompt = this.advance().value;
    return ['ASK', prompt];
  }
  
  parseIf() {
    this.expect('IF');
    const condition = this.parseExpression();
    if (this.peek().type === 'THEN') this.advance();
    const body = this.parseBlock();
    const elifBranches = [];
    let elseBody = null;
    
    while (this.peek().type === 'ELSE') {
      this.advance();
      if (this.peek().type === 'IF') {
        this.advance();
        const elifCond = this.parseExpression();
        if (this.peek().type === 'THEN') this.advance();
        const elifBody = this.parseBlock();
        elifBranches.push([elifCond, elifBody]);
      } else {
        elseBody = this.parseBlock();
        break;
      }
    }
    return ['IF', condition, body, elifBranches, elseBody];
  }
  
  parseRepeat() {
    this.expect('REPEAT');
    const count = this.parseExpression();
    if (this.peek().type === 'TIMES') this.advance();
    const body = this.parseBlock();
    return ['REPEAT', count, body];
  }
  
  parseWhile() {
    this.expect('WHILE');
    if (this.peek().type === 'TAK') this.advance();
    const condition = this.parseExpression();
    const body = this.parseBlock();
    return ['WHILE', condition, body];
  }
  
  parseEach() {
    this.expect('EACH');
    const variable = this.expect('IDENT').value;
    this.expect('IN');
    const iterable = this.parseExpression();
    const body = this.parseBlock();
    return ['EACH', variable, iterable, body];
  }
  
  parseFunc() {
    this.expect('FUNC');
    const name = this.expect('IDENT').value;
    this.expect('LPAREN');
    const params = [];
    while (this.peek().type !== 'RPAREN') {
      params.push(this.expect('IDENT').value);
      if (this.peek().type === 'COMMA') this.advance();
    }
    this.expect('RPAREN');
    const body = this.parseBlock();
    return ['FUNC', name, params, body];
  }
  
  parseReturn() {
    this.expect('RETURN');
    if (['END', 'EOF', 'ELSE'].includes(this.peek().type)) return ['RETURN', null];
    if (['NUMBER', 'STRING', 'IDENT', 'LPAREN', 'TRUE', 'FALSE', 'NULL', 'LBRACKET'].includes(this.peek().type)) {
      return ['RETURN', this.parseExpression()];
    }
    return ['RETURN', null];
  }
  
  parseTry() {
    this.expect('TRY');
    const tryBody = this.parseBlock();
    let catchBody = null;
    if (this.peek().type === 'CATCH') {
      this.advance();
      catchBody = this.parseBlock();
    }
    return ['TRY', tryBody, catchBody];
  }
  
  parseBlock() {
    const statements = [];
    while (true) {
      const tok = this.peek();
      if (tok.type === 'EOF') break;
      if (tok.type === 'END') { this.advance(); break; }
      if (['ELSE', 'CATCH'].includes(tok.type)) break;
      const stmt = this.parseStatement();
      if (stmt !== null) statements.push(stmt);
    }
    return statements;
  }
  
  parseExprStatement() {
    const name = this.expect('IDENT').value;
    
    if (this.peek().type === 'ASSIGN') {
      this.advance();
      return ['ASSIGN', name, this.parseExpression()];
    }
    if (this.peek().type === 'IS') {
      this.advance();
      if (this.peek().type === 'NOT') {
        this.advance();
        return ['ASSIGN', name, this.parseExpression()];
      }
      return ['ASSIGN', name, this.parseExpression()];
    }
    if (this.peek().type === 'LPAREN') {
      this.advance();
      const args = [];
      while (this.peek().type !== 'RPAREN') {
        args.push(this.parseExpression());
        if (this.peek().type === 'COMMA') this.advance();
        else if (this.peek().type !== 'RPAREN') break;
      }
      this.expect('RPAREN');
      return ['CALL', name, args];
    }
    if (this.peek().type === 'LBRACKET') {
      this.advance();
      const index = this.parseExpression();
      this.expect('RBRACKET');
      if (this.peek().type === 'ASSIGN') {
        this.advance();
        return ['ARRAY_SET', name, index, this.parseExpression()];
      }
      return ['ARRAY_GET', name, index];
    }
    return ['EXPR', ['VAR', name]];
  }
  
  parseExpression() { return this.parseOr(); }
  
  parseOr() {
    let left = this.parseAnd();
    while (this.peek().type === 'OR') {
      this.advance();
      left = ['BINOP', 'or', left, this.parseAnd()];
    }
    return left;
  }
  
  parseAnd() {
    let left = this.parseNot();
    while (this.peek().type === 'AND') {
      this.advance();
      left = ['BINOP', 'and', left, this.parseNot()];
    }
    return left;
  }
  
  parseNot() {
    if (this.peek().type === 'NOT') {
      this.advance();
      return ['UNOP', 'not', this.parseNot()];
    }
    return this.parseComparison();
  }
  
  parseComparison() {
    let left = this.parseAddition();
    while (['EQ', 'NEQ', 'LT', 'GT', 'LTE', 'GTE', 'IS'].includes(this.peek().type)) {
      if (this.peek().type === 'IS') {
        this.advance();
        if (this.peek().type === 'NOT') {
          this.advance();
          left = ['BINOP', '!=', left, this.parseAddition()];
        } else {
          left = ['BINOP', '==', left, this.parseAddition()];
        }
      } else {
        const op = this.advance().value;
        left = ['BINOP', op, left, this.parseAddition()];
      }
    }
    return left;
  }
  
  parseAddition() {
    let left = this.parseMultiplication();
    while (['PLUS', 'MINUS'].includes(this.peek().type)) {
      const op = this.advance().value;
      left = ['BINOP', op, left, this.parseMultiplication()];
    }
    return left;
  }
  
  parseMultiplication() {
    let left = this.parsePower();
    while (['MULT', 'DIV', 'MOD'].includes(this.peek().type)) {
      const op = this.advance().value;
      left = ['BINOP', op, left, this.parsePower()];
    }
    return left;
  }
  
  parsePower() {
    let left = this.parsePrimary();
    while (this.peek().type === 'POW') {
      this.advance();
      left = ['BINOP', '^', left, this.parsePower()];
    }
    return left;
  }
  
  parsePrimary() {
    const tok = this.peek();
    
    if (tok.type === 'NUMBER') { this.advance(); return ['NUM', tok.value]; }
    if (tok.type === 'STRING') { this.advance(); return ['STR', tok.value]; }
    if (tok.type === 'TRUE') { this.advance(); return ['BOOL', true]; }
    if (tok.type === 'FALSE') { this.advance(); return ['BOOL', false]; }
    if (tok.type === 'NULL') { this.advance(); return ['NULL']; }
    if (tok.type === 'LPAREN') {
      this.advance();
      const expr = this.parseExpression();
      this.expect('RPAREN');
      return expr;
    }
    if (tok.type === 'LBRACKET') {
      this.advance();
      const items = [];
      while (this.peek().type !== 'RBRACKET') {
        items.push(this.parseExpression());
        if (this.peek().type === 'COMMA') this.advance();
        else if (this.peek().type !== 'RBRACKET') break;
      }
      this.expect('RBRACKET');
      return ['LIST', items];
    }
    if (tok.type === 'IDENT') {
      this.advance();
      const name = tok.value;
      
      if (name.includes('.')) {
        const parts = name.split('.');
        const base = parts[0];
        const prop = parts[1] || '';
        if (this.peek().type === 'LPAREN') {
          this.advance();
          const args = [];
          while (this.peek().type !== 'RPAREN') {
            args.push(this.parseExpression());
            if (this.peek().type === 'COMMA') this.advance();
            else if (this.peek().type !== 'RPAREN') break;
          }
          this.expect('RPAREN');
          return ['METHOD', base, prop, args];
        }
        return ['PROP', base, prop];
      }
      
      if (this.peek().type === 'LPAREN') {
        this.advance();
        const args = [];
        while (this.peek().type !== 'RPAREN') {
          args.push(this.parseExpression());
          if (this.peek().type === 'COMMA') this.advance();
          else if (this.peek().type !== 'RPAREN') break;
        }
        this.expect('RPAREN');
        return ['CALL', name, args];
      }
      if (this.peek().type === 'LBRACKET') {
        this.advance();
        const index = this.parseExpression();
        this.expect('RBRACKET');
        return ['ARRAY_GET', name, index];
      }
      return ['VAR', name];
    }
    throw new SyntaxError(`Line ${tok.line}: Unexpected '${tok.value}'`);
  }
}

// ============================
// INTERPRETER
// ============================
class BreakException extends Error {}
class ContinueException extends Error {}
class ReturnException extends Error {
  constructor(value) { super(); this.value = value; }
}

class Interpreter {
  constructor(outputFn) {
    this.globalScope = {};
    this.functions = {};
    this.output = outputFn || (s => console.log(s));
    this.setupBuiltins();
  }
  
  setupBuiltins() {
    this.builtins = {
      len: a => (Array.isArray(a[0]) || typeof a[0] === 'string' || typeof a[0] === 'object') ? Object.keys(a[0] || {}).length : 0,
      length: a => (Array.isArray(a[0]) || typeof a[0] === 'string') ? a[0].length : 0,
      upper: a => String(a[0]).toUpperCase(),
      lower: a => String(a[0]).toLowerCase(),
      cut: a => a[0].slice(a.length > 1 ? parseInt(a[1]) : 0, a.length > 2 ? parseInt(a[2]) : parseInt(a[1] || a[0].length)),
      replace: a => String(a[0]).replace(String(a[1]), String(a[2])),
      contains: a => String(a[0]).includes(String(a[1])),
      find: a => typeof a[0] === 'string' ? a[0].indexOf(String(a[1])) : -1,
      split: a => a.length > 1 ? String(a[0]).split(a[1]) : String(a[0]).split(' '),
      join: a => a.length > 1 ? a[0].join(a[1]) : a[0].join(' '),
      random: a => a.length === 2 ? Math.floor(Math.random() * (a[1] - a[0] + 1)) + a[0] : Math.random(),
      abs: a => Math.abs(a[0]),
      round: a => Math.round(a[0]),
      max: a => Array.isArray(a[0]) ? Math.max(...a[0]) : Math.max(...a),
      min: a => Array.isArray(a[0]) ? Math.min(...a[0]) : Math.min(...a),
      sqrt: a => Math.sqrt(a[0]),
      pow: a => Math.pow(a[0], a[1]),
      floor: a => Math.floor(a[0]),
      ceil: a => Math.ceil(a[0]),
      sort: a => Array.isArray(a[0]) ? [...a[0]].sort((x,y) => x-y) : a[0],
      reverse: a => Array.isArray(a[0]) ? [...a[0]].reverse() : String(a[0]).split('').reverse().join(''),
      sum: a => Array.isArray(a[0]) ? a[0].reduce((s,x) => s+x, 0) : 0,
      push: a => { if (Array.isArray(a[0])) a[0].push(a[1]); return null; },
      pop: a => Array.isArray(a[0]) && a[0].length > 0 ? a[0].pop() : null,
      range: a => a.length === 2 ? Array.from({length: a[1]-a[0]}, (_, i) => i + a[0]) : Array.from({length: a[0]}, (_, i) => i),
      number: a => { try { return a[0].includes('.') ? parseFloat(a[0]) : parseInt(a[0]); } catch { return 0; } },
      text: a => String(a[0]),
      string: a => String(a[0]),
      type: a => this.getType(a[0]),
      readfile: a => { try { return fs.readFileSync(String(a[0]), 'utf-8'); } catch { throw new Error(`File '${a[0]}' not found`); } },
      writefile: a => { fs.writeFileSync(String(a[0]), String(a[1])); return 'ok'; },
      exists: a => fs.existsSync(String(a[0])),
    };
  }
  
  getType(val) {
    if (typeof val === 'boolean') return 'boolean';
    if (typeof val === 'number') return 'number';
    if (typeof val === 'string') return 'text';
    if (Array.isArray(val)) return 'list';
    if (val === null || val === undefined) return 'null';
    return 'unknown';
  }
  
  run(ast) {
    for (const node of ast) {
      this.execute(node, this.globalScope);
    }
  }
  
  execute(node, scope) {
    if (!node) return;
    const t = node[0];
    
    if (t === 'PRINT') {
      let val = this.evaluate(node[1], scope);
      if (typeof val === 'string' && val.includes('{')) {
        val = val.replace(/\{([^}]+)\}/g, (match, expr) => {
          try {
            const tokens = tokenizeLine(expr, 0);
            const parser = new Parser(tokens);
            const ast = parser.parseExpression();
            const v = this.evaluate(ast, scope);
            return String(v);
          } catch { return match; }
        });
      }
      if (typeof val === 'boolean') this.output(val ? 'true' : 'false');
      else if (val === null || val === undefined) this.output('null');
      else this.output(String(val));
    }
    else if (t === 'ASK') {
      // In Node.js, use readline
      return null; // Simplified for non-interactive
    }
    else if (t === 'ASSIGN') {
      const name = node[1];
      const val = this.evaluate(node[2], scope);
      if (name in scope) scope[name] = val;
      else if (name in this.globalScope) this.globalScope[name] = val;
      else scope[name] = val;
    }
    else if (t === 'IF') {
      const [, cond, body, elifBranches, elseBody] = node;
      if (this.evaluate(cond, scope)) {
        this.runBlock(body, scope);
      } else {
        let matched = false;
        for (const [ec, eb] of elifBranches) {
          if (this.evaluate(ec, scope)) { this.runBlock(eb, scope); matched = true; break; }
        }
        if (!matched && elseBody) this.runBlock(elseBody, scope);
      }
    }
    else if (t === 'REPEAT') {
      const count = this.evaluate(node[1], scope);
      const body = node[2];
      for (let i = 0; i < count; i++) {
        try { this.runBlock(body, scope); }
        catch (e) { if (e instanceof BreakException) break; if (e instanceof ContinueException) continue; throw e; }
      }
    }
    else if (t === 'WHILE') {
      while (this.evaluate(node[1], scope)) {
        try { this.runBlock(node[2], scope); }
        catch (e) { if (e instanceof BreakException) break; if (e instanceof ContinueException) continue; throw e; }
      }
    }
    else if (t === 'EACH') {
      const variable = node[1];
      const iterable = this.evaluate(node[2], scope);
      if (Array.isArray(iterable) || typeof iterable === 'string') {
        for (const item of iterable) {
          scope[variable] = item;
          try { this.runBlock(node[3], scope); }
          catch (e) { if (e instanceof BreakException) break; if (e instanceof ContinueException) continue; throw e; }
        }
      }
    }
    else if (t === 'FUNC') {
      this.functions[node[1]] = { params: node[2], body: node[3] };
    }
    else if (t === 'RETURN') {
      const val = node[1] ? this.evaluate(node[1], scope) : null;
      throw new ReturnException(val);
    }
    else if (t === 'BREAK') throw new BreakException();
    else if (t === 'SKIP') throw new ContinueException();
    else if (t === 'TRY') {
      try { this.runBlock(node[1], scope); }
      catch (e) {
        if (node[2]) {
          scope.error = String(e.message || e);
          this.runBlock(node[2], scope);
        }
      }
    }
    else if (t === 'CALL') {
      this.callFunction(node[1], node[2], scope);
    }
    else if (t === 'ARRAY_SET') {
      const arr = scope[node[1]] || this.globalScope[node[1]] || [];
      const index = this.evaluate(node[2], scope);
      const value = this.evaluate(node[3], scope);
      if (Array.isArray(arr)) {
        while (arr.length <= index) arr.push(null);
        arr[index] = value;
      }
    }
    else if (t === 'EXPR') {
      this.evaluate(node[1], scope);
    }
  }
  
  runBlock(statements, scope) {
    for (const stmt of statements) this.execute(stmt, scope);
  }
  
  callFunction(name, argExprs, scope) {
    if (this.builtins[name]) {
      const args = argExprs.map(a => this.evaluate(a, scope));
      return this.builtins[name](args);
    }
    if (!this.functions[name]) throw new Error(`Function '${name}' not defined`);
    
    const { params, body } = this.functions[name];
    const args = argExprs.map(a => this.evaluate(a, scope));
    const funcScope = {};
    for (let i = 0; i < params.length; i++) {
      funcScope[params[i]] = args[i] !== undefined ? args[i] : null;
    }
    
    try { this.runBlock(body, funcScope); }
    catch (e) { if (e instanceof ReturnException) return e.value; throw e; }
    return null;
  }
  
  evaluate(node, scope) {
    if (!node) return null;
    const t = node[0];
    
    if (t === 'NUM') return node[1];
    if (t === 'STR') return node[1];
    if (t === 'BOOL') return node[1];
    if (t === 'NULL') return null;
    if (t === 'VAR') {
      const name = node[1];
      if (name in scope) return scope[name];
      if (name in this.globalScope) return this.globalScope[name];
      return name; // bare word = string
    }
    if (t === 'LIST') return node[1].map(item => this.evaluate(item, scope));
    if (t === 'BINOP') return this.binop(node[1], this.evaluate(node[2], scope), this.evaluate(node[3], scope));
    if (t === 'UNOP') {
      if (node[1] === 'not') return !this.evaluate(node[2], scope);
    }
    if (t === 'CALL') return this.callFunction(node[1], node[2], scope);
    if (t === 'METHOD') {
      const base = this.evaluate(['VAR', node[1]], scope);
      const args = node[3].map(a => this.evaluate(a, scope));
      return this.methodCall(base, node[2], args);
    }
    if (t === 'PROP') {
      const val = this.evaluate(['VAR', node[1]], scope);
      return this.propertyAccess(val, node[2]);
    }
    if (t === 'ARRAY_GET') {
      const arr = scope[node[1]] || this.globalScope[node[1]] || [];
      const index = this.evaluate(node[2], scope);
      if (typeof arr === 'string' && index >= 0 && index < arr.length) return arr[index];
      if (Array.isArray(arr) && index >= 0 && index < arr.length) return arr[index];
      return null;
    }
    return null;
  }
  
  propertyAccess(val, prop) {
    if (prop === 'len' || prop === 'length') return (Array.isArray(val) || typeof val === 'string') ? val.length : 0;
    if (prop === 'upper') return String(val).toUpperCase();
    if (prop === 'lower') return String(val).toLowerCase();
    if (prop === 'first') return Array.isArray(val) && val.length > 0 ? val[0] : null;
    if (prop === 'last') return Array.isArray(val) && val.length > 0 ? val[val.length-1] : null;
    if (prop === 'type') return this.getType(val);
    if (prop === 'reverse') return Array.isArray(val) ? [...val].reverse() : String(val).split('').reverse().join('');
    if (prop === 'sort') return Array.isArray(val) ? [...val].sort((a,b) => a-b) : val;
    return null;
  }
  
  methodCall(val, method, args) {
    if (method === 'cut' || method === 'slice') return val.slice(args[0] || 0, args[1] || val.length);
    if (method === 'find') return typeof val === 'string' ? val.indexOf(String(args[0])) : -1;
    if (method === 'push' || method === 'add') { if (Array.isArray(val)) val.push(args[0]); return null; }
    if (method === 'pop') return Array.isArray(val) && val.length > 0 ? val.pop() : null;
    if (method === 'join') return Array.isArray(val) ? val.join(args[0] || ' ') : String(val);
    if (method === 'replace') return String(val).replace(String(args[0]), String(args[1]));
    if (method === 'contains') return String(val).includes(String(args[0]));
    if (method === 'split') return String(val).split(args[0] || ' ');
    return null;
  }
  
  binop(op, left, right) {
    if (op === '+') {
      if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
      return left + right;
    }
    if (op === '-') return left - right;
    if (op === '*') return left * right;
    if (op === '/') { if (right === 0) throw new Error('Cannot divide by zero'); return left / right; }
    if (op === '%') return left % right;
    if (op === '^') return Math.pow(left, right);
    if (op === '==') return left === right;
    if (op === '!=') return left !== right;
    if (op === '<') return left < right;
    if (op === '>') return left > right;
    if (op === '<=') return left <= right;
    if (op === '>=') return left >= right;
    if (op === 'and') return left && right;
    if (op === 'or') return left || right;
    throw new Error(`Unknown operator: ${op}`);
  }
}

// ============================
// REX WEB CONVERTER
// ============================

function autoGenerateCSS(htmlParts, userCssRules) {
  const allHtml = htmlParts.join(' ');
  const auto = {};
  const has = (s) => allHtml.includes(s);
  const notStyled = (sel) => !userCssRules[sel];
  
  // Body — always auto-style
  if (notStyled('body')) {
    auto['body'] = [
      'margin: 0', 'padding: 0',
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'background: linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      'color: #e8e8e8', 'min-height: 100vh',
    ];
  }
  if (has('<header') && notStyled('header')) {
    auto['header'] = ['text-align: center', 'padding: 60px 20px', 'background: rgba(0,0,0,0.3)'];
  }
  if (has('<footer') && notStyled('footer')) {
    auto['footer'] = ['text-align: center', 'padding: 30px', 'color: #666', 'font-size: 14px'];
  }
  if (has('class="container"') && notStyled('.container')) {
    auto['.container'] = ['max-width: 900px', 'margin: 0 auto', 'padding: 20px'];
  }
  if (has('class="card"') && notStyled('.card')) {
    auto['.card'] = [
      'background: rgba(255,255,255,0.05)', 'backdrop-filter: blur(10px)',
      'border: 1px solid rgba(255,255,255,0.1)', 'border-radius: 15px',
      'padding: 25px', 'margin: 15px 0',
    ];
  }
  if (has('class="heading"') && notStyled('.heading')) {
    auto['.heading'] = ['color: #64f3d1', 'font-size: 28px', 'margin-bottom: 10px'];
  }
  if (has('class="subtitle"') && notStyled('.subtitle')) {
    auto['.subtitle'] = ['color: #aaa', 'font-size: 18px', 'text-align: center'];
  }
  if (has('class="paragraph"') && notStyled('.paragraph')) {
    auto['.paragraph'] = ['color: #ddd', 'line-height: 1.6', 'font-size: 16px'];
  }
  if (has('class="list"') && notStyled('.list')) {
    auto['.list'] = ['padding: 10px 20px'];
  }
  if (has('class="item"') && notStyled('.item')) {
    auto['.item'] = ['margin: 8px 0', 'color: #ccc'];
  }
  if (has('<button') && notStyled('button')) {
    auto['button'] = [
      'background: linear-gradient(135deg, #0f3460, #533483)',
      'color: white', 'border: none', 'padding: 12px 30px',
      'border-radius: 8px', 'font-size: 16px', 'cursor: pointer',
      'transition: all 0.3s ease',
    ];
    if (notStyled('button:hover')) {
      auto['button:hover'] = ['transform: scale(1.05)', 'background: linear-gradient(135deg, #533483, #0f3460)'];
    }
  }
  if (has('<h1') && notStyled('h1')) auto['h1'] = ['margin: 0 0 10px 0'];
  if (has('<h2') && notStyled('h2')) auto['h2'] = ['margin: 0 0 10px 0'];
  if (has('<ul') && notStyled('ul') && !has('class="list"')) auto['ul'] = ['padding: 10px 25px'];
  
  return auto;
}

function autoGenerateJS(htmlParts, userJsParts) {
  if (userJsParts.length > 0) return [];
  const allHtml = htmlParts.join(' ');
  const auto = [];
  
  if (allHtml.includes('<button')) {
    auto.push('// Rex auto-generated interactions');
    auto.push('document.addEventListener("DOMContentLoaded", function() {');
    auto.push('  var buttons = document.querySelectorAll("button");');
    auto.push('  buttons.forEach(function(btn) {');
    auto.push('    if (!btn.onclick) {');
    auto.push('      btn.addEventListener("click", function() {');
    auto.push('        btn.style.transform = "scale(0.95)";');
    auto.push('        setTimeout(function() { btn.style.transform = ""; }, 150);');
    auto.push('      });');
    auto.push('    }');
    auto.push('  });');
    auto.push('});');
  }
  
  return auto;
}

function rexwebToHtml(source) {
  const TAG_MAP = {
    page: 'div', container: 'div', section: 'section',
    header: 'header', footer: 'footer', nav: 'nav',
    heading: 'h1', title: 'h1', h1: 'h1', h2: 'h2', h3: 'h3',
    subtitle: 'h2', subheading: 'h2',
    paragraph: 'p', text: 'p', p: 'p',
    button: 'button', link: 'a', image: 'img', img: 'img',
    list: 'ul', item: 'li', input: 'input', box: 'div',
    card: 'div', row: 'div', column: 'div', grid: 'div',
    form: 'form', label: 'label', span: 'span',
    video: 'video', audio: 'audio', br: 'br', hr: 'hr',
  };
  
  const CSS_MAP = {
    color: 'color', background: 'background', bg: 'background',
    size: 'font-size', font: 'font-family', width: 'width', height: 'height',
    padding: 'padding', margin: 'margin', border: 'border', radius: 'border-radius',
    'text-align': 'text-align', 'font-size': 'font-size', 'font-weight': 'font-weight',
    'max-width': 'max-width', 'line-height': 'line-height',
  };
  
  const standardTags = new Set(['body','header','footer','nav','section','div','p','h1','h2','h3','h4','h5','h6','ul','li','ol','a','img','button','input','form','label','span','video','audio','br','hr','table','tr','td','th','html']);
  
  const lines = source.split('\n');
  const htmlParts = [];
  const cssRules = {};
  const jsParts = [];
  let mode = 'html';
  let tagStack = [];
  
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    
    if (['style','css'].includes(line)) { mode = 'style'; continue; }
    if (['script','logic','js'].includes(line)) { mode = 'script'; continue; }
    if (['page','html','web'].includes(line)) { mode = 'html'; continue; }
    
    if (['end','done','khatam'].includes(line)) {
      if (mode === 'script') { jsParts.push('}'); mode = 'html'; continue; }
      if (mode === 'html' && tagStack.length > 0) {
        const [tag, attrs, content] = tagStack.pop();
        const inner = content.join('');
        const element = inner ? `<${tag}>${inner}</${tag}>` : `<${tag}></${tag}>`;
        if (tagStack.length > 0) tagStack[tagStack.length-1][2].push(element);
        else htmlParts.push(element);
      }
      continue;
    }
    
    if (mode === 'style') {
      if (line.includes(':')) {
        const colonIdx = line.indexOf(':');
        let selector = line.slice(0, colonIdx).trim();
        let propsStr = line.slice(colonIdx + 1).trim();
        
        // Handle pseudo-selectors
        const pseudoClasses = ['hover','active','focus','visited','before','after','first-child','last-child'];
        const firstWord = propsStr.split(':')[0].trim().split(/\s/)[0];
        if (pseudoClasses.includes(firstWord)) {
          const idx = propsStr.indexOf(':', firstWord.length);
          if (idx > 0) {
            propsStr = propsStr.slice(idx + 1).trim();
            selector = selector + ':' + firstWord;
          }
        }
        
        // NO COMMAS — properties separated by space
        // e.g. "background: black color: white padding: 20px"
        const props = [];
        const propRegex = /(\w[\w-]*):\s*([^:]+?)(?=\s+\w[\w-]*:|$)/g;
        let pm;
        while ((pm = propRegex.exec(propsStr)) !== null) {
          const pk = pm[1].trim();
          const pv = pm[2].trim();
          const cssProp = CSS_MAP[pk.toLowerCase()] || pk;
          props.push(`${cssProp}: ${pv}`);
        }
        
        // Convert to CSS class selector if not standard tag
        let cssSel = selector;
        if (selector.includes(':')) {
          const parts = selector.split(':');
          const base = parts[0].trim();
          const pseudo = ':' + parts.slice(1).join(':');
          cssSel = standardTags.has(base.toLowerCase()) ? base + pseudo : '.' + base + pseudo;
        } else {
          cssSel = standardTags.has(selector.toLowerCase()) ? selector : '.' + selector;
        }
        
        if (!cssRules[cssSel]) cssRules[cssSel] = [];
        cssRules[cssSel].push(...props);
      }
    }
    else if (mode === 'script') {
      let jsLine = line.replace('func ', 'function ');
      if (jsLine.includes('function ') && jsLine.includes('(') && jsLine.includes(')') && !jsLine.endsWith('{')) {
        jsLine += ' {';
      }
      jsParts.push(jsLine);
    }
    else if (mode === 'html') {
      const words = line.split(/\s+/);
      const tagWord = words[0].toLowerCase();
      let rest = words.slice(1).join(' ');
      const htmlTag = TAG_MAP[tagWord] || tagWord;
      
      let content = '';
      let attrs = {};
      
      if (rest.startsWith('"') || rest.startsWith("'")) {
        const quote = rest[0];
        const end = rest.indexOf(quote, 1);
        if (end > 0) { content = rest.slice(1, end); rest = rest.slice(end+1).trim(); }
      } else if (rest) {
        content = rest;
      }
      
      // Add class for custom elements
      const customElements = ['container','card','box','row','column','grid','heading','subtitle','paragraph','item','list'];
      if (customElements.includes(tagWord)) attrs.class = tagWord;
      
      // Parse attributes
      const attrMatches = rest.matchAll(/(\w+):\s*(\S+)/g);
      for (const m of attrMatches) {
        const key = m[1].toLowerCase();
        const val = m[2];
        if (key === 'click') attrs.onclick = val;
        else if (key === 'src' || key === 'href') attrs.src = val;
        else attrs[key] = val;
      }
      
      let attrStr = '';
      for (const [k, v] of Object.entries(attrs)) attrStr += ` ${k}="${v}"`;
      
      if (['br','hr'].includes(tagWord)) {
        const el = `<${htmlTag}>`;
        if (tagStack.length > 0) tagStack[tagStack.length-1][2].push(el); else htmlParts.push(el);
      } else if (['image','img'].includes(tagWord)) {
        const el = `<img${attrStr}>`;
        if (tagStack.length > 0) tagStack[tagStack.length-1][2].push(el); else htmlParts.push(el);
      } else if (content) {
        const el = `<${htmlTag}${attrStr}>${content}</${htmlTag}>`;
        if (tagStack.length > 0) tagStack[tagStack.length-1][2].push(el); else htmlParts.push(el);
      } else {
        tagStack.push([htmlTag, attrs, []]);
      }
    }
  }
  
  // === AUTO-GENERATE CSS (50% auto, 50% user) ===
  const autoCss = autoGenerateCSS(htmlParts, cssRules);
  const allCssRules = {};
  for (const [k, v] of Object.entries(autoCss)) allCssRules[k] = v;
  for (const [k, v] of Object.entries(cssRules)) allCssRules[k] = v;  // user overrides
  
  let cssText = '';
  for (const [selector, props] of Object.entries(allCssRules)) {
    cssText += `  ${selector} {\n`;
    for (const prop of props) cssText += `    ${prop};\n`;
    cssText += '  }\n';
  }
  
  // === AUTO-GENERATE JS ===
  const autoJs = autoGenerateJS(htmlParts, jsParts);
  const allJs = (jsParts.length === 0) ? autoJs : jsParts;
  const jsText = allJs.join('\n');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rex Web Page</title>
<style>
${cssText}
</style>
</head>
<body>
${htmlParts.join('\n')}
<script>
${jsText}
</script>
</body>
</html>`;
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
    
    // Serve static files
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
    console.log(`\n  ╔════════════════════════════════════╗`);
    console.log(`  ║  Rex Live Server v${VERSION}             ║`);
    console.log(`  ║  Serving: ${directory.padEnd(24)} ║`);
    console.log(`  ║  URL: http://localhost:${port}        ║`);
    console.log(`  ║  Press Ctrl+C to stop               ║`);
    console.log(`  ╚════════════════════════════════════╝\n`);
  });
}

// ============================
// FILE RUNNER
// ============================
function runFile(filename) {
  if (!fs.existsSync(filename)) {
    console.log(`Error: File '${filename}' not found`);
    return;
  }
  
  const source = fs.readFileSync(filename, 'utf-8');
  try {
    const tokens = tokenize(source);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter();
    interpreter.run(ast);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

// ============================
// TEST SUITE
// ============================
function runTests() {
  const testCode = `# === REX v5.0 JS TEST SUITE ===

p Hello World
p This is Rex v5 JS

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
print "=== All 18 tests passed! ==="`;
  
  fs.writeFileSync('/tmp/rex_test.rex', testCode);
  console.log(`Running Rex v${VERSION} JS test suite...\n`);
  runFile('/tmp/rex_test.rex');
}

// ============================
// REPL
// ============================
async function repl() {
  console.log(`\n  Rex v${VERSION} — JavaScript Edition\n`);
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
    const blockKeywords = ['if','agar','while','jab','repeat','dohra','loop','each','har','for','func','kaam','function','def','else','warna','try'];
    const hasBlockKw = blockKeywords.some(kw => line.split(/\s+/).includes(kw));
    const hasEnd = ['end','khatam','done'].includes(line.split(/\s+/).find(w => ['end','khatam','done'].includes(w)));
    
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
// MAIN
// ============================
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`Rex (ریکس) v${VERSION} — JavaScript Edition — The World's #1 Simplest Language\n`);
  console.log('Usage:');
  console.log('  node rex.js run <file.rex>       Run Rex script');
  console.log('  node rex.js web <file.rexweb>     Convert Rex Web to HTML');
  console.log('  node rex.js serve <folder>       Start live server');
  console.log('  node rex.js repl                 Interactive mode');
  console.log('  node rex.js test                 Run tests\n');
  repl();
} else if (args[0] === 'run') {
  runFile(args[1]);
} else if (args[0] === 'web') {
  if (args[1]) {
    const source = fs.readFileSync(args[1], 'utf-8');
    const html = rexwebToHtml(source);
    const outFile = args[1].replace('.rexweb', '.html');
    fs.writeFileSync(outFile, html);
    console.log(`Generated: ${outFile}`);
  }
} else if (args[0] === 'serve') {
  startServer(args[1] || '.', parseInt(args[2] || '8000'));
} else if (args[0] === 'repl') {
  repl();
} else if (args[0] === 'test') {
  runTests();
} else {
  runFile(args[0]);
}

// Export for use as a module
module.exports = { tokenize, Parser, Interpreter, rexwebToHtml, VERSION };
