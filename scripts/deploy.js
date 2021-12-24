const { ethers, upgrades } = require('hardhat');

const env = require('../env.json')[process.env.NETWORK];

async function main() {
  const MEIToken = await ethers.getContractFactory("MEIToken");
  const token = await upgrades.deployProxy(MEIToken, [env.TOKEN_NAME, env.TOKEN_TICKER, env.TOKEN_TOTAL_SUPPLY]);
  await token.deployed();
  console.log("Token deployed to:", token.address);
}

main();