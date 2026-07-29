# Product Proposal

## What is the product, and who uses it?

**PrivAge** is a privacy-preserving age verification platform that allows users to prove they meet a required minimum age (such as 18+, 21+, or 25+) without revealing their actual age, date of birth, or identity.

The product can be used by:

* Online marketplaces selling age-restricted products
* Gaming and gambling platforms
* Event organizers
* Streaming platforms with age-restricted content
* DAOs and Web3 applications requiring age verification

Instead of exposing sensitive personal information, users generate a cryptographic proof that they satisfy the required age threshold.

---

## Why Midnight specifically?

Traditional blockchains are transparent, meaning any age or identity information stored on-chain can potentially be viewed forever. Even storing hashed or encrypted personal data introduces privacy concerns and unnecessary exposure.

Midnight enables selective disclosure, allowing users to prove that they satisfy an age requirement without revealing their actual age or date of birth.

With Midnight:

* Personal information remains private.
* Only the eligibility result is disclosed.
* No observer can reconstruct the user's age from blockchain data.
* Businesses receive trustworthy verification while users retain full privacy.

This privacy-first approach makes Midnight an ideal platform for confidential identity and eligibility verification.

---

## Data Model

| Data Point                      | Type                 | Disclosed To        |
| ------------------------------- | -------------------- | ------------------- |
| Verification request            | Public ledger        | Everyone            |
| Minimum required age (18/21/25) | Public ledger        | Everyone            |
| Verification success/failure    | Public ledger        | Everyone            |
| User's actual age               | Private witness      | No one              |
| User's date of birth            | Private witness      | No one              |
| Eligibility proof               | Zero-knowledge proof | Smart contract only |
| Wallet address                  | Public ledger        | Everyone            |

---

## Mainnet Feasibility

PrivAge is a practical application that can realistically reach Mainnet.

The core functionality of privacy-preserving age verification is already well suited to Midnight's selective disclosure model. Future improvements could include integration with decentralized identity providers, government-issued digital credentials, university IDs, KYC providers, and enterprise authentication systems.

Potential real-world use cases include e-commerce, gaming, financial services, online communities, DAO governance, and any platform that requires age verification while protecting user privacy.

The product is technically feasible to expand beyond a demo into a production-ready application as Midnight's ecosystem matures.
