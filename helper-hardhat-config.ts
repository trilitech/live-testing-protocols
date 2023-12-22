export const developmentChains = ["hardhat", "localhost"];

// Add here the network (chain) name and address you deployed the contract
export const myContract: {[key: string]: string} = {
  sepolia: "",
  mumbai: "",
  etherlink: ""
}

// Owner system, redeploy it for correct live testing
export const basicTestTokenAddresses: {[key: string]: string} = {
  sepolia: "0x9447e564b24af0955c8743aBf9674C1d7D42Df13",
  mumbai: "0x6c0acdC5F53A5bEF9Ee3a64d1a22C7e5D2F0f4b9",
  etherlink: "0xE6F697aDdCF4f61ecE69061cdA464843E659A9eB"
}

export const universalNumber = 42;

// No owner system, this can be used without redeploying
export const evmCompatibilityTestAddresses: {[key: string]: string} = {
  sepolia: "",
  mumbai: "0x5C268d380232D065e59995E77F83bFa9EfBbA070",
  etherlink: "0x8CF789C46d28139ae6CaBC34Eb22d651e691ec1C"
}