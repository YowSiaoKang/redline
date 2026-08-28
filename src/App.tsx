import { DocumentView } from "./components/DocumentView";
import { Landing } from "./components/Landing";
import { hasWebMCP } from "./lib/webmcp";
import { useSession } from "./state/session";
import { useWebMCPTools } from "./tools/useWebMCPTools";

export default function App() {
  const { session } = useSession();
  useWebMCPTools();
  return (
    <div className="shell">
      <header className="shell__topbar">
        <span className="brand">Redline</span>
        <span className="topbar__note">A WebMCP contract-review studio</span>
      </header>
      {session.phase === "landing" || !session.document ? (
        <Landing webMcpAvailable={hasWebMCP()} />
      ) : (
        <DocumentView />
      )}
    </div>
  );
}
