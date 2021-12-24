const fs = require('fs');

require('@openzeppelin/hardhat-upgrades');

const secret = JSON.parse(fs.readFileSync('.secret'));

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    testnet: {
      url: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      accounts: [secret.testnet],
      chainId: 3
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
