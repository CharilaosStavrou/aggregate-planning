import { useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import InputPanel from './components/InputPanel.jsx'
import MixedPlanPanel from './components/MixedPlanPanel.jsx'
import OptimalPlanPanel from './components/OptimalPlanPanel.jsx'
import { sampleProject } from './data/sampleProject.js'
import { decisionsFromPlan } from './lib/mixedPlan.js'
import { optimizePlan } from './lib/optimizer.js'
import { levelPlan } from './lib/strategies.js'

function App() {
  const [project, setProject] = useState(sampleProject)
  const [mixedDecisions, setMixedDecisions] = useState(() => decisionsFromPlan(levelPlan(sampleProject)))
  const optimalResult = useMemo(() => optimizePlan(project), [project])

  return (
    <div className="app">
      <Header />
      <main className="appMain">
        <InputPanel project={project} onChange={setProject} />
        <MixedPlanPanel
          project={project}
          decisions={mixedDecisions}
          onChange={setMixedDecisions}
          onReset={() => setMixedDecisions(decisionsFromPlan(levelPlan(project)))}
        />
        <OptimalPlanPanel project={project} result={optimalResult} />
      </main>
    </div>
  )
}

export default App
