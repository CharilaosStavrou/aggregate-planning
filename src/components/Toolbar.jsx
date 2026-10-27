import { useRef } from 'react'

// Data actions: load sample, new project, export and import JSON.
function Toolbar({ onLoadSample, onNew, onExport, onImport }) {
  const fileInput = useRef(null)

  function handleFile(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (file) onImport(file)
  }

  return (
    <div className="toolbar">
      <button type="button" onClick={onLoadSample}>Load sample</button>
      <button type="button" onClick={onNew}>New</button>
      <button type="button" onClick={onExport}>Export JSON</button>
      <button type="button" onClick={() => fileInput.current.click()}>Import JSON</button>
      <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={handleFile} />
    </div>
  )
}

export default Toolbar
