// Number formatting for tables and charts.

export function formatNumber(value, maximumFractionDigits = 1) {
  return value.toLocaleString('en-US', { maximumFractionDigits })
}

export function formatCurrency(value) {
  return `€${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
