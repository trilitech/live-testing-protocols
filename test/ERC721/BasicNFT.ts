import { deployments, network } from "hardhat";
import { expect } from "chai";
import { BasicNFT } from "../../typechain-types";
import { developmentChains } from "../../helper-hardhat-config";

const setup = deployments.createFixture(async ({deployments, getNamedAccounts, ethers}, options) => {
  if (developmentChains.includes(network.name))
    await deployments.fixture(); // ensure you start from a fresh deployments
  const { deployer, assistant } = await getNamedAccounts();
  if (!assistant)
    throw new Error("Error: You should add a second user if you want to test BasicNFT");
  const basicNFTDeployer = await ethers.getContract('BasicNFT', deployer) as BasicNFT;
  // Valide json for metadata pinned on Pinata IPFS
  const URI = "https://sapphire-welcome-narwhal-847.mypinata.cloud/ipfs/QmaDPgesExosWFXSw3kDHjo5Uermh13EeQK27oCxAG5r1x"; // sword
  // const URI = "https://sapphire-welcome-narwhal-847.mypinata.cloud/ipfs/QmYsaYw2MKZHwAMzPmdqnG3DG9Qp6oNMEnsFQJsH7dWYHD"; // One Ring

  return { deployer, assistant, basicNFTDeployer, URI };
});

describe('BasicNFT', () => {
  describe("Mint", function () {
    it("Should mint tokens and emit an event", async function () {
      const { deployer, basicNFTDeployer, URI } = await setup();

      const initialBalance = await basicNFTDeployer.balanceOf(deployer);
      const receipt = await (await basicNFTDeployer.safeMint(deployer, URI)).wait();
      const afterMintBalance = await basicNFTDeployer.balanceOf(deployer);
      const events = await basicNFTDeployer.queryFilter(basicNFTDeployer.filters.Transfer, receipt?.blockNumber, receipt?.blockNumber); // mint is a transfer event
      const firstTransfer = events[0];

      // Check balance
      expect(afterMintBalance).to.equal(initialBalance + 1n);
      // Check creation event
      expect(firstTransfer.args[0]).to.equal("0x0000000000000000000000000000000000000000"); // origin of mint is address 0x0
      expect(firstTransfer.args[1]).to.equal(deployer);
    }).timeout(1000000);      
  });

  describe("Interact", function () {
    it("Should transfer a token and emit an event", async function () {
      const { deployer, assistant, basicNFTDeployer, URI } = await setup();
      let lastTokenId = Number(await basicNFTDeployer._nextTokenId());

      // No NFT minted
      if (lastTokenId == 0) {
        // Mint a new NFT before the transfer
        await (await basicNFTDeployer.safeMint(deployer, URI)).wait();
      } else {
        lastTokenId--;
        // Check if last token minted is owned by deployer
        if (await basicNFTDeployer.ownerOf(lastTokenId) != deployer) {
        // Mint a new NFT before the transfer
          await (await basicNFTDeployer.safeMint(deployer, URI)).wait();
          lastTokenId++;
        }
      }

      // Test the transfer
      const initialBalanceDeployer = await basicNFTDeployer.balanceOf(deployer);
      const initialBalanceAssistant = await basicNFTDeployer.balanceOf(assistant);
      const receipt = await (await basicNFTDeployer.transferFrom(deployer, assistant, lastTokenId)).wait();
      const afterMintBalanceDeployer = await basicNFTDeployer.balanceOf(deployer);
      const afterMintBalanceAssistant = await basicNFTDeployer.balanceOf(assistant);
      const events = await basicNFTDeployer.queryFilter(basicNFTDeployer.filters.Transfer, receipt?.blockNumber, receipt?.blockNumber);
      const transferEvent = events[0];

      // Check balance
      expect(afterMintBalanceDeployer).to.equal(initialBalanceDeployer - 1n);
      expect(afterMintBalanceAssistant).to.equal(initialBalanceAssistant + 1n);
      // Check creation event
      expect(transferEvent.args[0]).to.equal(deployer); // origin
      expect(transferEvent.args[1]).to.equal(assistant); // to
      expect(transferEvent.args[2]).to.equal(lastTokenId); // token id
      // Check owner
      expect(await basicNFTDeployer.ownerOf(lastTokenId)).to.equal(assistant);
    }).timeout(1000000);      
  });
});

