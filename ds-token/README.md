# Parallellized dstoken

The original ds-token implementation is available at https://github.com/dapphub/ds-token. It is A simple and sufficient ERC20 implementation under GPL-3.0 License.The original implementation is pretty self explanatory. 

Typically, transactions involving different contracts without overlap can run in parallel since they do not share any state, a basis for many blockchain scaling solutions. However, handling multiple transactions calling the same contract is more challenging. 

The main goal of the this ERC20 showcase is to demonstrate how Arcology's [concurent library](https://github.com/arcology-network/concurrentlib)
 can help handle **large volumes of concurrent user calls to the same contract** without causing concurrency issues.

## Overview

The ds-token is chosen because it is simple enough for smart contract developers to easily understand what it is trying to do. On top of that, it is also complex enough to cover some of challenges developers may face in their daily work when considering possible code parallelization.

Some modifications to the original implementation have been made with tools available in our [concurrency library]() to make parallelization possible. The following changes have been made to the original implementation:

- Replace the global variables `totalSupply` and `allowance` with a commutative `uint256` from the `concurrentlib`.  
- The `mint` and `burn` operate on the `totalSupply` by call `add` and `sub` on the `totalSupply`, instead of directly modifying it.
  
The new implementation allows processing of concurrent calls to the same functions of the contract. For example, the `mint` and the`burn` function can be called by multiple users at the same time without any problem.


## Clone the Repository
The package contains all the necessary files to run the ds-token on Arcology. Clone the repository to your local machine to get started.

  ```shell
    git clone https://github.com/arcology-network/examples.git
  ```

## Deploy the Parallellized ds-token

  ```shell
    cd examples/ds-token
    ds-token> npm install
    ds-token> yarn hardhat run benchmark/deploy.js --network TestnetInfo
  ```

## Send Transactions  

Assuming your IP address is `192.168.1.103`.

  ```shell
    ds-token> nodejs tools/send-txs.js http://192.168.1.103:8545 xx/dstoken_mint_200k.txt
  ```  

## Benchmark Results
