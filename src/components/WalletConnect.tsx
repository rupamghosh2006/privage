import { shortenAddress, type ConnectedWallet, type WalletOption } from '../lib/wallet';

type WalletConnectProps = {
  readonly wallet: ConnectedWallet | null;
  readonly wallets: readonly WalletOption[];
  readonly error: string | null;
  readonly isConnecting: boolean;
  readonly onConnect: (walletId: string) => void;
  readonly onDisconnect: () => void;
};

export const WalletConnect = ({
  wallet,
  wallets,
  error,
  isConnecting,
  onConnect,
  onDisconnect,
}: WalletConnectProps) => (
  <section className="wallet-card" aria-labelledby="wallet-heading">
    <div>
      <p className="eyebrow">Wallet</p>
      <h2 id="wallet-heading">{wallet ? 'Wallet connected' : 'Connect to Preview'}</h2>
      {wallet ? (
        <p className="muted" title={wallet.address}>
          {wallet.name} · {shortenAddress(wallet.address)}
        </p>
      ) : (
        <p className="muted">Choose a Midnight wallet to begin a private proof.</p>
      )}
    </div>

    {wallet ? (
      <button className="button secondary" type="button" onClick={onDisconnect}>
        Disconnect
      </button>
    ) : wallets.length === 0 ? (
      <p className="wallet-help">No Midnight wallet detected. Install or unlock a Preview-compatible wallet, then refresh.</p>
    ) : (
      <div className="wallet-options" aria-label="Available Midnight wallets">
        {wallets.map((option) => (
          <button
            className="button secondary"
            type="button"
            key={option.id}
            disabled={isConnecting}
            onClick={() => onConnect(option.id)}
          >
            {isConnecting ? 'Connecting…' : `Connect ${option.name}`}
          </button>
        ))}
      </div>
    )}

    {error ? <p className="notice error" role="alert">{error}</p> : null}
  </section>
);
