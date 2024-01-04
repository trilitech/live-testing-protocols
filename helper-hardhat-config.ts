// local chains
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

// No owner system, this can be used without redeploying
export const basicStorageAddresses: {[key: string]: string} = {
  sepolia: "",
  mumbai: "",
  etherlink: "0x97D4c57079cfD43384bc6c291147Abe3a48eb6c5"
}

// No owner system, this can be used without redeploying
export const chatterboxAddresses: {[key: string]: string} = {
  sepolia: "",
  mumbai: "",
  etherlink: "0x5E2AB342968c8aE6370D0f53F00A3a2577ed86Ee"
}

// Owner system, redeploy it for correct live testing
export const basicNFTAddresses: {[key: string]: string} = {
  sepolia: "",
  mumbai: "0xF7C7aA8bfb97c3089356aFe4f28ccf869c20cDb6",
  etherlink: "0xbd335d429255ab9d68cdE3843EF0546b5EA2827a"
}

// ------ PROXY ------
// All the contracts here use proxies, so you need to redeploy
// everything if you want to test them correctly because
// each one of them use a owner / admin system.

// Transparent proxy (ERC1967)

// proxy represent the storage contract used as entrypoint that delegate call 
// to the logic contract
export const logicProxy: {[key: string]: string} = {
  sepolia: "",
  mumbai: "0x4D731cdd83C4758e4Df535550F22C1119D579Afd",
  etherlink: "0x6A64DC3eE728896A855De6a5d3519fE6961Bf844"
}

// implementation contract or logic contract is the logic call used by the
// proxy to execute the logic with the delegate call
// this one is the "positive" logic
export const logic_possitiveImplem: {[key: string]: string} = {
  sepolia: "",
  mumbai: "0xaD7e8e6b45c60f40013FC7165CFbd99959b00ec7",
  etherlink: "0xf1eac43942F4A50b7B3B7BDFb5670e6F1bDB550d"
}

// implementation contract or logic contract is the logic call used by the
// proxy to execute the logic with the delegate call
// this one is the "negative" logic
export const logic_negativeImplem: {[key: string]: string} = {
  sepolia: "",
  mumbai: "0x4cc597Cf33991bB65b605aa4047D50c2eBb08f5E",
  etherlink: "0xd42956D8b7de687B140dB87Ff5c3D01Ef5C3421D"
}

// admin contract is the entity used in the pattern to upgrade the proxy
export const logicAdmin: {[key: string]: string} = {
  sepolia: "",
  mumbai: "0x535f6A39A6f9CD802dE7c41bBc53061a25d58e3E",
  etherlink: "0x156b1Ef93eDe8f4C1f809a828945c261b4F14e35"
}