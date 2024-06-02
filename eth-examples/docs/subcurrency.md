# Subcurrency

This example comes from Solidity's official document, [Subcurrency Example](https://docs.soliditylang.org/en/v0.5.12/introduction-to-smart-contracts.html#subcurrency-example). It demonstrates an example that is naturally parallelizable without needing any modification. 

The contract implements a simple cryptocurrency, with two main functions:

- `Mint`
- `Send`

## Analysis

Both of the two functions modify the balances only. The minting function change the account balance of a recipient, while the transferring update the account balances of both parties. Multiple transactions calling mint can be executed in parallel because they won't access any shared states, as long as they're not targeting the same recipient. This applies to coins transfers too.

## Running the Demo

The example package comes with all the necessary scripts and files to run the example. Before you start, please make sure you have a live DevNet up and running.

First clone the project from GitHub and then change directory to eth-examples.

```shell
    git clone --recurse-submodules https://github.com/arcology-network/examples.git
    cd examples/eth-examples
```

Under examples/eth-examples/, run the script to install dependencies.
```shell
    npm install
```
Run the Subcurrency: 
```shell
    yarn hardhat run test/test-subCurrency.js --network TestnetInfo
```