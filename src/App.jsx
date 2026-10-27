import { useState } from 'react'
import Header from './components/Header.jsx'
import InputPanel from './components/InputPanel.jsx'
import { sampleProject } from './data/sampleProject.js'

function App() {
  const [project, setProject] = useState(sampleProject)

  return (
    <div className="app">
      <Header />
      <main className="appMain">
        <InputPanel project={project} onChange={setProject} />
      </main>
    </div>
  )
}

export default App
