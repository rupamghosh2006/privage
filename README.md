# PrivAge

[![CI](https://github.com/YOUR_GITHUB_USERNAME/privage/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_GITHUB_USERNAME/privage/actions/workflows/ci.yml)

> Prove that a private, issuer-backed credential satisfies an eligibility policy—without revealing an age or date of birth.

## Live Demo

Deployment pending. Add the production URL here before submission.

## Contract Address

| Network | Address |
| --- | --- |
| Preprod | **Deployment pending — add the PrivAge contract address before submission** |

## What This Does

PrivAge is an Age / Eligibility Gate for Midnight. An approved issuer writes only an opaque commitment for a private credential. When a user asks for access, the Compact circuit reads the private witness from their wallet, checks the selected policy (`18+`, `21+`, or `25+`), and returns only an eligibility boolean.

The UI deliberately has no age or date input. A compatible wallet integration supplies the encrypted private credential to the witness layer, so users do not type sensitive data into the website.

## Privacy Model

- **PUBLIC:** the issuer identity, opaque credential commitments, one-way proof nullifiers, and the aggregate number of successful proofs.
- **PRIVATE:** the age, date of birth, credential salt, issuer secret, and proof secret. These values are witnesses and never enter a public ledger field.
- **PROVED without revealing:** whether a private credential satisfies the selected policy.

## Privacy Claim

An on-chain observer can see that PrivAge exists, inspect its public ledger, and observe opaque commitments/nullifiers plus the successful-proof counter. They cannot recover a user's age or date of birth from those values, nor is either written to a log, event, UI result, or public contract state.

The circuit has a single public return type: `Boolean`. The browser shows **Verified eligible** or **Access denied**; it never renders the underlying private value.

## Trust Model

The issuer is trusted to verify a person's eligibility source before calling `issueCredential`. PrivAge verifies that a proof is backed by an issuer-created commitment; it does not make self-attested data trustworthy. A production rollout should define the issuer's identity-verification, credential-delivery, key-rotation, and revocation policies.

## Tech Stack

- [Midnight Compact](https://docs.midnight.network/compact) for the zero-knowledge contract
- React 19, TypeScript, and Vite for the responsive browser interface
- Midnight DApp Connector API for wallet compatibility
- Vitest for eligibility and privacy-boundary tests
- GitHub Actions for compile, test, and production-build CI

## Prerequisites

- Node.js 22.12 or newer
- npm 10 or newer
- A Midnight-compatible browser wallet configured for Preprod
- Midnight Compact for contract compilation. Midnight supports Linux/macOS natively; use an Ubuntu environment for this project on Windows.

## Setup & Run Locally

```bash
npm ci
copy .env.example .env
```

After deploying the contract, put its Preprod address in `.env`:

```bash
VITE_MIDNIGHT_CONTRACT_ADDRESS=your_preprod_contract_address
```

Then start the frontend:

```bash
npm run dev
```

To compile the Compact contract from Linux/macOS (or an Ubuntu development environment):

```bash
npm run compile
```

This generates `contracts/managed/privage/`. The GitHub Actions workflow installs Compact and performs the same compile step automatically.

## Run Tests

```bash
npm test
```

The suite covers an eligible witness, an ineligible witness, the threshold boundary, and the privacy rule that a private value never becomes public output. It also checks that the contract does not define a public age ledger field and that the UI does not request a numeric date/age.

## CI/CD

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`. It:

1. installs Node.js 22 and locked npm dependencies;
2. installs Midnight Compact;
3. compiles `contracts/privage.compact` to `contracts/managed/privage`;
4. runs the privacy and eligibility test suite; and
5. produces a production Vite build.

Replace `YOUR_GITHUB_USERNAME` in the badge URL after creating the public GitHub repository. A green badge appears after the first successful GitHub Actions run.

## Product Proposal

See [PROPOSAL.md](PROPOSAL.md).

## Before Submission

1. Deploy `contracts/privage.compact` to Midnight Preprod and replace the contract-address placeholder above.
2. Set `VITE_MIDNIGHT_CONTRACT_ADDRESS` in your deployment platform and add the live URL above.
3. Push `main`, wait for the CI badge to turn green, and capture the test output.
4. Complete every placeholder in [PROPOSAL.md](PROPOSAL.md), record the one-minute demo, and submit the proposal for approval.
