import { formatCurrency, formatNumber } from '../lib/format.js'
import NumberInput from './NumberInput.jsx'

const COLUMNS = [
  { key: 'workers', label: 'Workers', rules: { integer: true }, total: false },
  { key: 'hired', label: 'Hired' },
  { key: 'laidOff', label: 'Laid off' },
  { key: 'regularProduction', label: 'Regular prod.' },
  { key: 'overtimeHours', label: 'Overtime h', rules: {} },
  { key: 'overtimeProduction', label: 'Overtime prod.' },
  { key: 'subcontracted', label: 'Subcontracted', rules: {} },
  { key: 'inventory', label: 'Inventory', total: false },
  { key: 'backorders', label: 'Backorders', total: false },
]

// Monthly plan table. When editable, the columns that have rules
// (workers, overtime hours, subcontracted) become inputs.
function PlanTable({ demand, plan, evaluation, editable = false, onEdit }) {
  const sum = (key) => plan.reduce((total, month) => total + month[key], 0)

  return (
    <div className="tableScroll">
      <table className="dataTable planTable">
        <thead>
          <tr>
            <th>Month</th>
            <th className="numeric">Demand</th>
            {COLUMNS.map((column) => (
              <th key={column.key} className={editable && column.rules ? 'numeric editableColumn' : 'numeric'}>
                {column.label}
              </th>
            ))}
            <th className="numeric">Cost</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          {plan.map((month, t) => {
            const issues = evaluation.violations.filter((v) => v.monthIndex === t)
            return (
              <tr key={t} className={issues.length > 0 ? 'hasIssue' : undefined}>
                <td>{demand[t].month}</td>
                <td className="numeric">{formatNumber(demand[t].units)}</td>
                {COLUMNS.map((column) => (
                  <td key={column.key} className="numeric">
                    {editable && column.rules ? (
                      <NumberInput
                        value={month[column.key]}
                        rules={column.rules}
                        ariaLabel={`${column.label} ${demand[t].month}`}
                        onCommit={(value) => onEdit(t, column.key, value)}
                      />
                    ) : (
                      formatNumber(month[column.key])
                    )}
                  </td>
                ))}
                <td className="numeric">{formatCurrency(evaluation.monthlyCosts[t])}</td>
                <td className="issues">{issues.map((v) => v.detail).join('; ')}</td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td className="numeric">{formatNumber(demand.reduce((total, d) => total + d.units, 0))}</td>
            {COLUMNS.map((column) => (
              <td key={column.key} className="numeric">
                {column.total === false ? '' : formatNumber(sum(column.key))}
              </td>
            ))}
            <td className="numeric">{formatCurrency(evaluation.totalCost)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default PlanTable
