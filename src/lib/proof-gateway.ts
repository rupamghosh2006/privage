import type { AgeThreshold, EligibilityResult } from './eligibility';
import { hasDemoCredential, proveDemoEligibility } from './demo-credential';

export type WalletProofStatus = 'connected' | 'disconnected';

export type WalletConnection = {
  readonly status: WalletProofStatus;
  readonly address: string | null;
};

export type EligibilityProofBridge = {
  proveEligibility(input: {
    readonly contractAddress: string;
    readonly minimumAge: AgeThreshold;
  }): Promise<EligibilityResult>;
};

declare global {
  interface Window {
    /**
     * Set by the PrivAge Midnight integration package after it loads compiled
     * contract artifacts and the user's encrypted witness state.
     */
    privageProofBridge?: EligibilityProofBridge;
  }
}

// The Preview address is public contract configuration, never private wallet data.
// A deployment environment can override it with VITE_MIDNIGHT_CONTRACT_ADDRESS.
const previewContractAddress = '5008fd088a5064c2dc69e2b085547e5e3e4922c7e12747d961a22722348bfb39';
const configuredContractAddress = import.meta.env.VITE_MIDNIGHT_CONTRACT_ADDRESS?.trim() || previewContractAddress;

export const hasConfiguredContract = Boolean(configuredContractAddress);

export type ProofMode = 'wallet' | 'demo';

const getWalletProofBridge = (): EligibilityProofBridge | undefined =>
  typeof window === 'undefined' ? undefined : window.privageProofBridge;

export const getProofMode = (walletAddress: string): ProofMode | null => {
  if (getWalletProofBridge()) {
    return 'wallet';
  }

  return hasDemoCredential(walletAddress) ? 'demo' : null;
};

export const proveEligibility = async (
  minimumAge: AgeThreshold,
  walletAddress: string,
): Promise<EligibilityResult> => {
  if (!configuredContractAddress) {
    throw new Error(
      'The Preview contract address is not configured. Set VITE_MIDNIGHT_CONTRACT_ADDRESS after deployment.',
    );
  }

  const proofBridge = getWalletProofBridge();

  if (!proofBridge) {
    if (hasDemoCredential(walletAddress)) {
      // Keep the proof-loading state visible during the local presentation flow.
      await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 350));
      return proveDemoEligibility(walletAddress, minimumAge);
    }

    throw new Error(
      'No private credential is ready. Issue a private demo credential below, or connect a wallet with an issuer integration.',
    );
  }

  const result = await proofBridge.proveEligibility({
    contractAddress: configuredContractAddress,
    minimumAge,
  });

  if (typeof result?.eligible !== 'boolean') {
    throw new Error('The proof service returned an invalid eligibility result. Please try again.');
  }

  return { eligible: result.eligible };
};
