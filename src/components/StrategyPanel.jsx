import { useState } from 'react'
import { STRATEGIES } from '../lib/strategyResults.js'
import StrategyDetail from './StrategyDetail.jsx'

// Strategy tabs with the detail view of the selected strategy.
function StrategyPanel({ project, results, onProjectChange, onResetMixed }) {
  const [selected, setSelected] = useState('optimal')

  return (
    <section className="panel">
      <h2>Plan by strategy</h2>
      <div className="tabs" role="tablist">
        {STRATEGIES.map((strategy) => {
          const violations = results[strategy.key].evaluation?.violations.length ?? 0
          return (
            <button
              key={strategy.key}
              type="button"
              role="tab"
              aria-selected={selected === strategy.key}
              className={selected === strategy.key ? 'tab active' : 'tab'}
              onClick={() => setSelected(strategy.key)}
            >
              {strategy.label}
              {violations > 0 && <span className="tabBadge" title={`${violations} violations`}>⚠ {violations}</span>}
            </button>
          )
        })}
      </div>
      <StrategyDetail
        strategyKey={selected}
        project={project}
        entry={results[selected]}
        onProjectChange={onProjectChange}
        onResetMixed={onResetMixed}
      />
    </section>
  )
}

export default StrategyPanel
