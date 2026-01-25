# BaseSubscribe

Decentralized subscription platform on Base. Create and manage recurring crypto payments with automated keeper execution.

## Features

- **For Creators**: Create subscription plans with custom pricing and periods
- **For Subscribers**: Subscribe with USDC, cancel anytime with pro-rata refunds
- **For Keepers**: Earn 0.5% rewards for executing due payments
- **Platform**: 2% fee, fully onchain, no custody

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install keeper dependencies
cd ../keeper && npm install
```

### Configuration

Copy environment files:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp keeper/.env.example keeper/.env
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Deploy

```bash
# Deploy to Base Sepolia testnet
npm run deploy:testnet

# Deploy to Base mainnet
npm run deploy:mainnet
```

### Run Frontend

```bash
cd frontend
npm run dev
```

### Run Keeper Bot

```bash
cd keeper
npm run dev
```

## Architecture

```
basesubscribe/
├── contracts/           # Solidity smart contracts
│   ├── BaseSubscribe.sol
│   ├── interfaces/
│   └── libraries/
├── frontend/            # React + Vite + wagmi
│   └── src/
├── keeper/              # Node.js keeper bot
│   └── src/
├── scripts/             # Deployment scripts
├── test/                # Contract tests
└── docs/                # Documentation
```

## Contract Addresses

### Base Mainnet
- BaseSubscribe: [`0x0af844f42dad1f76D8822A7862e7C977C90949C0`](https://basescan.org/address/0x0af844f42dad1f76D8822A7862e7C977C90949C0#code)
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

### Base Sepolia
- BaseSubscribe: `TBD`
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## Fee Structure

| Fee | Percentage | Recipient |
|-----|------------|-----------|
| Platform | 2% | Platform wallet |
| Keeper | 0.5% | Transaction executor |
| Creator | 97.5% | Plan creator |

## Documentation

- [Keeper Guide](docs/KEEPER_GUIDE.md)
- [Creator Guide](docs/CREATOR_GUIDE.md)
- [API Reference](docs/API.md)

## License

MIT
