import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import {
  DustSecretKey,
  LedgerParameters,
  ZswapSecretKeys,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { ttlOneHour } from '@midnight-ntwrk/midnight-js-utils';
import { FluentWalletBuilder, waitForFunds } from '@midnight-ntwrk/testkit-js';
import {
  compiledPrivAgeContract,
  pureCircuits,
  zkConfigPath,
} from '../contracts/index.mjs';

// GraphQL subscriptions in Node require a WebSocket implementation.
globalThis.WebSocket = WebSocket;

const config = {
  networkId: 'preprod',
  walletNetworkId: 'preprod',
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  nodeWS: 'wss://rpc.preprod.midnight.network',
  proofServer: process.env.MIDNIGHT_PROOF_SERVER ?? 'http://127.0.0.1:6300',
  faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
};

function getWalletSecret() {
  const mnemonic = process.env.MIDNIGHT_PREPROD_MNEMONIC?.trim().replace(/\s+/g, ' ');
  const seed = process.env.MIDNIGHT_PREPROD_SEED?.trim();

  if (mnemonic && seed) {
    throw new Error('Set only one Preprod wallet credential: mnemonic or seed.');
  }
  if (mnemonic) return { kind: 'mnemonic', value: mnemonic };
  if (seed && /^[0-9a-fA-F]{64}$/.test(seed)) return { kind: 'seed', value: seed };
  throw new Error('MIDNIGHT_PREPROD_SEED must be a 64-character hex value, or configure one mnemonic.');
}

function progressComplete(progress) {
  return Boolean(progress && typeof progress.isStrictlyComplete === 'function' && progress.isStrictlyComplete());
}

async function waitForWalletSync(wallet, timeout = 20 * 60_000) {
  await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.filter((state) =>
        progressComplete(state.shielded.state.progress) &&
        progressComplete(state.dust.state.progress) &&
        progressComplete(state.unshielded.progress),
      ),
      Rx.timeout({
        each: timeout,
        with: () => Rx.throwError(() => new Error('Wallet sync timed out after 20 minutes.')),
      }),
    ),
  );
}

async function buildWallet(secret) {
  const dustOptions = {
    ledgerParams: LedgerParameters.initialParameters(),
    additionalFeeOverhead: 1_000n,
    feeBlocksMargin: 5,
  };
  const base = FluentWalletBuilder.forEnvironment(config).withDustOptions(dustOptions);
  const builder = secret.kind === 'mnemonic'
    ? base.withMnemonic(secret.value)
    : base.withSeed(secret.value);
  const { wallet, seeds, keystore } = await builder.buildWithoutStarting();
  const zswapSecretKeys = ZswapSecretKeys.fromSeed(seeds.shielded);
  const dustSecretKey = DustSecretKey.fromSeed(seeds.dust);

  return {
    wallet,
    unshieldedKeystore: keystore,
    getCoinPublicKey: () => zswapSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => zswapSecretKeys.encryptionPublicKey,
    balanceTx: async (tx, ttl = ttlOneHour()) => {
      const recipe = await wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: zswapSecretKeys, dustSecretKey },
        { ttl },
      );
      return wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx) => wallet.submitTransaction(tx),
    start: () => wallet.start(zswapSecretKeys, dustSecretKey),
    stop: () => wallet.stop(),
  };
}

function deriveIssuerSecret(walletSecret) {
  // Domain separation makes this issuer witness distinct from the wallet seed.
  return new Uint8Array(
    createHash('sha256')
      .update('privage:preprod:issuer:v1', 'utf8')
      .update(walletSecret, 'utf8')
      .digest(),
  );
}

const walletSecret = getWalletSecret();
const wallet = await buildWallet(walletSecret);

try {
  console.log('Starting and synchronizing the Preprod wallet...');
  setNetworkId(config.networkId);
  await wallet.start();
  await waitForWalletSync(wallet.wallet);

  // Ensures the faucet-funded tNIGHT is registered for DUST operations.
  await waitForFunds(wallet.wallet, config, false, wallet.unshieldedKeystore);

  const issuerKey = pureCircuits.deriveIssuerKey(deriveIssuerSecret(walletSecret.value));
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: `privage-preprod-${Date.now()}`,
      privateStoragePasswordProvider: () => 'privage-local-private-state-v1',
      accountId: wallet.getCoinPublicKey(),
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider: wallet,
    midnightProvider: wallet,
  };

  console.log('Submitting PrivAge deployment transaction to Midnight Preprod...');
  const deployed = await deployContract(providers, {
    compiledContract: compiledPrivAgeContract,
    args: [issuerKey],
    privateStateId: 'PrivAgeIssuerPrivateState',
    initialPrivateState: {},
  });
  const contractAddress = deployed.deployTxData.public.contractAddress;
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  await writeFile(
    path.join(root, 'deployment.preprod.json'),
    `${JSON.stringify({ network: 'preprod', contractAddress, deployedAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8',
  );
  console.log(`PrivAge deployed to Midnight Preprod: ${contractAddress}`);
  console.log('Deployment record written to deployment.preprod.json.');
} finally {
  await wallet.stop().catch(() => undefined);
}
