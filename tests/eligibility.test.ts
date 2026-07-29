import { describe, expect, it } from 'vitest';
import { createPrivateAgeWitness, evaluateEligibility } from '../src/lib/eligibility';

describe('PrivAge eligibility circuit model', () => {
  it('grants access when the private witness satisfies the threshold', () => {
    const proof = evaluateEligibility(createPrivateAgeWitness(32), 21);

    expect(proof).toEqual({ eligible: true });
  });

  it('denies access when the private witness is below the threshold', () => {
    const proof = evaluateEligibility(createPrivateAgeWitness(17), 18);

    expect(proof).toEqual({ eligible: false });
  });

  it('never places the private witness value in public output', () => {
    const privateWitness = createPrivateAgeWitness(37);
    const publicOutput = evaluateEligibility(privateWitness, 25);

    expect(publicOutput).toEqual({ eligible: true });
    expect(JSON.stringify(publicOutput)).not.toContain('37');
    expect(Object.keys(publicOutput)).not.toContain('value');
  });

  it('keeps a boundary value eligible', () => {
    expect(evaluateEligibility(createPrivateAgeWitness(25), 25)).toEqual({ eligible: true });
  });
});
