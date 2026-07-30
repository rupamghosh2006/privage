import { afterEach, describe, expect, it } from 'vitest';
import {
  clearDemoCredential,
  hasDemoCredential,
  issueDemoCredential,
  proveDemoEligibility,
} from '../src/lib/demo-credential';
import { proveEligibility } from '../src/lib/proof-gateway';

const demoWalletAddress = 'mn_addr_preview_demo_wallet';

afterEach(() => {
  clearDemoCredential();
});

describe('PrivAge local demo credential', () => {
  it('issues a private credential bound to the connected wallet', () => {
    issueDemoCredential(demoWalletAddress);

    expect(hasDemoCredential(demoWalletAddress)).toBe(true);
    expect(hasDemoCredential('mn_addr_preview_other_wallet')).toBe(false);
  });

  it('grants the supported demo policy without exposing a private value', () => {
    issueDemoCredential(demoWalletAddress);

    const publicResult = proveDemoEligibility(demoWalletAddress, 18);

    expect(publicResult).toEqual({ eligible: true });
    expect(JSON.stringify(publicResult)).not.toMatch(/(?:value|age|birth)/i);
  });

  it('denies a stricter policy while returning only eligibility', () => {
    issueDemoCredential(demoWalletAddress);

    expect(proveDemoEligibility(demoWalletAddress, 21)).toEqual({ eligible: false });
  });

  it('uses the local credential through the application proof gateway', async () => {
    issueDemoCredential(demoWalletAddress);

    await expect(proveEligibility(18, demoWalletAddress)).resolves.toEqual({ eligible: true });
  });

  it('rejects an attempt to use a credential from another wallet', () => {
    issueDemoCredential(demoWalletAddress);

    expect(() => proveDemoEligibility('mn_addr_preview_other_wallet', 18)).toThrow(
      'Issue a private demo credential for this connected wallet',
    );
  });
});
