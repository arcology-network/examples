# Voting

The [Voting](https://docs.soliditylang.org/en/v0.8.21/solidity-by-example.html#voting) is an example provided in Ethereum official documents.  The parallelized version is designed to demonstrate how a standard Ethereum contract can be parallelized using the Arcology Network's concurrent libraries. In the new version, the variable weight and voteCountare replaced by two commutative variables that allow concurrent updates.

## Analysis

In the parallelized version, both of functions, `delegate` and `vote`, can be called in parallel by different accounts at the same time.  

##
Running the Demo
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

Run the example: 

``` shell
    yarn hardhat run test/test-vote.js --network TestnetInfo
```