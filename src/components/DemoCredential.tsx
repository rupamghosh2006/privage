type DemoCredentialProps = {
  readonly isConnected: boolean;
  readonly isIssued: boolean;
  readonly onIssue: () => void;
  readonly onClear: () => void;
};

export const DemoCredential = ({
  isConnected,
  isIssued,
  onIssue,
  onClear,
}: DemoCredentialProps) => (
  <section className="demo-credential" aria-labelledby="demo-credential-heading">
    <div>
      <p className="eyebrow">Demo issuer / local witness</p>
      <h2 id="demo-credential-heading">Issue a private demo credential</h2>
      <p className="demo-copy">
        This presentation flow binds a synthetic issuer credential to the connected wallet for this browser session.
        Its private witness is never displayed, logged, or sent to Preview.
      </p>
    </div>

    {isIssued ? (
      <div className="demo-actions">
        <p className="demo-status"><span className="status-dot" /> Private demo credential ready</p>
        <button className="button secondary" type="button" onClick={onClear}>
          Clear demo credential
        </button>
      </div>
    ) : (
      <div className="demo-actions">
        <p className="demo-status">{isConnected ? 'Ready to issue for this wallet' : 'Connect a Preview wallet to continue'}</p>
        <button className="button secondary" type="button" disabled={!isConnected} onClick={onIssue}>
          Issue demo credential
        </button>
      </div>
    )}
  </section>
);
