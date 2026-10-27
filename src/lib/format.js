// Number formatting for tables and charts.

export function formatNumber(value, maximumFractionDigits = 1) {
  return value.toLocaleString('en-US', { maximumFractionDigits })
}

export function formatCurrency(value) {
  return `€${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

// Short currency for chart axes and labels, e.g. €2.29M.
export function formatCompactCurrency(value) {
  return `€${value.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 2 })}`
}

export function formatPercent(value) {
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`
}
