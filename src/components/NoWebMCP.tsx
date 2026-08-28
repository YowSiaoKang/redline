export function NoWebMCP() {
  return (
    <section className="nowebmcp" role="note">
      <p className="nowebmcp__title">Your browser can&rsquo;t run agent tools yet</p>
      <p>
        You can still load and peek at a contract below, but no AI agent can
        reach it from here &mdash; the review loop stays quiet.
      </p>
      <p>To switch the agent loop on, use one of these:</p>
      <ul>
        <li>
          <strong>Chrome:</strong> enable the flag at{" "}
          <code>chrome://flags/#enable-webmcp-testing</code> and relaunch.
        </li>
        <li>
          <strong>ChatGPT Desktop:</strong> open this app there &mdash; it
          speaks WebMCP natively.
        </li>
      </ul>
    </section>
  );
}
