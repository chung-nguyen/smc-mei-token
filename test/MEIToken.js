const moment = require("moment");

const { expect, use } = require("chai");
const { solidity } = require("ethereum-waffle");

const env = require('../env.json')['dev'];

use(solidity);

describe("Token contract", function () {
  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("MEIToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.    
    const today = moment().unix();
    hardhatToken = await Token.deploy(env.TOKEN_NAME, env.TOKEN_TICKER, today.toString());
    await hardhatToken.deployed();

    await hardhatToken.release();
  });

  describe("Deployment", function () {
    it("Should be able to mint initial supply after opening time", async function () {
      const totalSupply = await hardhatToken.totalSupply();
      const ownerBalance = await hardhatToken.balanceOf(owner.address);      
      expect(totalSupply).to.equal(ownerBalance);
    });

    it("Vesting calculation must be correct", async function () {
      const r1 = await hardhatToken.getReleasableAmount(moment().add(366, 'd').unix());
      expect(r1).to.equal(ethers.utils.parseEther('30750000'));

      const r2 = await hardhatToken.getReleasableAmount(moment().add(459, 'd').unix());
      expect(r2).to.equal(ethers.utils.parseEther('61500000'));      

      const r3 = await hardhatToken.getReleasableAmount(moment().add(30.5 * 3 * 15, 'd').unix());
      expect(r3).to.equal(ethers.utils.parseEther('369000000'));      

      const r4 = await hardhatToken.getReleasableAmount(moment().add(30.5 * 3 * 15 + 100, 'd').unix());
      console.log(r4);
    })
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await hardhatToken.transfer(addr1.address, 50);
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await hardhatToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(initialOwnerBalance);
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await hardhatToken.transfer(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2.
      await hardhatToken.transfer(addr2.address, 50);

      // Check balances.
      const finalOwnerBalance = await hardhatToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal((initialOwnerBalance.sub(150)));

      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});
