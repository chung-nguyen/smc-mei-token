const fs = require('fs');

require('@openzeppelin/hardhat-upgrades');

const argv = require('minimist')(process.argv.slice(2));
const env = require('./env.json')[argv.network];
const secret = JSON.parse(fs.readFileSync('.secret'));

/**
 * 
 */
task('deployMEI', 'Deploy MEI token')
  .setAction(async () => {
    const MEIToken = await ethers.getContractFactory('MEIToken');
    const token = await upgrades.deployProxy(MEIToken, [env.TOKEN_NAME, env.TOKEN_TICKER, env.TOKEN_TOTAL_SUPPLY]);
    await token.deployed();

    console.log('Token deployed to:', token.address);
  });

/**
 * USDM deployment task
 */
task('deployUSDM', 'Deploy USD Mock token')
  .setAction(async () => {
    const [deployer] = await ethers.getSigners();

    console.log('Deploying contracts with the account:', deployer.address);
    console.log('Account balance:', (await deployer.getBalance()).toString());

    const USDMToken = await ethers.getContractFactory('USDMToken');

    const token1 = await USDMToken.deploy('USDM1', 'USD Mock 1');
    await token1.deployed();

    const token2 = await USDMToken.deploy('USDM2', 'USD Mock 2');
    await token2.deployed();

    const token3 = await USDMToken.deploy('USDM3', 'USD Mock 3');
    await token3.deployed();

    const token4 = await USDMToken.deploy('USDM4', 'USD Mock 4');
    await token4.deployed();

    const token5 = await USDMToken.deploy('USDM5', 'USD Mock 5');
    await token5.deployed();

    console.log('USDM1 token address:', token1.address);  
    console.log('USDM2 token address:', token2.address);  
    console.log('USDM3 token address:', token3.address);  
    console.log('USDM4 token address:', token4.address);  
    console.log('USDM5 token address:', token5.address);  
  });


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    dev: {
      url: 'http://localhost:8545',
      accounts: [
        '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d', 
        '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1',
        '0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c',
        '0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913',
        '0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743',
        '0x395df67f0c2d2d9fe1ad08d1bc8b6627011959b79c53d7dd6a3536a33ab8a4fd'
      ]
    },
    testnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      accounts: [secret.testnet],
      chainId: 97
    },    
    mainnet: {
      url: 'https://bsc-dataseed1.binance.org',
      accounts: [secret.mainnet],
      chainId: 56
    },    

    // Reserved
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      accounts: [secret.testnet],
      chainId: 4
    },
    
    ropsten: {
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
