export function NotAContractMsg({ onTryAgain }: { onTryAgain: () => void }) {
  return (
    <div className="not-contract" role="status">
      <p className="not-contract__line">
        That&rsquo;s not a contract. Nice grocery list though.
      </p>
      <p className="not-contract__sub">
        Paste the real thing &mdash; offer letters, NDAs, leases, waivers. We
        read them all.
      </p>
      <button type="button" className="not-contract__retry" onClick={onTryAgain}>
        Try again
      </button>
    </div>
  );
}
