# Subcurrency

This example comes from Solidity's official document, [Subcurrency Example](https://docs.soliditylang.org/en/v0.5.12/introduction-to-smart-contracts.html#subcurrency-example). It demonstrates an example that is naturally parallelizable without needing any modification. 

The contract implements a simple cryptocurrency, with two main functions:

- `Mint`
- `Send`

## Analysis

Both of the two functions modify the balances only. The minting function change the account balance of a recipient, while the transferring update the account balances of both parties. Multiple transactions calling mint can be executed in parallel because they won't access any shared states, as long as they're not targeting the same recipient. This applies to coins transfers too.

## Running the Demo


Run the Subcurrency: 
```shell
    scaffold> yarn hardhat run test/test-subCurrency.js --network TestnetInfo
```