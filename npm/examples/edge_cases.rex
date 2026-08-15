# Edge case tests for Rex v5.0

# Test: Missing 'end' (should give error)
func missing_end()
  p this function has no end

# Test: Unclosed string
p "Hello World

# Test: Division by zero
p 10 / 0

# Test: Accessing undefined variable in expression
p {undefined_var + 5}

# Test: Nested function calls
func double(x)
  return x * 2
end
func quadruple(x)
  return double(double(x))
end
p quad: {quadruple(5)}

# Test: Function called before definition
p early: {early_func()}
func early_func()
  return "defined later"
end

# Test: String with braces
p This has {literal} braces

# Test: Empty function body
func empty_func()
end
empty_func()
p empty func called

# Test: Multiple returns
func multi_return(n)
  if n > 0
    return "positive"
  else
    return "negative"
  end
end
p {multi_return(5)}
p {multi_return(-3)}

# Test: Number edge cases
p zero: {0}
p negative: {-42}
p float: {3.14}
p big: {999999999999999}

# Test: Boolean as string
p true string: {true}
p false string: {false}
p null string: {null}
