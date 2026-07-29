import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const contractSource = readFileSync('contracts/privage.compact', 'utf8');
const appSource = readFileSync('src/App.tsx', 'utf8');

describe('PrivAge privacy boundary', () => {
  it('does not define a public ledger field for an age or birth date', () => {
    expect(contractSource).not.toMatch(/export ledger\s+(age|birthDate|dateOfBirth)\b/i);
  });

  it('discloses only boolean eligibility from the proof circuit', () => {
    const proofCircuit = contractSource.slice(contractSource.indexOf('export circuit proveEligibility'));

    expect(proofCircuit).toMatch(/export circuit proveEligibility\([^)]*\): Boolean/);
    expect(proofCircuit).toContain('return disclose(false);');
    expect(proofCircuit).toContain('return disclose(true);');
    expect(proofCircuit).not.toMatch(/disclose\(age\)/);
  });

  it('does not collect a numeric date or age through the UI', () => {
    expect(appSource).not.toMatch(/<input[^>]+type=["'](?:number|date)["']/i);
  });
});
