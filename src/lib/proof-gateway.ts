import type { AgeThreshold, EligibilityResult } from './eligibility';

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

export const proveEligibility = async (minimumAge: AgeThreshold): Promise<EligibilityResult> => {
  if (!configuredContractAddress) {
    throw new Error(
      'The Preview contract address is not configured. Set VITE_MIDNIGHT_CONTRACT_ADDRESS after deployment.',
    );
  }

  if (!window.privageProofBridge) {
    throw new Error(
      'No private age credential is available in this wallet. Import an issuer-issued credential, then try again.',
    );
  }

  const result = await window.privageProofBridge.proveEligibility({
    contractAddress: configuredContractAddress,
    minimumAge,
  });

  if (typeof result?.eligible !== 'boolean') {
    throw new Error('The proof service returned an invalid eligibility result. Please try again.');
  }

  return { eligible: result.eligible };
};
