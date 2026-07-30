import {
  createPrivateAgeWitness,
  evaluateEligibility,
  type AgeThreshold,
  type EligibilityResult,
} from './eligibility';

type DemoCredential = {
  readonly ownerAddress: string;
  readonly privateWitness: ReturnType<typeof createPrivateAgeWitness>;
};

// This fixture is intentionally kept private to this module. The UI, proof
// result, and public output never receive or render the underlying value.
const demoFixtureValue = 20;

let activeCredential: DemoCredential | null = null;

export const issueDemoCredential = (ownerAddress: string): void => {
  activeCredential = {
    ownerAddress,
    privateWitness: createPrivateAgeWitness(demoFixtureValue),
  };
};

export const clearDemoCredential = (): void => {
  activeCredential = null;
};

export const hasDemoCredential = (ownerAddress: string): boolean =>
  activeCredential?.ownerAddress === ownerAddress;

export const proveDemoEligibility = (
  ownerAddress: string,
  minimumAge: AgeThreshold,
): EligibilityResult => {
  if (!activeCredential || activeCredential.ownerAddress !== ownerAddress) {
    throw new Error('Issue a private demo credential for this connected wallet before generating a proof.');
  }

  return evaluateEligibility(activeCredential.privateWitness, minimumAge);
};
