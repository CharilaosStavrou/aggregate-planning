import NumberInput from './NumberInput.jsx'

// A titled form section rendering one row per field definition.
function FieldSection({ title, fields, values, onChange }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="fieldList">
        {fields.map((field) => (
          <label key={field.key} className="fieldRow">
            <span className="fieldLabel">{field.label}</span>
            {field.type === 'boolean' ? (
              <input
                type="checkbox"
                checked={values[field.key]}
                onChange={(event) => onChange(field.key, event.target.checked)}
              />
            ) : (
              <NumberInput
                value={values[field.key]}
                rules={field.rules}
                ariaLabel={field.label}
                onCommit={(value) => onChange(field.key, value)}
              />
            )}
            <span className="fieldUnit">{field.unit}</span>
          </label>
        ))}
      </div>
    </section>
  )
}

export default FieldSection
