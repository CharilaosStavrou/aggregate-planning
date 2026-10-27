import { formatCompactCurrency, formatCurrency, formatPercent } from '../lib/format.js'
import { COST_CATEGORIES } from '../lib/planEvaluation.js'
import { STRATEGIES, savingsPercent } from '../lib/strategyResults.js'
import BarChart from './charts/BarChart.jsx'

// Total cost per strategy, cost breakdown by category and savings of Optimal.
function ComparisonPanel({ results }) {
  const evaluations = STRATEGIES.map(({ key }) => results[key].evaluation)
  const optimalCost = results.optimal.evaluation?.totalCost
  const cell = (evaluation, render) => (evaluation ? render(evaluation) : '–')

  return (
    <section className="panel">
      <h2>Strategy comparison</h2>
      <div className="comparisonLayout">
        <BarChart
          title="Total cost per strategy"
          labels={STRATEGIES.map((s) => s.label)}
          series={[{ label: 'Total cost', values: evaluations.map((e) => e?.totalCost ?? 0), color: 'var(--color-accent)' }]}
          formatValue={formatCompactCurrency}
          formatLabel={formatCurrency}
          showValues
        />
        <table className="dataTable comparisonTable">
          <thead>
            <tr>
              <th>Cost category</th>
              {STRATEGIES.map((s) => <th key={s.key} className="numeric">{s.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {COST_CATEGORIES.map((category) => (
              <tr key={category.key}>
                <td>{category.label}</td>
                {evaluations.map((e, i) => (
                  <td key={i} className="numeric">{cell(e, (ev) => formatCurrency(ev.costBreakdown[category.key]))}</td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total cost</td>
              {evaluations.map((e, i) => <td key={i} className="numeric">{cell(e, (ev) => formatCurrency(ev.totalCost))}</td>)}
            </tr>
            <tr>
              <td>Optimal saves</td>
              {evaluations.map((e, i) => (
                <td key={i} className="numeric">
                  {optimalCost === undefined || !e || STRATEGIES[i].key === 'optimal'
                    ? '–'
                    : formatPercent(savingsPercent(e.totalCost, optimalCost))}
                </td>
              ))}
            </tr>
            <tr>
              <td>Constraint violations</td>
              {evaluations.map((e, i) => (
                <td key={i} className={e?.violations.length ? 'numeric textError' : 'numeric textOk'}>
                  {cell(e, (ev) => (ev.violations.length ? `⚠ ${ev.violations.length}` : '✓ none'))}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}

export default ComparisonPanel
