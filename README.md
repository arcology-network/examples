<h1> Concurrent Contract Examples  <img align="center" height="38" src="./img/home.svg">  </h1>

This repository contains examples related to parallelization and concurrency for various projects. It contains detailed documentation, code samples, and other resources to help you understand and implement concurrent programming with help of Arcology's concurrent library. It helps you understand the basics of concurrent programming and how to implement it using Arcology's features.

<h2> Prerequisites  <img align="center" height="25" src="./img/ruler.svg">  </h2>
The examples are written in JavaScript and Solidity. To run the examples, you need the following tools installed on your machine:

- Node.js
- npm
- A live Arcology Network
<!-- - An Arcology [DevNet docker container](https://github.com/arcology-network/devnet) running to test the examples. -->

<h2> Installation <img align="center" height="25" src="./img/cloud.svg">  </h2>

```bash 
    git clone --recurse-submodules https://github.com/arcology-network/examples.git
```

<h2> Running the Examples  <img align="center" height="25" src="./img/library.svg">  </h2>

- [**simple:**](./simple/README.md) The `simple` directory contains examples showcasing some simple examples to do concurrent programming with Arcology's concurrent library. 

- [**eth-examples:**](./eth-examples/README.md) In the `eth-examples` directory, you'll find parallelized examples derived from some of the [original Ethereum examples](https://docs.soliditylang.org/en/v0.8.24/solidity-by-example.html). 

- [**ds-token:**](./ds-token/README.md) The `ds-token` directory hosts a parallelized version of the [original ds-token project](https://github.com/dapphub/ds-token). Learn how parallelization techniques have been applied to enhance the performance of ds-token.
  
- **parallel-kitties:** The directory contains a parallelized version of [original CryptoKitties project](https://github.com/dapperlabs/cryptokitties-bounty).

The package comes with some **pre-generated transactions** that you can use to test the examples. In the project directory, executing the following command to send the transctions calling `ParallelLike.sol` to the DevNet container at http://192.168.230.131:8545 to load the pre-generated transactions from the `parallel_likes.out` file and send them to the DevNet container.

The project also contains all the necessary files to run the ds-token on Arcology. Clone the repository to your local machine to get started.

<h2> Run Your Own Transactions <img align="center" height="25" src="">  </h2>

You can also generate transcations for your own contract and send them to the network in a similar way. To do so, you first need to generate the transactions and save them to a file, which can be then loaded and sent to the network using the `send-txs.js` script. There are some examples you can refer to. 

| Contract              | Script                         | Description                                                                                                                                                          |
|-----------------------|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [ParallelLike.sol](https://github.com/arcology-network/examples/simple/contracts/ParallelLike.sol)      | [gen-parallel-likes-txs.js](https://github.com/arcology-network/examples/simple/benchmark/gen-parallel-likes-txs.sol)      | Generates transactions for visiting the `like` contract.                     |
| [ParallelVisits.sol](https://github.com/arcology-network/examples/simple/contracts/ParallelVisits.sol)  | [gen-parallel-visits-txs.js](https://github.com/arcology-network/examples/simple/benchmark/gen-parallel-visits-txs.sol)    | Generates transactions for visiting the `Visits` contract.                   |
| [Token.sol](https://github.com/arcology-network/examples/ds-token/contracts/Token.sol)                  | [gen-dstoken-txs.js](https://github.com/arcology-network/examples/ds-token/benchmark/gen-dstoken-txs.sol)              | Generates transactions for minting and transferring of the `DSToken` contract.     |


<h2> Questions <img align="center" height="25" src="./img/chat.svg">  </h2>

Feel free to explore each directory for detailed explanations, code samples, and documentation related to the respective projects. If you have any questions, issues, or contributions, please don't hesitate to reach out. Please note that the examples are for educational purposes only and are not intended for production use. 

<h2> License  <img align="center" height="25" src="./img/copyright.svg">  </h2>
This project is licensed under the MIT License. 