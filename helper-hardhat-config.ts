// local chains
export const developmentChains = ["hardhat", "localhost"];

// Add here the network (chain) name and address you deployed the contract
export const myContract: {[key: string]: string} = {
  sepolia: "",
  mumbai: "",
  etherlink: "",
  nightly: ""
}

// Owner system, redeploy it for correct live testing
export const basicTestTokenAddresses: {[key: string]: string} = {
  sepolia: "0x9447e564b24af0955c8743aBf9674C1d7D42Df13",
  mumbai: "0x6c0acdC5F53A5bEF9Ee3a64d1a22C7e5D2F0f4b9",
  etherlink: "0xE6F697aDdCF4f61ecE69061cdA464843E659A9eB",
  nightly: "0xA5018592f52Fe065863Bd0858e0A69B6D57547D8"
}

export const universalNumber = 42;

// No owner system, this can be used without redeploying
export const evmCompatibilityTestAddresses: {[key: string]: string} = {
  sepolia: "",
  mumbai: "0x5C268d380232D065e59995E77F83bFa9EfBbA070",
  etherlink: "0x8CF789C46d28139ae6CaBC34Eb22d651e691ec1C",
  nightly: "0xFA3737f6BCE5c27E88359C5a44Dae7F844B1814D"
}

// No owner system, this can be used without redeploying
export const basicStorageAddresses: {[key: string]: string} = {
  sepolia: "",
  mumbai: "",
  etherlink: "0x97D4c57079cfD43384bc6c291147Abe3a48eb6c5",
  nightly: ""
}

// No owner system, this can be used without redeploying
export const chatterboxAddresses: {[key: string]: string} = {
  sepolia: "",
  mumbai: "",
  etherlink: "0x5E2AB342968c8aE6370D0f53F00A3a2577ed86Ee",
  nightly: ""
}

// Owner system, redeploy it for correct live testing
export const basicNFTAddresses: {[key: string]: string} = {
  sepolia: "",
  mumbai: "0xF7C7aA8bfb97c3089356aFe4f28ccf869c20cDb6",
  etherlink: "0xbd335d429255ab9d68cdE3843EF0546b5EA2827a",
  nightly: ""
}

// ------ PROXY ------
// All the contracts here use proxies, so you need to redeploy
// everything if you want to test them correctly because
// each one of them use a owner / admin system.

// Transparent proxy (ERC1967)

// proxy represent the storage contract used as entrypoint that delegate call 
// to the logic contract
export const logicProxyAddresses: {[key: string]: string} = {
  sepolia: "",
  mumbai: "0x4D731cdd83C4758e4Df535550F22C1119D579Afd",
  etherlink: "0xe32F2ffC5125a02AAf4D517129e4D27679E7DdC1",
  nightly: ""
}

// implementation contract or logic contract is the logic call used by the
// proxy to execute the logic with the delegate call
// this one is the "positive" logic
export const logic_positiveImplemAddresses: {[key: string]: string} = {
  sepolia: "",
  mumbai: "0xaD7e8e6b45c60f40013FC7165CFbd99959b00ec7",
  etherlink: "0xfbaf63c940186b3FcED19b51F6b542a90FFD5245",
  nightly: ""
}

// implementation contract or logic contract is the logic call used by the
// proxy to execute the logic with the delegate call
// this one is the "negative" logic
export const logic_negativeImplemAddresses: {[key: string]: string} = {
  sepolia: "",
  mumbai: "0x4cc597Cf33991bB65b605aa4047D50c2eBb08f5E",
  etherlink: "0xA5f4EdE7822640395D34f8EE975431Edc4971A7D",
  nightly: ""
}

// admin contract is the entity used in the pattern to upgrade the proxy
export const logicAdminAddresses: {[key: string]: string} = {
  sepolia: "",
  mumbai: "0x535f6A39A6f9CD802dE7c41bBc53061a25d58e3E",
  etherlink: "0x40Afe9Ad8BA3d87b61c584b5Dd0499F738154Ba6",
  nightly: ""
}