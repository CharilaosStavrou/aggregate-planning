// Parsing and validation of numeric user input.

// Parses a decimal number typed by the user. Accepts a comma or a dot as
// decimal separator. Returns NaN for anything that is not a plain number.
export function parseDecimal(text) {
  const normalized = String(text).trim().replace(',', '.')
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(normalized)) return NaN
  return Number(normalized)
}

// Returns an error message for a parsed value, or null when it is valid.
// rules: { positive: value must be > 0, integer: value must be whole }
export function validateNumber(value, rules = {}) {
  if (Number.isNaN(value)) return 'Enter a number'
  if (value < 0) return 'Cannot be negative'
  if (rules.positive && value === 0) return 'Must be above 0'
  if (rules.integer && !Number.isInteger(value)) return 'Must be a whole number'
  return null
}
