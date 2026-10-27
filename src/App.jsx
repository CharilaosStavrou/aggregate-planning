import { useMemo } from 'react'
import ComparisonPanel from './components/ComparisonPanel.jsx'
import Header from './components/Header.jsx'
import InputPanel from './components/InputPanel.jsx'
import StrategyPanel from './components/StrategyPanel.jsx'
import Toolbar from './components/Toolbar.jsx'
import { useProject } from './hooks/useProject.js'
import { optimizePlan } from './lib/optimizer.js'
import { computeStrategyResults } from './lib/strategyResults.js'

function App() {
  const store = useProject()
  const { project } = store
  // The LP only depends on the inputs, not on the Mixed plan.
  const { settings, costs, demand } = project
  const optimalResult = useMemo(() => optimizePlan({ settings, costs, demand }), [settings, costs, demand])
  const results = computeStrategyResults(project, optimalResult)

  return (
    <div className="app">
      <Header>
        <Toolbar
          onLoadSample={store.loadSample}
          onNew={store.createNew}
          onExport={store.exportJson}
          onImport={store.importFile}
        />
      </Header>
      <main className="appMain">
        {store.importError && (
          <div className="status statusError importError" role="alert">
            <span>{store.importError}</span>
            <button type="button" onClick={store.dismissImportError}>Dismiss</button>
          </div>
        )}
        <InputPanel project={project} onChange={store.setProject} />
        <ComparisonPanel results={results} />
        <StrategyPanel
          project={project}
          results={results}
          onProjectChange={store.setProject}
          onResetMixed={store.resetMixedPlan}
        />
      </main>
    </div>
  )
}

export default App
