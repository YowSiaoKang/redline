export function AwaitingAgent() {
  return (
    <div className="await" role="status">
      <p className="await__title">Waiting for your agent</p>
      <p className="await__note">
        Open ChatGPT Desktop &mdash; or your browser&rsquo;s agent &mdash; and
        ask it to review the contract.
      </p>
    </div>
  );
}
