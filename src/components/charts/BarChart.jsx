import { niceScale } from '../../lib/chartScale.js'
import { formatNumber } from '../../lib/format.js'

const WIDTH = 420
const HEIGHT = 220
const MARGIN = { top: 18, right: 6, bottom: 24, left: 52 }
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom
const BAR_GAP = 2

// Bar with rounded data end (top) and a square base on the baseline.
function barPath(x, y, width, height) {
  const r = Math.min(4, width / 2, height)
  const base = y + height
  return `M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${base} Z`
}

// Grouped bar chart with an optional line series drawn on top.
// series: [{ label, values, color }]; line: { label, values, color } or undefined.
// formatValue formats axis ticks; formatLabel formats value labels and tooltips.
function BarChart({ title, labels, series, line, formatValue = formatNumber, formatLabel = formatValue, showValues = false }) {
  const allValues = [...series.flatMap((s) => s.values), ...(line ? line.values : [])]
  const scale = niceScale(Math.max(0, ...allValues))
  const y = (value) => MARGIN.top + PLOT_HEIGHT * (1 - value / scale.max)
  const band = PLOT_WIDTH / labels.length
  const groupWidth = band * (series.length > 1 ? 0.76 : 0.6)
  const barWidth = (groupWidth - BAR_GAP * (series.length - 1)) / series.length
  const bandX = (i) => MARGIN.left + band * i
  const center = (i) => bandX(i) + band / 2
  const legend = line ? [...series, line] : series

  return (
    <figure className="chart">
      <figcaption>{title}</figcaption>
      {legend.length > 1 && (
        <div className="chartLegend">
          {legend.map((item) => (
            <span key={item.label}>
              <i className={item === line ? 'swatch swatchLine' : 'swatch'} style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title}>
        {scale.ticks.map((tick) => (
          <g key={tick}>
            <line className="gridLine" x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={y(tick)} y2={y(tick)} />
            <text className="axisLabel" x={MARGIN.left - 6} y={y(tick)} dy="0.32em" textAnchor="end">
              {formatValue(tick)}
            </text>
          </g>
        ))}
        {series.map((s, k) => s.values.map((value, i) => {
          const x = center(i) - groupWidth / 2 + k * (barWidth + BAR_GAP)
          return value > 0 && (
            <path key={`${k}-${i}`} d={barPath(x, y(value), barWidth, y(0) - y(value))} style={{ fill: s.color }} />
          )
        }))}
        {showValues && series.length === 1 && series[0].values.map((value, i) => (
          <text key={i} className="valueLabel" x={center(i)} y={y(value) - 5} textAnchor="middle">
            {formatLabel(value)}
          </text>
        ))}
        {line && (
          <g>
            <polyline
              className="chartLine"
              points={line.values.map((value, i) => `${center(i)},${y(value)}`).join(' ')}
              style={{ stroke: line.color }}
            />
            {line.values.map((value, i) => (
              <circle key={i} className="chartMarker" cx={center(i)} cy={y(value)} r={4} style={{ fill: line.color }} />
            ))}
          </g>
        )}
        <line className="baseline" x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={y(0)} y2={y(0)} />
        {labels.map((label, i) => (
          <g key={label}>
            <text className="axisLabel" x={center(i)} y={HEIGHT - 8} textAnchor="middle">{label}</text>
            <rect className="hoverBand" x={bandX(i)} y={MARGIN.top} width={band} height={PLOT_HEIGHT}>
              <title>
                {[label, ...legend.map((item) => `${item.label}: ${formatLabel(item.values[i])}`)].join('\n')}
              </title>
            </rect>
          </g>
        ))}
      </svg>
    </figure>
  )
}

export default BarChart
