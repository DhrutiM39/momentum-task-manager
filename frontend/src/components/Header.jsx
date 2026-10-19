export default function Header({ connected, taskCount, user, pathname, onLogout, onNavigate }) {
  return (
    <header className="app-header">
      <div className="app-header__title">
        <span className="app-header__prompt">PERSONAL COMMAND CENTER</span>
        <h1>Momentum</h1>
      </div>
      <nav className="app-header__nav" aria-label="Main navigation">
        <a href="/" className={pathname === "/" ? "active" : undefined} aria-current={pathname === "/" ? "page" : undefined} onClick={(event) => onNavigate(event, "/")}>Tasks</a>
        <a href="/activity" className={pathname === "/activity" ? "active" : undefined} aria-current={pathname === "/activity" ? "page" : undefined} onClick={(event) => onNavigate(event, "/activity")}>Activity</a>
      </nav>
      <div className="app-header__meta">
        <span className="task-count">{taskCount} task{taskCount === 1 ? "" : "s"}</span>
        <span className="app-header__user">{user.email}</span>
        <button className="app-header__logout" type="button" onClick={onLogout}>
          Sign out
        </button>
        <span className={`status-pill ${connected ? "status-pill--up" : "status-pill--down"}`}>
          <span className="status-pill__dot" />
          {connected ? "API connected" : "API offline"}
        </span>
      </div>
    </header>
  );
}
