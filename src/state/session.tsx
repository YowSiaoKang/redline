import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
  type RefObject,
} from "react";
import { initialSession, sessionReducer, type SessionAction } from "./actions";
import type { ReviewSession } from "./types";

interface SessionContextValue {
  session: ReviewSession;
  dispatch: Dispatch<SessionAction>;
  sessionRef: RefObject<ReviewSession>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(sessionReducer, initialSession);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const value = useMemo(() => ({ session, dispatch, sessionRef }), [session]);
  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
