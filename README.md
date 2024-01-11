# Live testing protocols

## Introduction

This is an hardhat project with [hardhat-deploy]("https://github.com/wighawag/hardhat-deploy") used to deploy and live test deployed contract on EVM chains. You can find the hardhat documentation [here]("https://hardhat.org/docs").

The project use hardhat-deploy plugin in order to facilitate the deployment and test process by writing locally in files all the information about deployed contracts.

## Installation and setup

First, download the node modules:
```
npm install
```
Then you have to create a `.env` file with something like this:
```
PRIVATE_KEY=<your-private-key>
SECOND_PRIVATE_KEY=<your-second-private-key>

SEPOLIA_RPC_URL=<sepolia-rpc-url>
ETHERSCAN_API_KEY=<etherscan-api-key>

MUMBAI_RPC_URL=<mumbai-rpc-url>
POLYGONSCAN_API_KEY=<polyscan-api-key>

ETHERLINK_RPC_URL=https://node.ghostnet.etherlink.com
ETHERLINK_API_KEY=YOUCANCOPYME0000000000000000000000

NIGHTLY_RPC_URL=https://node.2024-01-09.etherlink-nightly.tzalpha.net
NIGHTLY_PRIVATE_KEY=<nightly-private-key>
```

This is recommended to add 2 private keys because some tests use 2 accounts (but you can set 2 times the same if you do not care).

All the RPC URLs are **optional**, you can add or remove them as you want depending on which chain you want to support.

Etherscan and Polygonscan API keys are also **optional**, if you don't want to verify your contracts, you don't need to add them.

All the configuration is in the `hardhat.config.ts`, if you need more information, read the hardhat doc linked above.

## Deployment

When you want to deploy the contracts, you can run:
```
npx hardhat deploy
```

If you don't specify any network, the deployment is done locally.

Here is a list of the important flags you may need to add in the command:
- `--help`: list the helper
- `--network <the-network>`: specify the network you deploy on
- `--tags <tag1,tag2,tag3>`: specify the tags to deploy specific contract, separate multiple tags by using comma between each one
- `--reset`: force redeploy the contract, by default the command only redeploy the contract if it see any changes so you need to add this is if you want to force the redeployment

**Example:** if you want to deploy all the contracts on Etherlink chain and force the deployment to be sure you start with new contracts:
```
npx hardhat deploy --network etherlink --reset
```

All the deployment details are stored locally in the folder `deployments`. If you need more information on that, read the documentation linked above on hardhat-deploy.

## Tests

When you want to test the contracts, you can run:
```
npx hardhat test
```

If you don't specify any network, the tests are run locally.

Here is a list of the important flags you may need to add in the command:
- `--help`: list the helper
- `--network <the-network>`: specify the network you test on
- `--grep <STRING>`: only run tests matching the given string or regexp from tests files

You can also directly target a test file manually like:
```
npx hardhat test test/basics/EVMCompatibilityTest.ts
```

**Example:** if you want to test all the contracts deployed on Etherlink chain previously:
```
npx hardhat test --network etherlink
```

**Important**: when you specify a testnet with the `network` flag and run the test on deployed smart contracts, you need to have enough token on in your wallet you specified in the `.env` because the tests launch real transactions.

***

## Architecture
- `contracts/`: contains all the contracts
- `deploy/`: contains the deployment scripts using hardhat-deploy plugin
- `scripts/`: contains manual deployment scripts and helper scripts
- `test/`: contains all the tests
- `hardhat.config.ts`: hardhat configuration file
- `helper-hardhat.config.ts`: helper configuration file