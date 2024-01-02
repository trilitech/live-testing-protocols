import { ethers, network } from "hardhat";
import { basicNFTAddresses } from "../../helper-hardhat-config";

// Unusable on local networks
async function main() {
  const [ owner ] = await ethers.getSigners();
  const contractAddress = basicNFTAddresses[network.name];
  const basicNFT = await ethers.getContractAt("BasicNFT", contractAddress);
  // const URI = "https://sapphire-welcome-narwhal-847.mypinata.cloud/ipfs/QmaDPgesExosWFXSw3kDHjo5Uermh13EeQK27oCxAG5r1x"; // sword
  const URI = "https://sapphire-welcome-narwhal-847.mypinata.cloud/ipfs/QmYsaYw2MKZHwAMzPmdqnG3DG9Qp6oNMEnsFQJsH7dWYHD"; // One Ring

  console.log("Basic NFT address: ", contractAddress);
  const receipt = await (await basicNFT.safeMint(owner.address, URI)).wait();
  const eventsTransfer = await basicNFT.queryFilter(basicNFT.filters.Transfer, receipt?.blockNumber, receipt?.blockNumber); // mint is a transfer event
  const firstTransfer = eventsTransfer[0]; // From, to, tokenId

  console.log(`Token owner: ${firstTransfer.args[1]}`);
  console.log(`Token id: ${firstTransfer.args[2]}`);
  console.log(`Token URI: ${await basicNFT.tokenURI(firstTransfer.args[2])}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});