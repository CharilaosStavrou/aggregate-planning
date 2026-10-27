import NumberInput from './NumberInput.jsx'

// Editable 12-month demand forecast.
function DemandTable({ demand, onChange }) {
  const total = demand.reduce((sum, entry) => sum + entry.units, 0)

  return (
    <section className="panel">
      <h2>Demand forecast</h2>
      <table className="dataTable">
        <thead>
          <tr>
            <th>Month</th>
            <th>Demand (units)</th>
          </tr>
        </thead>
        <tbody>
          {demand.map((entry, index) => (
            <tr key={index}>
              <td>{entry.month}</td>
              <td>
                <NumberInput
                  value={entry.units}
                  ariaLabel={`Demand ${entry.month}`}
                  onCommit={(units) => onChange(index, units)}
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td className="numeric">{total.toLocaleString('en-US')}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  )
}

export default DemandTable
