# ========================================
# REX v5.0 COMPREHENSIVE BUG HUNT TESTS
# ========================================

# --- TEST 1: String interpolation edge cases ---
x = 42
name = "Abdullah"
p {x} and {name}
p {x + 8}
p Value: {x} Name: {name}
# p Empty: {} end

# --- TEST 2: Nested functions & recursion ---
func fibonacci(n)
  if n <= 1
    return n
  else
    return fibonacci(n - 1) + fibonacci(n - 2)
  end
end
p fib(10) = {fibonacci(10)}

# --- TEST 3: String methods ---
s = "Hello World"
p upper: {s.upper}
p lower: {s.lower}
p length: {s.len}

# --- TEST 4: Lists edge cases ---
nums = [1, 2, 3, 4, 5]
p first: {nums[0]}
p last: {nums[4]}
p count: {nums.len}
p index out of bounds: {nums[10]}

# --- TEST 5: Empty list ---
empty_list = []
p empty len: {empty_list.len}

# --- TEST 6: Deeply nested if/else ---
func classify(n)
  if n > 100
    if n > 1000
      return "huge"
    else
      return "big"
    end
  else
    if n > 50
      return "medium"
    else
      if n > 10
        return "small"
      else
        return "tiny"
      end
    end
  end
end
p classify(5) = {classify(5)}
p classify(25) = {classify(25)}
p classify(75) = {classify(75)}
p classify(500) = {classify(500)}
p classify(5000) = {classify(5000)}

# --- TEST 7: While loop with break ---
i = 0
while i < 100
  if i == 5
    break
  end
  p loop break: {i}
  i = i + 1
end

# --- TEST 8: While loop with skip (continue) ---
j = 0
while j < 5
  j = j + 1
  if j == 3
    skip
  end
  p skip test: {j}
end

# --- TEST 9: Repeat with break ---
repeat 10
  if true
    p repeat break test passed
    break
  end
end

# --- TEST 10: Each loop ---
fruits = ["apple", "banana", "cherry"]
each f in fruits
  p fruit: {f}
end

# --- TEST 11: Nested loops ---
repeat 3
  repeat 2
    p nested loop
  end
end

# --- TEST 12: Math functions ---
p sqrt: {sqrt(16)}
p abs: {abs(-42)}
p pow: {pow(2, 10)}
p max: {max(10, 20, 30)}
p min: {min(10, 20, 30)}
p round: {round(3.7)}
p floor: {floor(3.9)}
p ceil: {ceil(3.1)}

# --- TEST 13: Boolean logic ---
t = true
f = false
p true and false: {t and f}
p true or false: {t or f}
p not true: {not t}

# --- TEST 14: String concatenation ---
a = "Hello"
b = "World"
p concat: {a + " " + b}

# --- TEST 15: Number operations ---
p addition: {5 + 3}
p subtraction: {10 - 4}
p multiplication: {6 * 7}
p division: {20 / 4}
p modulo: {10 % 3}
p power: {2 ^ 8}

# --- TEST 16: Try/Catch ---
try
  x = undefined_var
  p this should not print
catch
  p caught an error
end

# --- TEST 17: Variable scoping in functions ---
global_var = "I am global"
func scope_test()
  local_var = "I am local"
  p {global_var}
  p {local_var}
end
scope_test()

# --- TEST 18: Large numbers ---
p big number: {9999999999}
p math: {1000000 * 1000000}

# --- TEST 19: Special characters in strings ---
p Hello "World" with quotes
p Tab	test
p Newline test

# --- TEST 20: Urdu keywords ---
agar 5 > 3
  p Urdu if works
warna
  p Urdu else
khatam

# --- TEST 21: Multiple assignment ---
a = 1
b = 2
c = 3
p a={a} b={b} c={c}

# --- TEST 22: Function with no return ---
func no_return()
  p no return function
end
no_return()
p after no_return

# --- TEST 23: Chained string methods ---
text = "Rex"
p {text.upper.lower}

# --- TEST 24: List operations ---
list1 = [1, 2, 3]
p list1: {list1[0]}
p len: {list1.len}

# --- TEST 25: Comparison operators ---
p 5 == 5: {5 == 5}
p 5 != 3: {5 != 3}
p 5 < 10: {5 < 10}
p 5 > 3: {5 > 3}
p 5 <= 5: {5 <= 5}
p 5 >= 5: {5 >= 5}

print ""
print "=== Bug Hunt Complete ==="
