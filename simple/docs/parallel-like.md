## Parallel Like

The provided Solidity code defines a smart contract named Like that utilizes Arcology's concurrent library to handle concurrent calls.

>>  Please check out [this document for more details](https://doc.arcology.network/arcology-concurrent-programming-guide/data-structure/commutative/cumulative-u256) about the U256Cumulative data structure.

###  Analysis

The [contract](./contracts/ParallelLike.sol) imports the `U256Cumulative` library from the Arcology concurrent library. The `U256Cumulative` data structure is used to handle concurrent updates to a counter.

#### `likes` Counter

The contract initializes a U256Cumulative counter named likes with a starting value of `0` and a maximum value of `type(uint256).max`, ensuring the counter can handle a large number of likes. The `CounterQuery` will return the number of likes when queried.

#### `like` Function

This function increments the likes counter by 1 each time it is called. The use of the U256Cumulative data structure allows for concurrent calls to this function from mutiple transactions without conflicts, making it safe for multiple users to call simultaneously.


### Running the Demo

Check out the repository if you haven't done so and then change directory to it before installing the dependencies.

```shell 
    git clone --recurse-submodules https://github.com/arcology-network/examples.git
    cd examples/simple    
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
    yarn hardhat run test/test-like.js --network TestnetInfo
```
