# Concurrent Contract Examples

This repository contains examples related to parallelization and concurrency for various projects. It contains detailed documentation, code samples, and other resources to help you understand and implement concurrent programming with help of Arcology's concurrent library. It helps you understand the basics of concurrent programming and how to implement it using Arcology's features.

<h2> Folders  <img align="center" height="32" src="./img/folder.svg">  </h2>

- **simple:** The `simple` directory contains examples showcasing some simple examples to do concurrent programming with Arcology's concurrent library. 

- **eth-examples:** In the `eth-examples` directory, you'll find parallelized examples derived from some of the [original Ethereum examples](https://docs.soliditylang.org/en/v0.8.24/solidity-by-example.html). 

- **ds-token:** The `ds-token` directory hosts a parallelized version of the [original ds-token project](https://github.com/dapphub/ds-token). Learn how parallelization techniques have been applied to enhance the performance of ds-token.
  
- **parallel-kitties:** The directory contains a parallelized version of [original CryptoKitties project](https://github.com/dapperlabs/cryptokitties-bounty).

## Prerequisites

- Node.js
- npm
- An Arcology [DevNet docker container](https://github.com/arcology-network/devnet) running to test the examples.

## Installation

The examples are written in JavaScript and Solidity. To run the examples, you need to have Node.js and npm installed on your machine.

### Clone the Repository

```bash 
> git clone https://github.com/arcology-network/examples.git
```

### Change to a Specific Example Directoy

```bash
> cd /github.com/arcology-network/examples/simple
```

### Set up the Modules
    
```bash
> npm install
```

### Start Network Monitor

You can start interacting the network monitor, which can help you check the status of the network, check the TPS, and monitor the blocks. Using the the following command to start it:

```bash
> nodejs node_modules/@arcologynetwork/frontend/tools/network-monitor.js
```

## Running the Examples

The package comes with some **pre-generated transactions** that you can use to test the examples. In the project directory, executing the following command to send the transctions calling `ParallelLike.sol` to the DevNet container at http://192.168.230.131:8545

```bash
> nodejs node_modules/@arcologynetwork/frontend-tools/tools/send-txs.js http://192.168.230.131:8545 data/parallel_likes.out
```

Basically, what it does is to load the pre-generated transactions from the `parallel_likes.out` file and send them to the DevNet container.


### Running Your Own Example

You can also generate transcations for your own contract and run them. To do so, you need to have the `@arcologynetwork/frontend-tools` package installed. You can install it by running the following command:


<h2> Questions <img align="center" height="32" src="./img/chat.svg">  </h2>

Feel free to explore each directory for detailed explanations, code samples, and documentation related to the respective projects. If you have any questions, issues, or contributions, please don't hesitate to reach out. Please note that the examples are for educational purposes only and are not intended for production use. 

<h2> Disclaimer  <img align="center" height="32" src="./img/warning.svg">  </h2>

Arcology's concurrent lib is made available under the MIT License, which disclaims all warranties in relation to the project and which limits the liability of those that contribute and maintain the project. You acknowledge that you are solely responsible for any use of the Contracts and you assume all risks associated with any such use.

<h2> License  <img align="center" height="32" src="./img/copyright.svg">  </h2>

This project is licensed under the MIT License.