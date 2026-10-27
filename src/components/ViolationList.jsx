// Plan-level status: lists violations that are not tied to a single month,
// or confirms that the plan is feasible.
function ViolationList({ violations }) {
  const general = violations.filter((v) => v.monthIndex === null)
  if (violations.length === 0) return <p className="status statusOk">No constraint violations.</p>

  return (
    <div className="status statusError">
      <strong>{violations.length} constraint violation{violations.length > 1 ? 's' : ''}</strong>
      {general.length > 0 && (
        <ul>
          {general.map((v) => <li key={v.type}>{v.message}</li>)}
        </ul>
      )}
    </div>
  )
}

export default ViolationList
