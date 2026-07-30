import { useState } from 'react';
import { PrivacyPanel } from './components/PrivacyPanel';
import { ProofResult } from './components/ProofResult';
import { WalletConnect } from './components/WalletConnect';
import { useWallet } from './hooks/useWallet';
import { supportedThresholds, type AgeThreshold } from './lib/eligibility';
import { hasConfiguredContract, proveEligibility } from './lib/proof-gateway';

type ProofState = 'idle' | 'eligible' | 'denied' | 'error';

const messageFromUnknownError = (error: unknown): string =>
  error instanceof Error ? error.message : 'Proof generation could not be completed. Please try again.';

const App = () => {
  const { wallets, wallet, error: walletError, isConnecting, connect, disconnect } = useWallet();
  const [threshold, setThreshold] = useState<AgeThreshold>(18);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proofState, setProofState] = useState<ProofState>('idle');
  const [proofMessage, setProofMessage] = useState<string | null>(null);

  const generateProof = async (): Promise<void> => {
    setProofState('idle');
    setProofMessage(null);

    if (!wallet) {
      setProofState('error');
      setProofMessage('Connect a Midnight wallet before generating an eligibility proof.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await proveEligibility(threshold);
      if (result.eligible) {
        setProofState('eligible');
        setProofMessage('Your wallet proved that you meet this policy. No age or date of birth was revealed.');
      } else {
        setProofState('denied');
        setProofMessage('Your private credential does not meet the selected policy. No age or date of birth was revealed.');
      }
    } catch (proofError) {
      setProofState('error');
      setProofMessage(messageFromUnknownError(proofError));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="PrivAge home">
          <span className="brand-mark" aria-hidden="true" />
          <span>PrivAge</span>
        </a>
        <span className="network-chip"><span className="status-dot" /> PREVIEW / SYNCED</span>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <p className="eyebrow">PRIVATE ELIGIBILITY GATE</p>
            <h1 id="page-title">Prove access.<br /><em>Keep the age private.</em></h1>
            <p className="hero-text">PrivAge uses a Midnight zero-knowledge proof to verify an eligibility policy without exposing your age or date of birth.</p>
          </div>
          <div className="moon-mark" aria-hidden="true"><span>01</span><small>PRIVATE PROOF</small></div>
        </section>

        <WalletConnect
          wallet={wallet}
          wallets={wallets}
          error={walletError}
          isConnecting={isConnecting}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        <section className="proof-card" aria-labelledby="gate-heading">
          <div className="proof-card-heading">
            <div>
              <p className="eyebrow">Eligibility policy</p>
              <h2 id="gate-heading">Choose the minimum requirement</h2>
            </div>
            <span className={hasConfiguredContract ? 'contract-state ready' : 'contract-state'}>
              {hasConfiguredContract ? 'Contract configured' : 'Contract address required'}
            </span>
          </div>

          <div className="thresholds" role="group" aria-label="Minimum eligibility threshold">
            {supportedThresholds.map((value) => (
              <button
                className={threshold === value ? 'threshold selected' : 'threshold'}
                type="button"
                key={value}
                aria-pressed={threshold === value}
                onClick={() => setThreshold(value)}
              >
                <span>{value}+</span>
                <small>minimum policy</small>
              </button>
            ))}
          </div>

          <button className="button primary proof-button" type="button" onClick={generateProof} disabled={isGenerating}>
            {isGenerating ? <><span className="spinner" aria-hidden="true" /> Generating private proof...</> : 'Generate eligibility proof'}
          </button>
          <p className="proof-note">Your private credential is read by a local witness. PrivAge never asks you to type or reveal an age.</p>
        </section>

        <ProofResult state={proofState} message={proofMessage} />
        <PrivacyPanel threshold={threshold} />
      </main>

      <footer>PRIVAGE / BUILT FOR MIDNIGHT SELECTIVE DISCLOSURE</footer>
    </div>
  );
};

export default App;
