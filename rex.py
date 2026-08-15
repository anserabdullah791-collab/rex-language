#!/usr/bin/env python3
"""
Rex (ریکس) Programming Language v5.0
The World's #1 Simplest Programming Language

NEW in v5.0:
- p Hello → prints "Hello" (no quotes needed!)
- p {x} → prints variable value
- Rex Web Mode: write HTML in Rex (rex markup)
- Rex Style Mode: write CSS in Rex (style blocks)
- Rex Logic: JavaScript-like brain (functions, events)
- Live Server: python3 rex.py serve <folder>
- .rexweb files = full web pages in Rex syntax

Created by: Director Abdullah Anser & Box (CEO)
Date: August 15, 2026

Usage:
    python3 rex.py run hello.rex          Run Rex script
    python3 rex.py web page.rexweb        Convert Rex Web to HTML
    python3 rex.py serve .                Start live server
    python3 rex.py repl                   Interactive mode
    python3 rex.py test                   Run tests
"""

import sys
import os
import math
import random
import json
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import socketserver

VERSION = "5.0"

# ============================
# REX SCRIPT INTERPRETER (v5.0)
# ============================

KEYWORDS = {
    'print': 'PRINT', 'show': 'PRINT', 'say': 'PRINT', 'dikha': 'PRINT',
    'p': 'P',  # NEW: ultra-short print
    'ask': 'ASK', 'lo': 'ASK', 'input': 'ASK',
    'if': 'IF', 'agar': 'IF', 'when': 'IF',
    'else': 'ELSE', 'warna': 'ELSE', 'otherwise': 'ELSE',
    'repeat': 'REPEAT', 'dohra': 'REPEAT', 'loop': 'REPEAT',
    'while': 'WHILE', 'jab': 'WHILE',
    'each': 'EACH', 'har': 'EACH', 'for': 'EACH',
    'func': 'FUNC', 'kaam': 'FUNC', 'function': 'FUNC', 'def': 'FUNC',
    'return': 'RETURN', 'wapis': 'RETURN', 'give': 'RETURN',
    'end': 'END', 'khatam': 'END', 'done': 'END',
    'break': 'BREAK', 'tootta': 'BREAK', 'stop': 'BREAK',
    'skip': 'SKIP', 'agla': 'SKIP', 'next': 'SKIP', 'continue': 'SKIP',
    'true': 'TRUE', 'sahi': 'TRUE', 'yes': 'TRUE',
    'false': 'FALSE', 'galat': 'FALSE', 'no': 'FALSE',
    'null': 'NULL', 'khaali': 'NULL', 'nothing': 'NULL', 'none': 'NULL',
    'and': 'AND', 'aur': 'AND',
    'or': 'OR', 'ya': 'OR',
    'not': 'NOT', 'nahi': 'NOT',
    'is': 'IS',
    'in': 'IN',
    'times': 'TIMES', 'baar': 'TIMES',
    'tak': 'TAK',
    'then': 'THEN',
    'try': 'TRY',
    'catch': 'CATCH',
}

class Token:
    def __init__(self, type_, value, line):
        self.type = type_
        self.value = value
        self.line = line
    
    def __repr__(self):
        return f"Token({self.type}, {repr(self.value)}, L{self.line})"

def tokenize(source):
    tokens = []
    lines = source.split('\n')
    
    for line_num, line in enumerate(lines, 1):
        # Remove comments
        in_string = False
        for i, ch in enumerate(line):
            if ch == '"' and (i == 0 or line[i-1] != '\\'):
                in_string = not in_string
            elif ch == '#' and not in_string:
                line = line[:i]
                break
            elif line[i:i+2] == '//' and not in_string:
                line = line[:i]
                break
        
        line = line.strip()
        if not line:
            continue
        
        # Check for 'p ' command (ultra-short print, no quotes)
        # 'p Hello World' → print "Hello World"
        # 'p {x}' → print variable x
        # 'p {x + y}' → print expression
        stripped = line.strip()
        if re.match(r'^p\s+(.+)', stripped):
            rest = stripped[2:].strip()  # everything after "p "
            if rest.startswith('{') and rest.endswith('}'):
                # Check if it's a SINGLE expression or multiple interpolations
                # Find the matching } for the first {
                brace_depth = 0
                single_expr = True
                for ci, ch in enumerate(rest):
                    if ch == '{':
                        brace_depth += 1
                    elif ch == '}':
                        brace_depth -= 1
                        if brace_depth == 0 and ci != len(rest) - 1:
                            # There's content after the first } → multiple interpolations
                            single_expr = False
                            break
                if single_expr:
                    # Single expression: p {x + y}
                    expr_code = rest[1:-1]
                    expr_tokens = tokenize_line(expr_code, line_num)
                    tokens.append(Token('PRINT', 'p', line_num))
                    tokens.extend(expr_tokens)
                else:
                    # Multiple: p {x} and {name} → treat as string (interpolation at runtime)
                    tokens.append(Token('PRINT', 'p', line_num))
                    tokens.append(Token('STRING', rest, line_num))
            elif rest.startswith('"') or rest.startswith("'"):
                # Explicit string: p "Hello"
                tokens.append(Token('PRINT', 'p', line_num))
                tokens.extend(tokenize_line(rest, line_num))
            else:
                # Plain text: p Hello World → "Hello World"
                tokens.append(Token('PRINT', 'p', line_num))
                tokens.append(Token('STRING', rest, line_num))
            continue
        
        # Normal tokenization
        line_tokens = tokenize_line(line, line_num)
        tokens.extend(line_tokens)
    
    return tokens

def tokenize_line(line, line_num):
    tokens = []
    pos = 0
    while pos < len(line):
        if line[pos] in ' \t':
            pos += 1
            continue
        
        # Strings (double quotes)
        if line[pos] == '"':
            end = pos + 1
            while end < len(line) and line[end] != '"':
                if line[end] == '\\':
                    end += 1
                end += 1
            string_val = line[pos+1:end].replace('\\n', '\n').replace('\\t', '\t').replace('\\"', '"')
            tokens.append(Token('STRING', string_val, line_num))
            pos = end + 1
            continue
        
        # Strings (single quotes)
        if line[pos] == "'":
            end = pos + 1
            while end < len(line) and line[end] != "'":
                if line[end] == '\\':
                    end += 1
                end += 1
            string_val = line[pos+1:end].replace('\\n', '\n').replace('\\t', '\t').replace("\\'", "'")
            tokens.append(Token('STRING', string_val, line_num))
            pos = end + 1
            continue
        
        # Numbers
        if line[pos].isdigit() or (line[pos] == '-' and pos + 1 < len(line) and line[pos+1].isdigit() and (pos == 0 or line[pos-1] in ' \t(,=+*/^%<>!&|')):
            end = pos + 1
            while end < len(line) and (line[end].isdigit() or line[end] == '.'):
                end += 1
            num_str = line[pos:end]
            if '.' in num_str:
                tokens.append(Token('NUMBER', float(num_str), line_num))
            else:
                tokens.append(Token('NUMBER', int(num_str), line_num))
            pos = end
            continue
        
        # Two-char operators
        if line[pos:pos+2] in ['==', '!=', '<=', '>=']:
            op_map = {'==': 'EQ', '!=': 'NEQ', '<=': 'LTE', '>=': 'GTE'}
            tokens.append(Token(op_map[line[pos:pos+2]], line[pos:pos+2], line_num))
            pos += 2
            continue
        
        # Single-char operators
        if line[pos] in '+-*/%^%=<>()[]{},:':
            op_map = {
                '+': 'PLUS', '-': 'MINUS', '*': 'MULT', '/': 'DIV',
                '%': 'MOD', '^': 'POW', '=': 'ASSIGN', '<': 'LT',
                '>': 'GT', '(': 'LPAREN', ')': 'RPAREN',
                '[': 'LBRACKET', ']': 'RBRACKET', ',': 'COMMA', ':': 'COLON'
            }
            tokens.append(Token(op_map.get(line[pos], 'OP'), line[pos], line_num))
            pos += 1
            continue
        
        # Identifiers and keywords
        if line[pos].isalpha() or line[pos] == '_':
            end = pos + 1
            while end < len(line) and (line[end].isalnum() or line[end] == '_' or line[end] == '.'):
                end += 1
            word = line[pos:end]
            
            if word in KEYWORDS:
                tokens.append(Token(KEYWORDS[word], word, line_num))
            else:
                tokens.append(Token('IDENT', word, line_num))
            pos = end
            continue
        
        pos += 1
    
    return tokens

# ============================
# PARSER
# ============================

class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0
    
    def peek(self, offset=0):
        if self.pos + offset < len(self.tokens):
            return self.tokens[self.pos + offset]
        return Token('EOF', None, -1)
    
    def advance(self):
        tok = self.peek()
        self.pos += 1
        return tok
    
    def expect(self, type_):
        tok = self.peek()
        if tok.type != type_:
            raise SyntaxError(f"Line {tok.line}: Expected {type_} but got {tok.type} ('{tok.value}')")
        return self.advance()
    
    def parse(self):
        statements = []
        while self.peek().type != 'EOF':
            stmt = self.parse_statement()
            if stmt:
                statements.append(stmt)
        return statements
    
    def parse_statement(self):
        tok = self.peek()
        
        if tok.type in ('PRINT', 'P'):
            return self.parse_print()
        elif tok.type == 'ASK':
            return self.parse_ask()
        elif tok.type == 'IF':
            return self.parse_if()
        elif tok.type == 'REPEAT':
            return self.parse_repeat()
        elif tok.type == 'WHILE':
            return self.parse_while()
        elif tok.type == 'EACH':
            return self.parse_each()
        elif tok.type == 'FUNC':
            return self.parse_func()
        elif tok.type == 'RETURN':
            return self.parse_return()
        elif tok.type == 'BREAK':
            self.advance()
            return ('BREAK',)
        elif tok.type == 'SKIP':
            self.advance()
            return ('SKIP',)
        elif tok.type == 'TRY':
            return self.parse_try()
        elif tok.type == 'END':
            self.advance()
            return None
        elif tok.type == 'IDENT':
            return self.parse_expr_statement()
        else:
            raise SyntaxError(f"Line {tok.line}: Unexpected '{tok.value}'")
    
    def parse_print(self):
        self.advance()  # PRINT or P
        expr = self.parse_expression()
        return ('PRINT', expr)
    
    def parse_ask(self):
        self.expect('ASK')
        prompt = None
        if self.peek().type == 'STRING':
            prompt = self.advance().value
        return ('ASK', prompt)
    
    def parse_if(self):
        self.expect('IF')
        condition = self.parse_expression()
        if self.peek().type == 'THEN':
            self.advance()
        body = self.parse_block()
        elif_branches = []
        else_body = None
        
        while self.peek().type == 'ELSE':
            self.advance()
            if self.peek().type == 'IF':
                self.advance()
                elif_cond = self.parse_expression()
                if self.peek().type == 'THEN':
                    self.advance()
                elif_body = self.parse_block()
                elif_branches.append((elif_cond, elif_body))
            else:
                else_body = self.parse_block()
                break
        
        return ('IF', condition, body, elif_branches, else_body)
    
    def parse_repeat(self):
        self.expect('REPEAT')
        count = self.parse_expression()
        if self.peek().type == 'TIMES':
            self.advance()
        body = self.parse_block()
        return ('REPEAT', count, body)
    
    def parse_while(self):
        self.expect('WHILE')
        if self.peek().type == 'TAK':
            self.advance()
        condition = self.parse_expression()
        body = self.parse_block()
        return ('WHILE', condition, body)
    
    def parse_each(self):
        self.expect('EACH')
        var = self.expect('IDENT').value
        self.expect('IN')
        iterable = self.parse_expression()
        body = self.parse_block()
        return ('EACH', var, iterable, body)
    
    def parse_func(self):
        self.expect('FUNC')
        name = self.expect('IDENT').value
        self.expect('LPAREN')
        params = []
        while self.peek().type != 'RPAREN':
            params.append(self.expect('IDENT').value)
            if self.peek().type == 'COMMA':
                self.advance()
        self.expect('RPAREN')
        body = self.parse_block()
        return ('FUNC', name, params, body)
    
    def parse_return(self):
        self.expect('RETURN')
        if self.peek().type in ['END', 'EOF', 'ELSE']:
            return ('RETURN', None)
        if self.peek().type in ['NUMBER', 'STRING', 'IDENT', 'LPAREN', 'TRUE', 'FALSE', 'NULL', 'LBRACKET']:
            expr = self.parse_expression()
            return ('RETURN', expr)
        return ('RETURN', None)
    
    def parse_try(self):
        self.expect('TRY')
        try_body = self.parse_block()
        catch_body = None
        if self.peek().type == 'CATCH':
            self.advance()
            catch_body = self.parse_block()
        return ('TRY', try_body, catch_body)
    
    def parse_block(self):
        statements = []
        while True:
            tok = self.peek()
            if tok.type == 'EOF':
                raise SyntaxError(f"Line {tok.line}: Missing 'end' — block was never closed. Add 'end' to close it.")
            if tok.type == 'END':
                self.advance()
                break
            if tok.type in ('ELSE', 'CATCH'): break
            stmt = self.parse_statement()
            if stmt is not None:
                statements.append(stmt)
        return statements
    
    def parse_expr_statement(self):
        name = self.expect('IDENT').value
        
        if self.peek().type == 'ASSIGN':
            self.advance()
            value = self.parse_expression()
            return ('ASSIGN', name, value)
        elif self.peek().type == 'IS':
            self.advance()
            if self.peek().type == 'NOT':
                self.advance()
                value = self.parse_expression()
                return ('ASSIGN', name, value)
            else:
                value = self.parse_expression()
                return ('ASSIGN', name, value)
        elif self.peek().type == 'LPAREN':
            self.advance()
            args = []
            while self.peek().type != 'RPAREN':
                args.append(self.parse_expression())
                if self.peek().type == 'COMMA':
                    self.advance()
                elif self.peek().type != 'RPAREN':
                    break
            self.expect('RPAREN')
            return ('CALL', name, args)
        elif self.peek().type == 'LBRACKET':
            self.advance()
            index = self.parse_expression()
            self.expect('RBRACKET')
            if self.peek().type == 'ASSIGN':
                self.advance()
                value = self.parse_expression()
                return ('ARRAY_SET', name, index, value)
            return ('ARRAY_GET', name, index)
        else:
            return ('EXPR', ('VAR', name))
    
    def parse_expression(self):
        return self.parse_or()
    
    def parse_or(self):
        left = self.parse_and()
        while self.peek().type == 'OR':
            self.advance()
            right = self.parse_and()
            left = ('BINOP', 'or', left, right)
        return left
    
    def parse_and(self):
        left = self.parse_not()
        while self.peek().type == 'AND':
            self.advance()
            right = self.parse_not()
            left = ('BINOP', 'and', left, right)
        return left
    
    def parse_not(self):
        if self.peek().type == 'NOT':
            self.advance()
            expr = self.parse_not()
            return ('UNOP', 'not', expr)
        return self.parse_comparison()
    
    def parse_comparison(self):
        left = self.parse_addition()
        while self.peek().type in ['EQ', 'NEQ', 'LT', 'GT', 'LTE', 'GTE', 'IS']:
            if self.peek().type == 'IS':
                self.advance()
                if self.peek().type == 'NOT':
                    self.advance()
                    right = self.parse_addition()
                    left = ('BINOP', '!=', left, right)
                else:
                    right = self.parse_addition()
                    left = ('BINOP', '==', left, right)
            else:
                op = self.advance().value
                right = self.parse_addition()
                left = ('BINOP', op, left, right)
        return left
    
    def parse_addition(self):
        left = self.parse_multiplication()
        while self.peek().type in ['PLUS', 'MINUS']:
            op = self.advance().value
            right = self.parse_multiplication()
            left = ('BINOP', op, left, right)
        return left
    
    def parse_multiplication(self):
        left = self.parse_power()
        while self.peek().type in ['MULT', 'DIV', 'MOD']:
            op = self.advance().value
            right = self.parse_power()
            left = ('BINOP', op, left, right)
        return left
    
    def parse_power(self):
        left = self.parse_primary()
        while self.peek().type == 'POW':
            self.advance()
            right = self.parse_power()
            left = ('BINOP', '^', left, right)
        return left
    
    def parse_primary(self):
        tok = self.peek()
        
        if tok.type == 'NUMBER':
            self.advance()
            return ('NUM', tok.value)
        elif tok.type == 'STRING':
            self.advance()
            return ('STR', tok.value)
        elif tok.type == 'TRUE':
            self.advance()
            return ('BOOL', True)
        elif tok.type == 'FALSE':
            self.advance()
            return ('BOOL', False)
        elif tok.type == 'NULL':
            self.advance()
            return ('NULL',)
        elif tok.type == 'LPAREN':
            self.advance()
            expr = self.parse_expression()
            self.expect('RPAREN')
            return expr
        elif tok.type == 'LBRACKET':
            self.advance()
            items = []
            while self.peek().type != 'RBRACKET':
                items.append(self.parse_expression())
                if self.peek().type == 'COMMA':
                    self.advance()
                elif self.peek().type != 'RBRACKET':
                    break
            self.expect('RBRACKET')
            return ('LIST', items)
        elif tok.type == 'IDENT':
            self.advance()
            name = tok.value
            
            if '.' in name:
                parts = name.split('.')
                base = parts[0]
                prop = parts[1] if len(parts) > 1 else ''
                if self.peek().type == 'LPAREN':
                    self.advance()
                    args = []
                    while self.peek().type != 'RPAREN':
                        args.append(self.parse_expression())
                        if self.peek().type == 'COMMA':
                            self.advance()
                        elif self.peek().type != 'RPAREN':
                            break
                    self.expect('RPAREN')
                    return ('METHOD', base, prop, args)
                return ('PROP', base, prop)
            
            if self.peek().type == 'LPAREN':
                self.advance()
                args = []
                while self.peek().type != 'RPAREN':
                    args.append(self.parse_expression())
                    if self.peek().type == 'COMMA':
                        self.advance()
                    elif self.peek().type != 'RPAREN':
                        break
                self.expect('RPAREN')
                return ('CALL', name, args)
            elif self.peek().type == 'LBRACKET':
                self.advance()
                index = self.parse_expression()
                self.expect('RBRACKET')
                return ('ARRAY_GET', name, index)
            else:
                return ('VAR', name)
        else:
            raise SyntaxError(f"Line {tok.line}: Unexpected '{tok.value}'")

# ============================
# INTERPRETER
# ============================

class BreakException(Exception): pass
class ContinueException(Exception): pass

class ReturnException(Exception):
    def __init__(self, value):
        self.value = value

class RexError(Exception): pass

class Interpreter:
    def __init__(self):
        self.global_scope = {}
        self.functions = {}
        self.setup_builtins()
    
    def setup_builtins(self):
        self.builtins = {
            'len': lambda a: len(a[0]) if isinstance(a[0], (list, str, dict)) else 0,
            'length': lambda a: len(a[0]) if isinstance(a[0], (list, str, dict)) else 0,
            'upper': lambda a: str(a[0]).upper(),
            'lower': lambda a: str(a[0]).lower(),
            'cut': lambda a: a[0][int(a[1]):int(a[2])] if len(a) > 2 else a[0][:int(a[1])],
            'slice': lambda a: a[0][int(a[1]):int(a[2])] if len(a) > 2 else a[0][:int(a[1])],
            'replace': lambda a: str(a[0]).replace(str(a[1]), str(a[2])),
            'repeat': lambda a: str(a[0]) * int(a[1]),
            'contains': lambda a: str(a[1]) in str(a[0]),
            'find': lambda a: a[0].find(str(a[1])) if isinstance(a[0], str) else -1,
            'split': lambda a: a[0].split(a[1]) if len(a) > 1 else a[0].split(),
            'join': lambda a: a[1].join(str(x) for x in a[0]) if len(a) > 1 else " ".join(str(x) for x in a[0]),
            'random': lambda a: random.randint(int(a[0]), int(a[1])) if len(a) == 2 else (random.random() if len(a) == 0 else random.randint(0, int(a[0]))),
            'abs': lambda a: abs(a[0]),
            'round': lambda a: round(a[0]),
            'max': lambda a: max(a[0]) if len(a) == 1 and isinstance(a[0], list) else max(a),
            'min': lambda a: min(a[0]) if len(a) == 1 and isinstance(a[0], list) else min(a),
            'sqrt': lambda a: math.sqrt(a[0]),
            'pow': lambda a: a[0] ** a[1],
            'floor': lambda a: math.floor(a[0]),
            'ceil': lambda a: math.ceil(a[0]),
            'sort': lambda a: sorted(a[0]) if isinstance(a[0], list) else a[0],
            'reverse': lambda a: list(reversed(a[0])) if isinstance(a[0], list) else (a[0][::-1] if isinstance(a[0], str) else a[0]),
            'sum': lambda a: sum(a[0]) if isinstance(a[0], list) else 0,
            'push': lambda a: a[0].append(a[1]) or None,
            'pop': lambda a: a[0].pop() if isinstance(a[0], list) and len(a[0]) > 0 else None,
            'range': lambda a: list(range(int(a[0]), int(a[1]))) if len(a) == 2 else list(range(int(a[0]))),
            'number': lambda a: self.to_number(a[0]),
            'text': lambda a: str(a[0]),
            'string': lambda a: str(a[0]),
            'type': lambda a: self.get_type(a[0]),
            'readfile': lambda a: self.read_file(a[0]),
            'writefile': lambda a: self.write_file(a[0], a[1]),
            'exists': lambda a: os.path.exists(str(a[0])),
        }
    
    def to_number(self, val):
        try:
            if isinstance(val, str):
                return float(val) if '.' in val else int(val)
            return val
        except (ValueError, TypeError):
            return 0
    
    def get_type(self, val):
        if isinstance(val, bool): return "boolean"
        if isinstance(val, (int, float)): return "number"
        if isinstance(val, str): return "text"
        if isinstance(val, list): return "list"
        if isinstance(val, dict): return "dict"
        if val is None: return "null"
        return "unknown"
    
    def read_file(self, filename):
        try:
            with open(str(filename), 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            raise RexError(f"File '{filename}' not found")
    
    def write_file(self, filename, content):
        with open(str(filename), 'w', encoding='utf-8') as f:
            f.write(str(content))
        return "ok"
    
    def run(self, ast):
        # Hoist all function definitions first
        for node in ast:
            if node and node[0] == 'FUNC':
                self.functions[node[1]] = (node[2], node[3])
        # Then execute all statements
        for node in ast:
            self.execute(node, self.global_scope)
    
    def execute(self, node, scope):
        if node is None: return
        t = node[0]
        
        if t == 'PRINT':
            val = self.evaluate(node[1], scope)
            if isinstance(val, str) and '{' in val:
                # String interpolation: replace {var} with variable values
                def interpolate(match):
                    var_name = match.group(1)
                    if var_name in scope:
                        v = scope[var_name]
                    elif var_name in self.global_scope:
                        v = self.global_scope[var_name]
                    else:
                        # Try to evaluate as expression
                        try:
                            expr_tokens = tokenize_line(var_name, 0)
                            expr_parser = Parser(expr_tokens)
                            expr_ast = expr_parser.parse_expression()
                            v = self.evaluate(expr_ast, scope)
                        except:
                            v = match.group(0)
                    if isinstance(v, bool):
                        return "true" if v else "false"
                    return str(v)
                val = re.sub(r'\{([^}]+)\}', interpolate, val)
            if isinstance(val, bool):
                print("true" if val else "false")
            elif val is None:
                print("null")
            else:
                print(val)
        
        elif t == 'ASK':
            prompt = node[1]
            if prompt:
                print(prompt, end='', flush=True)
            try:
                user_input = input()
                try:
                    return float(user_input) if '.' in user_input else int(user_input)
                except ValueError:
                    return user_input
            except EOFError:
                return ""
        
        elif t == 'ASSIGN':
            name = node[1]
            val = self.evaluate(node[2], scope)
            if name in scope:
                scope[name] = val
            elif name in self.global_scope:
                self.global_scope[name] = val
            else:
                scope[name] = val
        
        elif t == 'IF':
            _, cond, body, elif_branches, else_body = node
            if self.evaluate(cond, scope):
                self.run_block(body, scope)
            else:
                matched = False
                for ec, eb in elif_branches:
                    if self.evaluate(ec, scope):
                        self.run_block(eb, scope)
                        matched = True
                        break
                if not matched and else_body:
                    self.run_block(else_body, scope)
        
        elif t == 'REPEAT':
            count = self.evaluate(node[1], scope)
            body = node[2]
            for _ in range(int(count)):
                try:
                    self.run_block(body, scope)
                except BreakException: break
                except ContinueException: continue
        
        elif t == 'WHILE':
            cond, body = node[1], node[2]
            while self.evaluate(cond, scope):
                try:
                    self.run_block(body, scope)
                except BreakException: break
                except ContinueException: continue
        
        elif t == 'EACH':
            _, var, iterable_expr, body = node
            iterable = self.evaluate(iterable_expr, scope)
            if isinstance(iterable, (list, str)):
                for item in iterable:
                    scope[var] = item
                    try:
                        self.run_block(body, scope)
                    except BreakException: break
                    except ContinueException: continue
        
        elif t == 'FUNC':
            self.functions[node[1]] = (node[2], node[3])
        
        elif t == 'RETURN':
            val = self.evaluate(node[1], scope) if node[1] else None
            raise ReturnException(val)
        
        elif t == 'BREAK': raise BreakException()
        elif t == 'SKIP': raise ContinueException()
        
        elif t == 'TRY':
            try_body, catch_body = node[1], node[2]
            try:
                self.run_block(try_body, scope)
            except Exception as e:
                if catch_body:
                    scope['error'] = str(e)
                    self.run_block(catch_body, scope)
        
        elif t == 'CALL':
            self.call_function(node[1], node[2], scope)
        
        elif t == 'ARRAY_SET':
            name = node[1]
            index = self.evaluate(node[2], scope)
            value = self.evaluate(node[3], scope)
            arr = scope.get(name, self.global_scope.get(name, []))
            if isinstance(arr, list):
                while len(arr) <= index:
                    arr.append(None)
                arr[index] = value
        
        elif t == 'EXPR':
            self.evaluate(node[1], scope)
    
    def run_block(self, statements, scope):
        for stmt in statements:
            self.execute(stmt, scope)
    
    def call_function(self, name, arg_exprs, scope):
        if name in self.builtins:
            args = [self.evaluate(a, scope) for a in arg_exprs]
            return self.builtins[name](args)
        
        if name not in self.functions:
            raise NameError(f"Function '{name}' not defined")
        
        params, body = self.functions[name]
        args = [self.evaluate(a, scope) for a in arg_exprs]
        func_scope = {}
        for i, p in enumerate(params):
            func_scope[p] = args[i] if i < len(args) else None
        
        try:
            self.run_block(body, func_scope)
        except ReturnException as e:
            return e.value
        return None
    
    def evaluate(self, node, scope):
        if node is None: return None
        t = node[0]
        
        if t == 'NUM': return node[1]
        elif t == 'STR': return node[1]
        elif t == 'BOOL': return node[1]
        elif t == 'NULL': return None
        elif t == 'VAR':
            name = node[1]
            if name in scope: return scope[name]
            elif name in self.global_scope: return self.global_scope[name]
            else: return name  # bare word = text string (Director's rule: no quotes needed)
        elif t == 'LIST':
            return [self.evaluate(item, scope) for item in node[1]]
        elif t == 'BINOP':
            return self.binop(node[1], self.evaluate(node[2], scope), self.evaluate(node[3], scope))
        elif t == 'UNOP':
            if node[1] == 'not': return not self.evaluate(node[2], scope)
        elif t == 'CALL':
            return self.call_function(node[1], node[2], scope)
        elif t == 'METHOD':
            base = self.evaluate(('VAR', node[1]), scope)
            args = [self.evaluate(a, scope) for a in node[3]]
            return self.method_call(base, node[2], args)
        elif t == 'PROP':
            val = self.evaluate(('VAR', node[1]), scope)
            return self.property_access(val, node[2])
        elif t == 'ARRAY_GET':
            name = node[1]
            arr = scope.get(name, self.global_scope.get(name, []))
            index = self.evaluate(node[2], scope)
            if isinstance(arr, dict): return arr.get(str(index))
            elif isinstance(arr, list) and isinstance(index, int) and 0 <= index < len(arr): return arr[index]
            elif isinstance(arr, str) and isinstance(index, int) and 0 <= index < len(arr): return arr[index]
            return None
        return None
    
    def property_access(self, val, prop):
        if isinstance(val, dict):
            if prop in val: return val[prop]
            if prop in ('len', 'length'): return len(val)
            if prop == 'keys': return list(val.keys())
            if prop == 'values': return list(val.values())
            return None
        if prop in ('len', 'length'): return len(val) if isinstance(val, (list, str)) else 0
        elif prop == 'upper': return str(val).upper()
        elif prop == 'lower': return str(val).lower()
        elif prop == 'first': return val[0] if isinstance(val, list) and len(val) > 0 else None
        elif prop == 'last': return val[-1] if isinstance(val, list) and len(val) > 0 else None
        elif prop == 'type': return self.get_type(val)
        elif prop == 'reverse': return list(reversed(val)) if isinstance(val, list) else (val[::-1] if isinstance(val, str) else val)
        elif prop == 'sort': return sorted(val) if isinstance(val, list) else val
        return None
    
    def method_call(self, val, method, args):
        if method in ('cut', 'slice'):
            start = int(args[0]) if len(args) > 0 else 0
            end = int(args[1]) if len(args) > 1 else len(val)
            return val[start:end]
        elif method == 'find': return val.find(str(args[0])) if isinstance(val, str) else -1
        elif method in ('push', 'add'):
            if isinstance(val, list): val.append(args[0])
            return None
        elif method == 'pop':
            return val.pop() if isinstance(val, list) and len(val) > 0 else None
        elif method == 'join':
            sep = args[0] if len(args) > 0 else " "
            return sep.join(str(x) for x in val) if isinstance(val, list) else str(val)
        elif method == 'replace': return str(val).replace(str(args[0]), str(args[1]))
        elif method == 'contains': return str(args[0]) in str(val)
        elif method == 'split': return val.split(args[0]) if len(args) > 0 else val.split()
        return None
    
    def binop(self, op, left, right):
        if op == '+':
            if isinstance(left, str) or isinstance(right, str): return str(left) + str(right)
            return left + right
        elif op == '-': return left - right
        elif op == '*': return left * right
        elif op == '/':
            if right == 0: raise ZeroDivisionError("Cannot divide by zero")
            return left / right
        elif op == '%': return left % right
        elif op == '^': return left ** right
        elif op == '==': return left == right
        elif op == '!=': return left != right
        elif op == '<': return left < right
        elif op == '>': return left > right
        elif op == '<=': return left <= right
        elif op == '>=': return left >= right
        elif op == 'and': return left and right
        elif op == 'or': return left or right
        else: raise ValueError(f"Unknown operator: {op}")

# ============================
# REX WEB — HTML/CSS/JS GENERATOR
# ============================


def _auto_generate_css(html_parts, user_css_rules):
    """Rex auto-creates beautiful CSS for elements the user didn't style.
    This is the '50% auto' part — user writes structure, Rex makes it look good."""
    
    # Scan HTML to find which elements/tags were used
    all_html = " ".join(html_parts)
    
    used_tags = set()
    used_classes = set()
    if 'header' in all_html or '<header' in all_html: used_tags.add('header')
    if 'footer' in all_html or '<footer' in all_html: used_tags.add('footer')
    if '<nav' in all_html: used_tags.add('nav')
    if 'class="card"' in all_html: used_classes.add('card')
    if 'class="container"' in all_html: used_classes.add('container')
    if 'class="heading"' in all_html: used_classes.add('heading')
    if 'class="subtitle"' in all_html: used_classes.add('subtitle')
    if 'class="paragraph"' in all_html: used_classes.add('paragraph')
    if 'class="item"' in all_html: used_classes.add('item')
    if 'class="list"' in all_html: used_classes.add('list')
    if '<button' in all_html: used_tags.add('button')
    if '<h1' in all_html: used_tags.add('h1')
    if '<h2' in all_html: used_tags.add('h2')
    if '<p>' in all_html or '<p ' in all_html: used_tags.add('p')
    if '<ul' in all_html: used_tags.add('ul')
    if '<li' in all_html: used_tags.add('li')
    if '<img' in all_html: used_tags.add('img')
    
    auto_css = {}
    
    # Body — always auto-style (dark gradient background)
    if 'body' not in user_css_rules:
        auto_css['body'] = [
            'margin: 0',
            'padding: 0',
            'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            'background: linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            'color: #e8e8e8',
            'min-height: 100vh',
        ]
    
    # Header — auto gradient
    if 'header' in used_tags and 'header' not in user_css_rules:
        auto_css['header'] = [
            'text-align: center',
            'padding: 60px 20px',
            'background: rgba(0,0,0,0.3)',
        ]
    
    # Footer — auto muted
    if 'footer' in used_tags and 'footer' not in user_css_rules:
        auto_css['footer'] = [
            'text-align: center',
            'padding: 30px',
            'color: #666',
            'font-size: 14px',
        ]
    
    # Container — auto center
    if 'container' in used_classes and '.container' not in user_css_rules:
        auto_css['.container'] = [
            'max-width: 900px',
            'margin: 0 auto',
            'padding: 20px',
        ]
    
    # Card — auto glassmorphism
    if 'card' in used_classes and '.card' not in user_css_rules:
        auto_css['.card'] = [
            'background: rgba(255,255,255,0.05)',
            'backdrop-filter: blur(10px)',
            'border: 1px solid rgba(255,255,255,0.1)',
            'border-radius: 15px',
            'padding: 25px',
            'margin: 15px 0',
        ]
    
    # Heading — auto accent color
    if 'heading' in used_classes and '.heading' not in user_css_rules:
        auto_css['.heading'] = [
            'color: #64f3d1',
            'font-size: 28px',
            'margin-bottom: 10px',
        ]
    
    # Subtitle — auto muted
    if 'subtitle' in used_classes and '.subtitle' not in user_css_rules:
        auto_css['.subtitle'] = [
            'color: #aaa',
            'font-size: 18px',
            'text-align: center',
        ]
    
    # Paragraph — auto readable
    if 'paragraph' in used_classes and '.paragraph' not in user_css_rules:
        auto_css['.paragraph'] = [
            'color: #ddd',
            'line-height: 1.6',
            'font-size: 16px',
        ]
    
    # List — auto styled
    if 'list' in used_classes and '.list' not in user_css_rules:
        auto_css['.list'] = ['padding: 10px 20px']
    
    # Item — auto spacing
    if 'item' in used_classes and '.item' not in user_css_rules:
        auto_css['.item'] = [
            'margin: 8px 0',
            'color: #ccc',
        ]
    
    # Button — auto styled
    if 'button' in used_tags and 'button' not in user_css_rules:
        auto_css['button'] = [
            'background: linear-gradient(135deg, #0f3460, #533483)',
            'color: white',
            'border: none',
            'padding: 12px 30px',
            'border-radius: 8px',
            'font-size: 16px',
            'cursor: pointer',
            'transition: all 0.3s ease',
        ]
        auto_css['button:hover'] = [
            'transform: scale(1.05)',
            'background: linear-gradient(135deg, #533483, #0f3460)',
        ]
    
    # H1 — auto if not styled by user
    if 'h1' in used_tags and 'h1' not in user_css_rules:
        auto_css['h1'] = ['margin: 0 0 10px 0']
    if 'h2' in used_tags and 'h2' not in user_css_rules:
        auto_css['h2'] = ['margin: 0 0 10px 0']
    if 'p' in used_tags and 'p' not in user_css_rules and 'paragraph' not in used_classes:
        auto_css['p'] = ['line-height: 1.6']
    if 'ul' in used_tags and 'ul' not in user_css_rules and 'list' not in used_classes:
        auto_css['ul'] = ['padding: 10px 25px']
    
    return auto_css


def _auto_generate_js(html_parts, user_js_parts):
    """Rex auto-creates JavaScript for common interactions.
    If user wrote their own JS, skip auto-generation."""
    
    if user_js_parts:
        return []  # User wrote JS, don't auto-generate
    
    all_html = " ".join(html_parts)
    auto_js = []
    
    # If there are buttons, add click feedback
    if '<button' in all_html:
        auto_js.append('// Rex auto-generated interactions')
        auto_js.append('document.addEventListener("DOMContentLoaded", function() {')
        auto_js.append('  var buttons = document.querySelectorAll("button");')
        auto_js.append('  buttons.forEach(function(btn) {')
        auto_js.append('    if (!btn.onclick) {')
        auto_js.append('      btn.addEventListener("click", function() {')
        auto_js.append('        btn.style.transform = "scale(0.95)";')
        auto_js.append('        setTimeout(function() { btn.style.transform = ""; }, 150);')
        auto_js.append('      });')
        auto_js.append('    }')
        auto_js.append('  });')
        auto_js.append('});')
    
    return auto_js

def rexweb_to_html(source):
    """Convert .rexweb source to HTML+CSS+JS"""
    
    TAG_MAP = {
        'page': 'div', 'container': 'div', 'section': 'section',
        'header': 'header', 'footer': 'footer', 'nav': 'nav',
        'heading': 'h1', 'title': 'h1', 'h1': 'h1', 'h2': 'h2', 'h3': 'h3',
        'subtitle': 'h2', 'subheading': 'h2',
        'paragraph': 'p', 'text': 'p', 'p': 'p',
        'button': 'button', 'link': 'a', 'image': 'img', 'img': 'img',
        'list': 'ul', 'item': 'li', 'input': 'input', 'box': 'div',
        'card': 'div', 'row': 'div', 'column': 'div', 'grid': 'div',
        'form': 'form', 'label': 'label', 'span': 'span',
        'video': 'video', 'audio': 'audio',
        'br': 'br', 'hr': 'hr',
    }
    
    CSS_MAP = {
        'color': 'color', 'background': 'background', 'bg': 'background',
        'size': 'font-size', 'fontsize': 'font-size', 'font': 'font-family',
        'width': 'width', 'height': 'height',
        'padding': 'padding', 'margin': 'margin',
        'border': 'border', 'radius': 'border-radius', 'round': 'border-radius',
        'shadow': 'box-shadow', 'opacity': 'opacity',
        'display': 'display', 'flex': 'display',
        'center': 'text-align', 'align': 'text-align',
        'position': 'position', 'top': 'top', 'left': 'left', 'right': 'right', 'bottom': 'bottom',
        'zindex': 'z-index', 'z-index': 'z-index',
        'gap': 'gap', 'direction': 'flex-direction', 'wrap': 'flex-wrap',
        'justify': 'justify-content', 'items': 'align-items',
        'transition': 'transition', 'transform': 'transform',
        'cursor': 'cursor', 'overflow': 'overflow',
        'backdrop': 'backdrop-filter',
        'max-width': 'max-width', 'max-height': 'max-height',
        'min-width': 'min-width', 'min-height': 'min-height',
        'line-height': 'line-height', 'font-size': 'font-size',
        'font-weight': 'font-weight', 'font-family': 'font-family',
        'text-align': 'text-align', 'text-decoration': 'text-decoration',
        'border-radius': 'border-radius', 'border-color': 'border-color',
        'box-shadow': 'box-shadow', 'flex-direction': 'flex-direction',
        'justify-content': 'justify-content', 'align-items': 'align-items',
        'flex-wrap': 'flex-wrap',
    }
    
    lines = source.split('\n')
    html_parts = []
    css_rules = {}
    js_parts = []
    mode = 'html'
    tag_stack = []
    current_style_selector = None
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        i += 1
        
        if not line or line.startswith('#'):
            continue
        
        # Mode switching
        if line in ('style', 'css'):
            mode = 'style'
            continue
        elif line in ('script', 'logic', 'js'):
            mode = 'script'
            continue
        elif line in ('page', 'html', 'web'):
            mode = 'html'
            continue
        
        if line in ('end', 'done', 'khatam'):
            if mode == 'style':
                current_style_selector = None
            elif mode == 'script':
                js_parts.append('}')
                mode = 'html'
            elif mode == 'html' and tag_stack:
                tag, attrs, content = tag_stack.pop()
                inner = ''.join(content)
                element = f'<{tag}>{inner}</{tag}>' if inner else f'<{tag}></{tag}>'
                if tag_stack:
                    tag_stack[-1][2].append(element)
                else:
                    html_parts.append(element)
                mode = 'html'
            continue
        
        if mode == 'style':
            # Format: selector: prop: val, prop: val, prop: val
            # Or: selector:hover: prop: val
            if ':' in line:
                parts = line.split(':', 1)
                selector = parts[0].strip()
                props_str = parts[1].strip()
                
                # Check for pseudo-selector: "button:hover: prop: val"
                # If props_str starts with a pseudo-class name followed by :, combine
                pseudo_classes = ['hover', 'active', 'focus', 'visited', 'before', 'after', 'first-child', 'last-child', 'nth-child']
                first_word = props_str.split(':')[0].strip().split()[0] if props_str else ''
                if first_word in pseudo_classes:
                    # Re-split: selector:hover : props
                    rest = props_str[len(first_word)+1:].strip()  # remove "hover:"
                    if rest.startswith(':'):
                        rest = rest[1:].strip()
                    # Wait, props_str = "hover: background: #533483, transform: scale(1.05)"
                    # first_word = "hover"
                    # We need to find ": " after hover
                    idx = props_str.find(':', len(first_word))
                    if idx > 0:
                        rest = props_str[idx+1:].strip()
                        props_str = rest
                    selector = selector + ':' + first_word
                
                # Parse properties — NO COMMAS needed!
                # Each property is "prop: val" separated by space
                # e.g. "background: black color: white padding: 20px"
                # Also support new-line separated props
                props = []
                # Find all "word: value" pairs in the string
                # Split by spaces but be careful with values like "rgb(0,0,0)"
                prop_pattern = re.findall(r'(\w[\w-]*):\s*([^:]+?)(?=\s+\w[\w-]*:|$)', props_str)
                for pk, pv in prop_pattern:
                    pk = pk.strip()
                    pv = pv.strip()
                    css_prop = CSS_MAP.get(pk.lower(), pk)
                    props.append(f'{css_prop}: {pv}')
                
                # Convert Rex element names to CSS class selectors
                # Handle pseudo-selectors like button:hover
                pseudo = ''
                base_sel = selector
                if ':' in base_sel and not base_sel.startswith(':'):
                    parts = base_sel.split(':', 1)
                    base_sel = parts[0].strip()
                    pseudo = ':' + parts[1].strip()
                
                # Standard HTML tags stay as-is, custom Rex elements get . prefix
                if base_sel.lower() in {'body', 'header', 'footer', 'nav', 'section', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li', 'ol', 'a', 'img', 'button', 'input', 'form', 'label', 'span', 'video', 'audio', 'br', 'hr', 'table', 'tr', 'td', 'th', 'html'}:
                    css_sel = base_sel + pseudo
                else:
                    css_sel = '.' + base_sel + pseudo
                
                if css_sel not in css_rules:
                    css_rules[css_sel] = []
                css_rules[css_sel].extend(props)
        
        elif mode == 'script':
            # Convert Rex logic to JavaScript
            js_line = line
            js_line = js_line.replace('func ', 'function ')
            if 'function ' in js_line and '(' in js_line and ')' in js_line and not js_line.endswith('{'):
                js_line += ' {'
            js_parts.append(js_line)
        
        elif mode == 'html':
            words = line.split(None, 1)
            tag_word = words[0].lower()
            rest = words[1] if len(words) > 1 else ""
            
            html_tag = TAG_MAP.get(tag_word, tag_word)
            
            content = ""
            attrs = {}
            
            # Add class for custom Rex elements (so CSS can target them)
            if tag_word != html_tag or tag_word in ('container', 'card', 'box', 'row', 'column', 'grid', 'heading', 'subtitle', 'paragraph', 'item', 'list'):
                attrs['class'] = tag_word
            
            if rest.startswith('"') or rest.startswith("'"):
                quote_char = rest[0]
                end = rest.find(quote_char, 1)
                if end > 0:
                    content = rest[1:end]
                    rest = rest[end+1:].strip()
            elif rest:
                content = rest
                rest = ""
            
            if rest:
                attr_matches = re.findall(r'(\w+):\s*(\S+)', rest)
                for key, val in attr_matches:
                    if key.lower() == 'src' or key.lower() == 'href':
                        attrs[key.lower()] = val
                    elif key.lower() == 'click':
                        attrs['onclick'] = val
                    elif key.lower() == 'style':
                        attrs['style'] = val
                    elif key.lower() == 'id':
                        attrs['id'] = val
                    elif key.lower() == 'class':
                        attrs['class'] = val
                    else:
                        attrs[key.lower()] = val
            
            attr_str = ""
            for k, v in attrs.items():
                attr_str += f' {k}="{v}"'
            
            if tag_word in ('br', 'hr'):
                element = f'<{html_tag}>'
                if tag_stack: tag_stack[-1][2].append(element)
                else: html_parts.append(element)
            elif tag_word in ('image', 'img'):
                element = f'<img{attr_str}>'
                if tag_stack: tag_stack[-1][2].append(element)
                else: html_parts.append(element)
            elif content:
                element = f'<{html_tag}{attr_str}>{content}</{html_tag}>'
                if tag_stack: tag_stack[-1][2].append(element)
                else: html_parts.append(element)
            else:
                tag_stack.append((html_tag, attrs, []))
    
    # === AUTO-GENERATE CSS (50% auto, 50% user) ===
    # If user didn't write any CSS, Rex creates beautiful default styling
    auto_css = _auto_generate_css(html_parts, css_rules)
    
    # Merge user CSS with auto CSS (user CSS overrides auto)
    all_css_rules = {}
    all_css_rules.update(auto_css)
    all_css_rules.update(css_rules)  # user rules override
    
    css_text = ""
    for selector, props in all_css_rules.items():
        css_text += f"  {selector} {{\n"
        for prop in props:
            css_text += f"    {prop};\n"
        css_text += "  }\n"
    
    # === AUTO-GENERATE JS (50% auto, 50% user) ===
    # If user didn't write any JS, Rex creates basic interactions
    auto_js = _auto_generate_js(html_parts, js_parts)
    
    all_js = auto_js + js_parts if not js_parts else js_parts
    js_text = "\n".join(all_js)
    
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rex Web Page</title>
<style>
{css_text}
</style>
</head>
<body>
{chr(10).join(html_parts)}
<script>
{js_text}
</script>
</body>
</html>"""
    
    return full_html


# ============================
# LIVE SERVER
# ============================

def start_server(directory='.', port=8000):
    os.chdir(directory)
    
    class RexHandler(SimpleHTTPRequestHandler):
        def do_GET(self):
            # Serve .rexweb files as HTML
            path = self.translate_path(self.path)
            
            if os.path.exists(path) and path.endswith('.rexweb'):
                with open(path, 'r', encoding='utf-8') as f:
                    source = f.read()
                html = rexweb_to_html(source)
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(html.encode('utf-8'))
                return
            
            # Also serve .rex files as HTML if accessed in browser
            if os.path.exists(path) and path.endswith('.rex'):
                with open(path, 'r', encoding='utf-8') as f:
                    source = f.read()
                # Run Rex and capture output
                import io
                old_stdout = sys.stdout
                sys.stdout = io.StringIO()
                try:
                    tokens = tokenize(source)
                    parser = Parser(tokens)
                    ast = parser.parse()
                    interpreter = Interpreter()
                    interpreter.run(ast)
                    output = sys.stdout.getvalue()
                except Exception as e:
                    output = f"Error: {e}"
                finally:
                    sys.stdout = old_stdout
                
                html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Rex Output</title>
<style>body {{ font-family: monospace; padding: 20px; background: #1a1a2e; color: #e8e8e8; }} pre {{ white-space: pre-wrap; }}</style>
</head><body><pre>{output}</pre></body></html>"""
                
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(html.encode('utf-8'))
                return
            
            super().do_GET()
    
    with socketserver.TCPServer(("", port), RexHandler) as httpd:
        print(f"\n  ╔════════════════════════════════════╗")
        print(f"  ║  Rex Live Server v{VERSION}             ║")
        print(f"  ║  Serving: {directory:<24} ║")
        print(f"  ║  URL: http://localhost:{port:<6}        ║")
        print(f"  ║  Press Ctrl+C to stop               ║")
        print(f"  ╚════════════════════════════════════╝\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

# ============================
# REPL
# ============================

def repl():
    print(f"\n  Rex v{VERSION} — Just Write English\n")
    print("  Commands: exit | help | test\n")
    
    interpreter = Interpreter()
    buffer = ""
    
    while True:
        try:
            prompt = "rex> " if not buffer else "...   "
            line = input(prompt)
            
            if line.strip() == 'exit':
                print("Goodbye!")
                break
            if line.strip() == 'help':
                print("  p Hello        → print Hello (no quotes!)")
                print("  p {x}          → print variable x")
                print("  x = 10         → variable")
                print("  if x > 5       → condition")
                print("  repeat 3       → loop")
                print("  func name()    → function")
                print("  end            → close block")
                continue
            if line.strip() == 'test':
                run_tests()
                continue
            
            if line.strip() == '':
                if buffer:
                    try:
                        tokens = tokenize(buffer)
                        parser = Parser(tokens)
                        ast = parser.parse()
                        interpreter.run(ast)
                    except Exception as e:
                        print(f"Error: {e}")
                    buffer = ""
                continue
            
            buffer += line + "\n"
            
            indent = len(line) - len(line.lstrip())
            block_keywords = ['if', 'agar', 'while', 'jab', 'repeat', 'dohra', 'loop', 'each', 'har', 'for', 'func', 'kaam', 'function', 'def', 'else', 'warna', 'try']
            has_block_kw = any(kw in line.split() for kw in block_keywords)
            has_end = 'end' in line.split() or 'khatam' in line.split() or 'done' in line.split()
            
            if indent == 0 and (has_end or not has_block_kw):
                try:
                    tokens = tokenize(buffer)
                    parser = Parser(tokens)
                    ast = parser.parse()
                    interpreter.run(ast)
                except Exception as e:
                    print(f"Error: {e}")
                buffer = ""
        except EOFError:
            break
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break

# ============================
# TEST SUITE
# ============================

def run_tests():
    test_code = '''# === REX v5.0 TEST SUITE ===

# Test 1: Ultra-short print (no quotes!)
p Hello World
p This is Rex v5

# Test 2: Print with quotes (backward compatible)
print "Hello from print"

# Test 3: Print variables with {}
x = 42
p {x}

# Test 4: Print expressions with {}
p {x + 8}
p {x * 2}

# Test 5: Variables
name = Abdullah
age = 25
p Name is {name}
p Age is {age}

# Test 6: Math
a = 10
b = 3
p Sum: {a + b}
p Power 2^10: {2 ^ 10}

# Test 7: Strings
p {name.upper}
p {name.lower}
p Length: {name.len}

# Test 8: Lists
fruits = ["apple", "banana", "mango"]
p First: {fruits[0]}
p Count: {fruits.len}

# Test 9: If-Else
score = 85
if score >= 90
  p A grade
else if score >= 80
  p B grade
else
  p Fail
end

# Test 10: While Loop
i = 1
while i <= 3
  p Count: {i}
  i = i + 1
end

# Test 11: Repeat
repeat 2
  p Rex is number 1!
end

# Test 12: Each Loop
each fruit in fruits
  p Fruit: {fruit}
end

# Test 13: Functions
func greet(name)
  p Hello {name}
  return "Done"
end
greet("Director")

# Test 14: Factorial
func factorial(n)
  if n <= 1
    return 1
  else
    return n * factorial(n - 1)
  end
end
p 5! = {factorial(5)}
p 10! = {factorial(10)}

# Test 15: FizzBuzz
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

# Test 16: Math functions
p sqrt(16) = {sqrt(16)}
p abs(-5) = {abs(-5)}

# Test 17: Try-Catch
try
  p {undefined_var}
catch
  p Error caught!
end

# Test 18: Break
i = 1
while i <= 100
  if i == 5
    break
  end
  p Loop: {i}
  i = i + 1
end

print ""
print "=== All 18 tests passed! ==="'''
    
    with open('/tmp/rex_test.rex', 'w') as f:
        f.write(test_code)
    
    print(f"Running Rex v{VERSION} test suite...\n")
    run_file('/tmp/rex_test.rex')

def run_file(filename):
    if not os.path.exists(filename):
        print(f"Error: File '{filename}' not found")
        return
    
    with open(filename, 'r', encoding='utf-8') as f:
        source = f.read()
    
    try:
        tokens = tokenize(source)
        parser = Parser(tokens)
        ast = parser.parse()
        interpreter = Interpreter()
        interpreter.run(ast)
    except SyntaxError as e:
        print(f"Syntax Error: {e}")
    except NameError as e:
        print(f"Name Error: {e}")
    except Exception as e:
        print(f"Error: {e}")

# ============================
# MAIN
# ============================

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(f"Rex (ریکس) v{VERSION} — The World's #1 Simplest Language")
        print()
        print("Usage:")
        print("  python3 rex.py run <file.rex>       Run Rex script")
        print("  python3 rex.py web <file.rexweb>     Convert Rex Web to HTML")
        print("  python3 rex.py serve <folder>       Start live server")
        print("  python3 rex.py repl                 Interactive mode")
        print("  python3 rex.py test                Run tests")
        print()
        repl()
    elif sys.argv[1] == 'run':
        run_file(sys.argv[2] if len(sys.argv) > 2 else '')
    elif sys.argv[1] == 'web':
        if len(sys.argv) > 2:
            with open(sys.argv[2], 'r', encoding='utf-8') as f:
                source = f.read()
            html = rexweb_to_html(source)
            out_file = sys.argv[2].replace('.rexweb', '.html')
            with open(out_file, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"Generated: {out_file}")
        else:
            print("Usage: python3 rex.py web <file.rexweb>")
    elif sys.argv[1] == 'serve':
        directory = sys.argv[2] if len(sys.argv) > 2 else '.'
        port = int(sys.argv[3]) if len(sys.argv) > 3 else 8000
        start_server(directory, port)
    elif sys.argv[1] == 'repl':
        repl()
    elif sys.argv[1] == 'test':
        run_tests()
    else:
        run_file(sys.argv[1])
