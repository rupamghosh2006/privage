import type { AgeThreshold } from '../lib/eligibility';

type PrivacyPanelProps = {
  readonly threshold: AgeThreshold;
};

export const PrivacyPanel = ({ threshold }: PrivacyPanelProps) => (
  <section className="privacy-panel" aria-labelledby="privacy-heading">
    <div className="section-heading">
      <p className="eyebrow">Selective disclosure</p>
      <h2 id="privacy-heading">Precisely what this proof reveals</h2>
    </div>
    <div className="privacy-grid">
      <article className="privacy-item public">
        <span className="privacy-label">Public information</span>
        <p>Preview network, the selected {threshold}+ policy, and opaque anti-replay data.</p>
      </article>
      <article className="privacy-item private">
        <span className="privacy-label">Private information</span>
        <p>Your age, date of birth, credential salt, and proof secret remain in the local private witness. Production wallet integrations keep this state encrypted.</p>
      </article>
      <article className="privacy-item proved">
        <span className="privacy-label">Proved without revealing</span>
        <p>Only whether your private credential satisfies the selected policy.</p>
      </article>
    </div>
  </section>
);
