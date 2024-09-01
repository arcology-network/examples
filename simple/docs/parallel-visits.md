## Parallel Visits

Commutative data structures aren't the only way to count things concurrently. The provided Solidity code defines a smart contract named Visit that utilizes Arcology's concurrent library to handle concurrent calls efficiently. 

>> Please check out [this document for more details](https://doc.arcology.network/arcology-concurrent-programming-guide/data-structure/array/Bool) about the Bool data structure.

### Analysis

This [contract](./contracts/ParallelVisits.sol) imports the Bool data structure is used to handle concurrent updates to an array of boolean values. 

#### `counter` Variable

The Visits contract is defined here. It initializes a Bool array named counter, which is a concurrent array of boolean values.
A concurrent array is an arraythat can be added to concurrently by multiple transactions without conflicts.

#### `visit` Function

This function adds a new entry (true) to the counter array each time it is called. The use of the Bool data structure allows for concurrent writes to this array, making it safe for multiple users to call this function simultaneously without conflicts.

### Running the Demo

Check out the repository if you haven't done so and then change directory to it before installing the dependencies.

```shell 
    git clone --recurse-submodules https://github.com/arcology-network/examples.git
    cd examples/simple    
```

Since the example uses the `hardhat` framework, you need to edit the file `network.json` to replace the `url` with the URL of your running DevNet node. This allows the script to connect to the node.

```json
{
    "TestnetInfo": {
        "url": "your-devnet-rpc-url",
    }
}
```

Run the test script:

```shell 
    npm install
    yarn hardhat run test/test-bools.js --network TestnetInfo
```
