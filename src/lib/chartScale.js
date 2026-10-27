// Axis scale for bar and line charts: a "nice" maximum and evenly spaced ticks.

const NICE_STEPS = [1, 2, 2.5, 5, 10]

// Smallest step from 1, 2, 2.5, 5 × 10^k that is at least rawStep.
function niceStep(rawStep) {
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  return NICE_STEPS.find((step) => step * magnitude >= rawStep - 1e-12) * magnitude
}

export function niceScale(maxValue, tickCount = 4) {
  if (!(maxValue > 0)) return { max: 1, ticks: [0, 1] }
  const step = niceStep(maxValue / tickCount)
  const max = Math.ceil(maxValue / step - 1e-9) * step
  const ticks = []
  for (let i = 0; i * step <= max + step / 2; i += 1) ticks.push(i * step)
  return { max, ticks }
}
