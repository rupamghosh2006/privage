type ProofState = 'idle' | 'eligible' | 'denied' | 'error';

type ProofResultProps = {
  readonly state: ProofState;
  readonly message: string | null;
};

export const ProofResult = ({ state, message }: ProofResultProps) => {
  if (state === 'idle') {
    return null;
  }

  const title = state === 'eligible' ? 'Verified eligible' : state === 'denied' ? 'Access denied' : 'Proof unavailable';

  return (
    <section className={`proof-result ${state}`} aria-live="polite" aria-atomic="true">
      <div className="result-icon" aria-hidden="true">{state === 'eligible' ? '✓' : '!'}</div>
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </section>
  );
};

