import BarChart from './charts/BarChart.jsx'

// The three monthly charts for one plan.
function PlanCharts({ demand, plan }) {
  const labels = demand.map((entry) => entry.month)
  const totalProduction = plan.map((m) => m.regularProduction + m.overtimeProduction + m.subcontracted)

  return (
    <div className="chartGrid">
      <BarChart
        title="Demand vs total production (units)"
        labels={labels}
        series={[{ label: 'Total production', values: totalProduction, color: 'var(--color-accent)' }]}
        line={{ label: 'Demand', values: demand.map((entry) => entry.units), color: 'var(--color-series-neutral)' }}
      />
      <BarChart
        title="Inventory and backorders (units, end of month)"
        labels={labels}
        series={[
          { label: 'Inventory', values: plan.map((m) => m.inventory), color: 'var(--color-accent)' },
          { label: 'Backorders', values: plan.map((m) => m.backorders), color: 'var(--color-warning)' },
        ]}
      />
      <BarChart
        title="Workforce (workers)"
        labels={labels}
        series={[{ label: 'Workers', values: plan.map((m) => m.workers), color: 'var(--color-accent)' }]}
      />
    </div>
  )
}

export default PlanCharts
