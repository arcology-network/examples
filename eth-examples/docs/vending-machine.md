# Parallel Vending Machine

The [vending machine](https://ethereum.org/en/developers/docs/smart-contracts/) is an example provided in Ethereum official documents.  The parallelized version is designed to demonstrate how a standard Ethereum contract can be parallelized using the Arcology's concurrent library.

## Analysis

In the parallelized version, we added a new `u256commulative` variable for the number of cupcakes in stock. After parallelization, both `refill` and `purchase`, can be called in parallel by different EOAs at the same time.  

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

Since the example uses the `hardhat` framework, you need to edit the file `network.json` to replace the `url` with the URL of your running DevNet node. This allows the script to connect to the node.

```json
{
    "TestnetInfo": {
        "url": "your-devnet-rpc-url",
    }
}
```

Run the example: 

``` shell
    yarn hardhat run test/test-vendingMachine.js --network TestnetInfo
```