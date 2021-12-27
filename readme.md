# Setup
Copy `.secret.template` to `.secret` and fill in private keys of wallets required for deployment. NEVER share these keys unless you truly understand the risks.

# Compile
Run `yarn flatten` first to merge Solidity sources.
Run `yarn compile` to compile the contracts.

# Testing
Run `yarn dev` to start ganache dev blockchain
Run `yarn test` to do the tests

# Deploy
Run `yarn deploy:<network name>`

# Upgrade
Run `yarn upgrade:<network name>`

# Deploy USDM
Run `npx hardhat deployUSDM --network <network name>`
