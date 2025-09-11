<h1> Run the Examples  <img align="center" height="38" src="./img/home.svg">  </h1>

Arcology provides several concurrent examples to help you get started. These examples demonstrate the basics of building concurrent applications on the Arcology Network using Arcology’s concurrent library.


<h2> Prerequisites  <img align="center" height="25" src="./img/ruler.svg">  </h2>
You need the following tools installed on your machine:

- Node.js
- Yarn
- A Arcology DevNet docker container

<h2> Get the DevNet <img align="center" height="25" src="./img/cloud.svg">  </h2>

```shell
 ip=192.168.1.109;docker run -itd --name l1 -p 8545:8545 -p 26656:26656 -p 9191:9191 -p 9192:9192 -p 9292:9292 arcologynetwork/devnet -f http://$ip:7545 -b http://$ip:3500 -s http://$ip:8545 -r true -m false
```
>> Replace the `ip` variable with your machine's local IP address.

You should see an output similar to this:

```shell
Unable to find image 'arcologynetwork/devnet:latest' locally
latest: Pulling from arcologynetwork/devnet
eda6120e237e: Pull complete 
1ddaf4addd51: Pull complete 
4f4fb700ef54: Pull complete 
7a377f784e1c: Pull complete 
8ec60f2198bb: Pull complete 
6b222784fac3: Pull complete 
53231e7f88b6: Pull complete 
d466946a8540: Pull complete 
2b9eda8dfee2: Pull complete 
Digest: sha256:34bda084de9ff7f62b4478848411b6f6c4b493f2a06059c4a5d30c99e44e1a89
Status: Downloaded newer image for arcologynetwork/devnet:latest
200ee2aac356625d5dad46384a678c3f5590d738f899893fa54b76bbcd3ff1d8
```

<h2> Clone the Project  <img align="center" height="25" src="./img/library.svg">  </h2>

```bash 
    git clone --recurse-submodules https://github.com/arcology-network/examples.git
```

### Package Stucture:

- **Scaffold:** Starting point with for building concurrent applications.

- **Account:** Accounts for testing purpose.
  
- [**eth-examples:**](./eth-examples/README.md) Parallelized examples derived from some of the [original Ethereum examples](https://docs.soliditylang.org/en/v0.8.24/solidity-by-example.html). 

- [**ds-token:**](./ds-token/README.md) A parallelized version of the [original ds-token project](https://github.com/dapphub/ds-token).
  
<h2> Running Scaffold Examples <img align="center" height="25" src="./img/running.svg">  </h2>

### Update the Network Configuration


Under the `scaffold` directory, execute the following command to install the dependencies:

```shell
   scaffold> yarn
```

### 1. Run the Parallel Like

A contract and keeps track of the number of calls made to it concurrently.
```shell 
   scaffold> yarn hardhat run test/test-like.js --network TestnetInfo
```

Benchmarking the example:

```shell
   scaffold> yarn hardhat run test/benchmark-like.js --network TestnetInfo
```



### 2. Run the Subcurrency

An Ethereum example.
```shell
   scaffold> yarn hardhat run test/test-subCurrency.js --network TestnetInfo
```

Benchmarking the example:

```shell
   scaffold> yarn hardhat run test/benchmark-subCurrency.js --network TestnetInfo
```

## Benchmarking

The `benchmark` folder contains performance test scripts, each in its own subfolder. For example, run the transaction generation script for the `Like` case can be found in the `like` subdirectory:

```shell
scaffold> benchmark/like/gen-tx-like.js
```

### Generating Transactions
Run the following command to generate transactions for the `Like` example:

```shell
   scaffold> yarn hardhat run benchmark/like/gen-tx-like.js --network TestnetInfo
```

You should see an output similar to this:

```shell
shell ===========start create like===================== Deployed Like Test at 0xBe5a9f4b7C2AF3000bAc55e114Ec3A3d55d330db ===========start generate like tx===================== Generating Tx data [**** ] 9% 131.4s
```

The generated transaction files can be found in the `txs` subdirectory. 

```shell
   scaffold> benchmark/like/txs/like/like.out
```

### Install the TPS Monitoring Tool
Install a light TPS monitor:

```shell
   scaffold> npm install -g @arcologynetwork/frontend-tools
```

### Sending the Transactions

Then run the benchmarking scripts to send the transactions and measure performance.

```shell
   scaffold> yarn hardhat run benchmark/like/bench-tx-like.js --network TestnetInfo
```

You should see an output similar to this:

```shell 
height = 2014, empty block, timestamp = 1757509990965, maxTps = 0, realtimeTps = 0 maxGasBurned = 493640, realtimeGasBurned = 0 height = 2015, total = 20000, success = 20000, fail = 0, timestamp = 1757509992541, maxTps = 12690, realtimeTps = 12690 maxGasBurned = 301992385, realtimeGasBurned = 301992385 height = 2016, total = 20000, success = 20000, fail = 0, timestamp = 1757509993742, maxTps = 16652, realtimeTps = 16652 maxGasBurned = 396286427, realtimeGasBurned = 396286427 height = 2017, total = 20000, success = 20000, fail = 0, timestamp = 1757509994826, maxTps = 18450, realtimeTps = 18450 maxGasBurned = 439059040, realtimeGasBurned = 439059040 height = 2018, total = 20000, success = 20000, fail = 0, timestamp = 1757509995910, maxTps = 18450, realtimeTps = 18450 maxGasBurned = 439059040, realtimeGasBurned = 439059040 height = 2019, total = 20000, success = 20000, fail = 0, timestamp = 1757509997052, maxTps = 18450, realtimeTps = 17513 maxGasBurned = 439059040, realtimeGasBurned = 416760070 height = 2020, empty block, timestamp = 1757509997552, maxTps = 18450, realtimeTps = 0 maxGasBurned = 439059040, realtimeGasBurned = 0

```

| Metric                | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| **realtimeTps**       | Real-time TPS during the benchmarking.                      |
| **maxTps**            | Maximum TPS achieved during the benchmarking.               |
| **Total**             | Total number of transactions sent in the block.             |
| **Success**           | Number of successful transactions in the block.             |
| **Fail**              | Number of failed transactions in the block.                 |
| **realtimeGasBurned** | Real-time gas consumed during the benchmarking.             |
| **maxGasBurned**      | Maximum gas consumed in a single block during benchmarking. |
