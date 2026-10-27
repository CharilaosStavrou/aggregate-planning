import { useState } from 'react'
import { parseDecimal, validateNumber } from '../lib/validation.js'

// Text input for numbers (accepts a comma as decimal point). Valid values are
// committed while typing; an invalid value shows an error and is reverted to
// the last valid value on blur.
function NumberInput({ value, onCommit, rules, ariaLabel }) {
  // draft is the raw text while the user edits; null means "show value".
  const [draft, setDraft] = useState(null)
  const error = draft === null ? null : validateNumber(parseDecimal(draft), rules)

  function handleChange(event) {
    const text = event.target.value
    setDraft(text)
    const parsed = parseDecimal(text)
    if (validateNumber(parsed, rules) === null) onCommit(parsed)
  }

  return (
    <span className="numberInput">
      <input
        type="text"
        inputMode="decimal"
        className={error ? 'invalid' : undefined}
        value={draft ?? String(value)}
        onChange={handleChange}
        onBlur={() => setDraft(null)}
        aria-label={ariaLabel}
        aria-invalid={error ? true : undefined}
      />
      {error && <span className="fieldError">{error}</span>}
    </span>
  )
}

export default NumberInput
