import { COST_FIELDS, SETTINGS_FIELDS } from '../lib/fields.js'
import { updateCost, updateDemand, updateSetting } from '../lib/model.js'
import DemandTable from './DemandTable.jsx'
import FieldSection from './FieldSection.jsx'

// The three input sections: settings, costs and demand forecast.
function InputPanel({ project, onChange }) {
  return (
    <div className="inputGrid">
      <FieldSection
        title="Settings"
        fields={SETTINGS_FIELDS}
        values={project.settings}
        onChange={(key, value) => onChange(updateSetting(project, key, value))}
      />
      <FieldSection
        title="Costs"
        fields={COST_FIELDS}
        values={project.costs}
        onChange={(key, value) => onChange(updateCost(project, key, value))}
      />
      <DemandTable
        demand={project.demand}
        onChange={(index, units) => onChange(updateDemand(project, index, units))}
      />
    </div>
  )
}

export default InputPanel
