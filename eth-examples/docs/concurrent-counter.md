# Concurrent Counters

Concurrent counters are used in programming for tracking numerical values related to event occurrences, iterations, or any counting process. Using Arcology's advanced concurrent APIs, the example demonstrates how to implement a counter that operates efficiently in a parallel-processing environment.

## Analysis

The contract uses the `U256Cumulative` contract from Arcology's concurrent library to manage the cumulative count.

The constructor initializes the visitCounter variable with an initial `count` of `0` and a maximum value of `1,000,000.`

The `visit` function is a public function that can be called by multiple transactions in parallel. When called, it increments the visitCounter by `1` using the `add` function provided by the `U256Cumulative` contract.

The `getCounter` function allows anyone to retrieve the current value of the visit counter. It calls the get function provided by the `U256Cumulative` contract and returns the count.

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "arcologynetwork/contracts/concurrentlib/commutative/U256Cum.sol";

contract VisitCounter {    
    U256Cumulative counter;  
    
    constructor()  {
        visitCounter = new U256Cumulative(0, 1000000) ;  
    }    

    function visit() public {
        counter.add(1);
    }

    function getCounter() public returns(uint256){
        return counter.get();
    }
}
```

## Running the Demo

The example package comes with all the necessary scripts and files to run the example. Before you start, please make sure you have a live DevNet up and running.

First clone the project from GitHub if you haven't done so and then change directory to eth-examples.

```shell
    git clone --recurse-submodules https://github.com/arcology-network/examples.git
    cd examples/eth-examples
```

Under examples/eth-examples/, run the script to install dependencies.

```shell
    npm install
```

Since the example uses the `hardhat` framework, you need to edit the file `network.json` to replace the `url` with the URL of your running DevNet node. This allows the script to connect to the node.

```json
{
    "TestnetInfo": {
        "url": "your-devnet-rpc-url",
    }
}
```

Run the example: 

```shell
    yarn hardhat run test/test-visitCount.js --network TestnetInfo
```