import { useMemo, useState } from 'react';
import { connectWallet, listWallets, type ConnectedWallet } from '../lib/wallet';

const messageFromUnknownError = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unable to connect your wallet. Please try again.';

export const useWallet = () => {
  const wallets = useMemo(listWallets, []);
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async (walletId: string): Promise<void> => {
    setError(null);
    setIsConnecting(true);

    try {
      setWallet(await connectWallet(walletId));
    } catch (connectionError) {
      setWallet(null);
      setError(messageFromUnknownError(connectionError));
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = (): void => {
    setWallet(null);
    setError(null);
  };

  return { wallets, wallet, error, isConnecting, connect, disconnect };
};

