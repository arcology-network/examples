## Benchmarking

This document provides a step-by-step guide to benchmarking the `DSToken` contract using Arcology's tools. The `DSToken` contract is a parallelized version of the `ERC20` contract that allows for concurrent minting and burning of tokens. Please refer to the [DSToken contract](../README.md) for more details.

>> :warning: You will need a **high-performance live testnet** for benchmarking. A devNet won't be able to handle the load. For more information on how to set up a live testnet, please refer to the [Arcology documentation](https://doc.arcology.network/benchmarking/standalone).

You will need a high-performance live testnet for benchmarking, as a devNet won't be able to handle the load. For more information on setting up a live testnet, please refer to the [Arcology documentation](https://doc.arcology.network/benchmarking/standalone).


### Clone the Repository

Clone the repository to your local machine and change directory to the `ds-token` directory:

  ```shell
    git clone --recurse-submodules https://github.com/arcology-network/examples.git
    cd examples/ds-token
  ```

### Send Transactions   

Arcology provides a set of tools to help you send transactions to the deployed contract in batches.
The directory `examples/ds-token/benchmark/txs/ds-token-mint` contains 200k of pre-signed transactions for the `mint` function of the contract. You can use the following commands to send transactions to the deployed contract. 

Assuming your IP address is `192.168.1.103`, start the network monitor to get the real-time status of the network:

  ```shell
    npx arcology.net-monitor http://192.168.1.103:8545
  ```

Install the frontend tools and use the `arcology.net-tx-sender` to send the transactions to the network:
The path `ds-token-mint` contains 200k of the pre-signed transactions for the `mint` function of the contract.
**Under the `examples/ds-token` directory** run the following command to send the transactions to the network:

  ```shell
    npm install -g @arcologynetwork/frontend-tools
    npx arcology.net-tx-sender http://192.168.1.103:8545 benchmark/txs/ds-token-mint
  ```  
