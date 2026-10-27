function Header({ children }) {
  return (
    <header className="appHeader">
      <div>
        <h1>Aggregate Planning Tool</h1>
        <p>Chase, Level, Mixed and cost-optimal production plans over 12 months</p>
      </div>
      {children}
    </header>
  )
}

export default Header
