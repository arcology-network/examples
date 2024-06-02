# Parallelized dstoken

The original ds-token implementation is available at https://github.com/dapphub/ds-token. It is A simple and sufficient ERC20 implementation under GPL-3.0 License.The original implementation is pretty self-explanatory. 

Typically, transactions involving different contracts without overlap can run in parallel since they do not share any state, a basis for many blockchain scaling solutions. However, handling multiple transactions calling the same contract is more challenging. 

The main goal of this ERC20 showcase is to demonstrate how Arcology's [concurrent library](https://github.com/arcology-network/concurrentlib)
 can help handle **large volumes of concurrent user calls to the same contract** without causing concurrency issues.

## Overview

The ds-token is chosen because it is simple enough for smart contract developers to easily understand what it is trying to do. On top of that, it is also complex enough to cover some of challenges developers may face in their daily work when considering possible code parallelization.

### Analysis

For 'mint' and 'burn' function, only one account is affected in each transaction—the account whose balance is increased by 'mint' or decreased by 'burn'. Therefore, calling 'mint' or 'burn' on different accounts does not create conflicts. 

For example, mint(addressA, wad) and mint(addressB, wad), burn(addressA, wad) and burn(addressB, wad), and mint(addressA, wad) and burn(addressB, wad) are not conflicting. Although these operations need to update 'totalSupply', this update is done in a deferred function, which does not impact parallelization. However, mint(addressA, wad) and mint(addressA, wad), burn(addressA, wad) and burn(addressA, wad), and mint(addressA, wad) and burn(addressA, wad) are conflicting because they all need to access the same key 'addressA' in the ConcurrentHashMap named 'balanceOf', which is not allowed.

For 'approve', 'transferFrom', and other wrapper functions, two accounts are involved: the token owner and the recipient. Similar to 'mint' and 'burn', if the account pairs in multiple transactions do not intersect, then the transactions are not conflicting and can be processed in parallel.

### Parallelization

Some modifications to the original implementation have been made with tools available in our [concurrency library]() to make parallelization possible. The following changes have been made to the original implementation:

- Replace the global variables `totalSupply` and `allowance` with a commutative `uint256` from the `concurrentlib`.  
- The `mint` and `burn` operate on the `totalSupply` by call `add` and `sub` on the `totalSupply`, instead of directly modifying it.
  
>> :bulb: The new implementation allows processing of concurrent calls to the same functions of the contract. For example, the `mint` and the`burn` function can be called by multiple users at the same time without any problem.


### Run the Demo

First, [Clone the repository](./docs/prep.md):

  ```shell
    git clone --recurse-submodules https://github.com/arcology-network/examples.git
    cd examples/ds-token
  ```

Then run the following command to run the test script:

  ```shell
    yarn hardhat run test/test-dsToken.js --network TestnetInfo
  ```
