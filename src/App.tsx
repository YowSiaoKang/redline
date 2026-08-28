import "./styles/app.css";

export default function App() {
  return (
    <div className="shell">
      <header className="shell__topbar">
        <span className="brand">Redline</span>
        <span className="topbar__note">A WebMCP contract-review studio</span>
      </header>
      <main className="landing">
        <p className="landing__kicker">WebMCP contract-review studio</p>
        <h1 className="landing__title">Redline</h1>
        <p className="landing__tagline">Normal people get what lawyers have.</p>
        <div className="landing__rule" aria-hidden="true" />
        <div className="landing__proof">
          <span className="stamp">Reviewed</span>
          <p className="proof__note">
            Scaffold live. Paper, ink, and one sharp red — the review studio
            arrives next.
          </p>
        </div>
      </main>
    </div>
  );
}
