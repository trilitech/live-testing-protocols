import { ethers, network } from "hardhat";
import { basicNFTAddresses } from "../../helper-hardhat-config";

// Unusable on local networks
async function main() {
  const [ owner, secondAccount ] = await ethers.getSigners(); // you should have 2 addresses
  const contractAddress = basicNFTAddresses[network.name];
  const basicNFT = await ethers.getContractAt("BasicNFT", contractAddress);
  const tokenIdToTransfer = 0; // hardcoded

  console.log("Transaction details:");
  console.log("Basic NFT address: ", contractAddress);
  console.log(`Token id to transfer: ${tokenIdToTransfer}`);
  console.log(`Address sender: ${owner.address}`);
  console.log(`Address receiver: ${secondAccount.address}`);
  const receipt = await (await basicNFT.transferFrom(owner.address, secondAccount.address, tokenIdToTransfer)).wait();
  const eventsTransfer = await basicNFT.queryFilter(basicNFT.filters.Transfer, receipt?.blockNumber, receipt?.blockNumber); // mint is a transfer event
  const firstTransfer = eventsTransfer[0]; // From, to, tokenId

  console.log("Transfer done! Event emitted:");
  console.log(`From: ${firstTransfer.args[0]}`);
  console.log(`To: ${firstTransfer.args[1]}`);
  console.log(`tokenId: ${firstTransfer.args[2]}\n`);

  console.log(`New owner of token ${firstTransfer.args[2]} is ${await basicNFT.ownerOf(firstTransfer.args[2])}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});