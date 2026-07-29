export type WalletInitialApi = {
  readonly name: string;
  readonly icon?: string;
  readonly apiVersion: string;
  connect(network: 'preprod'): Promise<WalletConnectedApi>;
};

type WalletConnectedApi = {
  getConnectionStatus(): Promise<{ readonly status: 'connected' | 'disconnected' }>;
  getUnshieldedAddress(): Promise<{ readonly unshieldedAddress: string }>;
};

export type WalletOption = {
  readonly id: string;
  readonly name: string;
  readonly apiVersion: string;
};

export type ConnectedWallet = WalletOption & {
  readonly address: string;
};

declare global {
  interface Window {
    midnight?: Record<string, WalletInitialApi>;
  }
}

export const listWallets = (): WalletOption[] =>
  Object.entries(window.midnight ?? {}).map(([id, wallet]) => ({
    id,
    name: wallet.name,
    apiVersion: wallet.apiVersion,
  }));

export const connectWallet = async (walletId: string): Promise<ConnectedWallet> => {
  const wallet = window.midnight?.[walletId];

  if (!wallet) {
    throw new Error('That Midnight wallet is no longer available. Refresh the page and try again.');
  }

  const connected = await wallet.connect('preprod');
  const status = await connected.getConnectionStatus();

  if (status.status !== 'connected') {
    throw new Error('The wallet did not complete the Preprod connection. Please approve the request and try again.');
  }

  const { unshieldedAddress } = await connected.getUnshieldedAddress();

  return {
    id: walletId,
    name: wallet.name,
    apiVersion: wallet.apiVersion,
    address: unshieldedAddress,
  };
};

export const shortenAddress = (address: string): string =>
  `${address.slice(0, 8)}…${address.slice(-6)}`;

