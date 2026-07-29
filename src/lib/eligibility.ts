export const supportedThresholds = [18, 21, 25] as const;

export type AgeThreshold = (typeof supportedThresholds)[number];

export type EligibilityResult = {
  readonly eligible: boolean;
};

type PrivateAgeWitness = {
  /**
   * This value models a Compact witness. It is intentionally not part of the
   * result type and must never be persisted, logged, or rendered.
   */
  readonly value: number;
};

export const isSupportedThreshold = (value: number): value is AgeThreshold =>
  supportedThresholds.includes(value as AgeThreshold);

export const createPrivateAgeWitness = (value: number): PrivateAgeWitness => {
  if (!Number.isInteger(value) || value < 0 || value > 130) {
    throw new Error('The private credential could not be validated.');
  }

  return { value };
};

/**
 * Mirrors the only public result emitted by the Compact circuit: eligibility.
 * The witness is consumed in this function and never copied into its return.
 */
export const evaluateEligibility = (
  witness: PrivateAgeWitness,
  minimumAge: AgeThreshold,
): EligibilityResult => ({
  eligible: witness.value >= minimumAge,
});

