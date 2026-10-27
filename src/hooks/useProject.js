import { useEffect, useState } from 'react'
import { sampleProject } from '../data/sampleProject.js'
import { decisionsFromPlan, withDefaultMixedPlan } from '../lib/mixedPlan.js'
import { createEmptyProject } from '../lib/model.js'
import { loadFromStorage, parseProjectJson, saveToStorage, serializeProject } from '../lib/projectIO.js'
import { levelPlan } from '../lib/strategies.js'

const REPLACE_MESSAGE = 'Replace the current data? Unsaved changes will be lost unless you export them first.'

function getStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function initialProject() {
  const storage = getStorage()
  return (storage && loadFromStorage(storage)) ?? withDefaultMixedPlan(sampleProject)
}

// Project state with auto-save to localStorage and the toolbar actions.
export function useProject() {
  const [project, setProject] = useState(initialProject)
  const [importError, setImportError] = useState(null)

  useEffect(() => {
    const storage = getStorage()
    if (storage) saveToStorage(storage, project)
  }, [project])

  function replaceProject(next) {
    if (!window.confirm(REPLACE_MESSAGE)) return
    setProject(withDefaultMixedPlan(next))
    setImportError(null)
  }

  async function importFile(file) {
    const { project: imported, error } = parseProjectJson(await file.text())
    if (error) {
      setImportError(`Could not import "${file.name}": ${error} Current data was kept.`)
      return
    }
    replaceProject(imported)
  }

  function exportJson() {
    const url = URL.createObjectURL(new Blob([serializeProject(project)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'aggregate-plan.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    project,
    setProject,
    importError,
    dismissImportError: () => setImportError(null),
    loadSample: () => replaceProject(sampleProject),
    createNew: () => replaceProject(createEmptyProject()),
    resetMixedPlan: () => setProject({ ...project, mixedPlan: decisionsFromPlan(levelPlan(project)) }),
    importFile,
    exportJson,
  }
}
