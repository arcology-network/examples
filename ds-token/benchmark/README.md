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
  
### Deploy the Contract
Under the `ds-token` directory, execute the following commands to deploy the parallelized `DSToken` contract to the network:

```shell
    npm install
    yarn hardhat run benchamark/deploy.js --network TestnetInfo
```

### Send Transactions   

Arcology provides a set of tools to help you send transactions to the deployed contract in batches.
The directory `examples/ds-token/benchmark/txs/ds-token-mint` contains 200k of pre-signed transactions for the `mint` function of the contract. You can use the following commands to send transactions to the deployed contract. 


Install the frontend tools:
  ```shell
    npm install -g @arcologynetwork/frontend-tools
  ```

Start the network monitor to get the real-time status of the network:
  ```shell
    npx arcology.net-monitor http://192.168.1.103:8545
  ```

The path `ds-token-mint` contains 200k of the pre-signed transactions for the `mint` function of the contract.
Assuming your IP address is `192.168.1.103`, Under the **`examples/ds-token`** directory run the following command to send the transactions to the network:

  ```shell
    npx arcology.net-tx-sender http://192.168.1.103:8545 benchmark/txs/ds-token-mint
  ```  

### Benchmark Data 

| English                         | Details                                    |
|---------------------------------|--------------------------------------------|
| **CPU**                         | AMD Ryzen Threadripper 2950X 16-Core Processor |
| **RAM**                         | 128GB                                      |
| **Tx/Block**                    | 20000                                      |
| **4 Threads Max TPS**           | 7452                                       |
| **8 Threads Max TPS**           | 10510                                      |
| **16 Threads Max TPS**          | 12042                                      |


