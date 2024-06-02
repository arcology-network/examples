## Benchmarking
This document provides a step-by-step guide to benchmarking the `DSToken` contract using Arcology's tools. The `DSToken` contract is a parallelized version of the `ERC20` contract that allows for concurrent minting and burning of tokens. Please refer to the [DSToken contract](../README.md) for more details.

>> You will need a high-performance testnet for benchmarking. A devNet won't be able to handle the load.


### Preparation

we will first [deploy the parallelized ds-token contract](prep.md). 

### Send Transactions   
Arcology provides a set of tools to help you send transactions to the deployed contract in batches.
The directory `examples/ds-token/benchmark/txs/ds-token-mint` contains 200k of pre-signed transactions for the `mint` function of the contract. You can use the following commands to send transactions to the deployed contract. 

Assuming your IP address is `192.168.1.103`, clone the repository if you haven't done so and then change directory to it before installing the dependencies:

  ```shell
    git clone --recurse-submodules https://github.com/arcology-network/examples.git
    cd examples/ds-token
  ```
Start the network monitor to get the real-time status of the network:

  ```shell
       npx arcology.net-monitor http://192.168.1.103:8545
  ```

Install the frontend tools and use the `arcology.network-tx-sender` to send the transactions to the network:
The path `ds-token-mint` contains 200k of the pre-signed transactions for the `mint` function of the contract.

  ```shell
    npm install -g @arcologynetwork/frontend-tools@latest
    npx arcology.network-tx-sender http://192.168.1.103:8545 examples/ds-token/benchmark/txs/ds-token-mint
  ```  

### Results
