<h1> Run the Examples  <img align="center" height="38" src="./img/home.svg">  </h1>

Arcology provides several concurrent examples to help you get started. These examples demonstrate the basics of building concurrent applications on the Arcology Network using Arcology’s concurrent library.


<h2> Prerequisites  <img align="center" height="25" src="./img/ruler.svg">  </h2>
You need the following tools installed on your machine:

- Node.js
- Yarn
- A Arcology DevNet docker container
- Docker
- 4 CPU cores
- 16GB RAM +
- 100GB free disk space
  

<h2> Start the DevNet <img align="center" height="25" src="./img/cloud.svg">  </h2>

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

### Update the DevNet Configuration

Usually `network.json` is the only file you need to modify. the `url` field should point to
the **RPC endpoint** of your running node. The default file includes 11 accounts for
testing purposes. If you need more, you can copy and paste the private keys, accounts and
balances from the `accounts.txt` file in the `account` directory.

The file looks like this:
```json
{
  "TestnetInfo": {
     "url": "http://192.168.117.128:8545", //Your rpc-url
     "accounts": ["5bb1315c3ffa654c89f1f8b27f93cb4ef6b0474c4797cf2eb40d1bdd98dc26e7",
                  "2289ae919f03075448d567c9c4a22846ce3711731c895f1bea572cef25bb346f",
                  "19c439237a1e2c86f87b2d31438e5476738dd67297bf92d752b16bdb4ff37aa2",
                  "236c7b430c2ea13f19add3920b0bb2795f35a969f8be617faa9629bc5f6201f1",
                  "c4fbe435d6297959b0e326e560fdfb680a59807d75e1dec04d873fcd5b36597b",
                  "f91fcd0784d0b2e5f88ec3ba6fe57fa7ef4fbf2fe42a8fa0aaa22625d2147a7a",
                  "630549dc7564f9789eb4435098ca147424bcde3f1c14149a5ab18e826868f337",
                  "2a31c00f193d4071adf4e45abaf76d7222d4af87ab30a7a4f7bae51e28aceb0a",
                  "a2ffe69115c1f2f145297a4607e188775a1e56907ca882b7c6def550f218fa84",
                  "d9815a0fa4f31172530f17a6ae64bf5f00a3a651f3d6476146d2c62ae5527dc4",
                  "134aea740081ac7e0e892ff8e5d0a763ec400fcd34bae70bcfe6dae3aceeb7f0"
                  ],
     "addrs": ["0xaB01a3BfC5de6b5Fc481e18F274ADBdbA9B111f0",
              "0x21522c86A586e696961b68aa39632948D9F11170",
              "0xa75Cd05BF16BbeA1759DE2A66c0472131BC5Bd8D",
              "0x2c7161284197e40E83B1b657e98B3bb8FF3C90ed",
              "0x57170608aE58b7d62dCdC3cbDb564C05dDBB7eee",
              "0x9F79316c20f3F83Fcf43deE8a1CeA185A47A5c45",
              "0x9f9E0F23aFd5404b34006678c900629183c9A25d",
              "0xd7cB260c7658589fe68789F2d678e1e85F7e4831",
              "0x230DCCC4660dcBeCb8A6AEA1C713eE7A04B35cAD",
              "0x8aa62d370585e28fd2333325d3dbaef6112279Ce",
              "0xc8bc50cA2443F4cE0ebF1bC9396B7f53f62e9C13"
              ],
     "chainId": 118
   }
}
```

## Run the Examples 

To get the examples, clone the repository with submodules:

```bash 
   git clone --recurse-submodules https://github.com/arcology-network/examples.git
```

###  1. Package Overview
The examples are organized into folders.

- **Account:** Testing accounts. Columns: private key, account address, initial balance (wei).

- **Scaffold:** Starting point with for building concurrent applications.
  
- **eth-examples:** Parallelized [examples](https://docs.soliditylang.org/en/v0.8.24/solidity-by-example.html) derived from some of the Ethereum examples. 

- **ds-token:** A parallelized version of the [ds-token](https://github.com/dapphub/ds-token).									

- **uniswap:** A parallelized version of the [uniswap v3](https://github.com/Uniswap/uniswap-v3-core).
  
In the folder where you want to run the example, execute the following command to install dependencies.
					
```shell
   [folder]> yarn
   [folder]> npm install -g @arcologynetwork/frontend-tools
```

>> For example, to run the examples in the `scaffold` folder, you do:

```shell
    scaffold> yarn
    scaffold> npm install -g @arcologynetwork/frontend-tools
```



### 2. Execute the Test Script

In the folder where you want to run the example, execute the following command to run the test script.
```shell 
  [folder]> yarn hardhat run test/test-[project].js --network TestnetInfo
```

>> For example, to run the `Like` example in the `scaffold` folder, you do:
>>```shell
>>  scaffold> yarn hardhat run test/test-like.js --network TestnetInfo
>>```
											

## Benchmarking <img align="center" height="25" src="./img/running.svg"> 
>> You will need a high-performance machine with multiple CPU cores to run the benchmarks effectively. Arcology is designed to leverage multi-core processors for optimal performance.

The `benchmark` folder in each folder contains transaction generation scripts, each in its own subfolder.

```
[folder]
└── benchmark
    └── [project]
        └── gen-tx-[project].js

```

### 1. Generating Transactions
Run the following command to generate transactions for the `Like` example:

```shell
   [folder]> yarn hardhat run benchmark/[project]/gen-tx-[project].js --network TestnetInfo
```
>> For example, to generate transactions for the `Like` example in the `scaffold` folder, you would run:
>>```shell
>>   scaffold> yarn hardhat run benchmark/like/gen-tx-like.js --network TestnetInfo
>>```


You should see an output similar to this:

```shell
Deploying like ==== Deployed Like at 0xBe5a9f4b7C2AF3000bAc55e114Ec3A3d55d330db 
Generating Txs [**** ] 9% 131.4s
```

The generated transaction files can be found in the `txs` subdirectory. 

```shell
   [folder]> benchmark/[project]/txs/[project]/[function].out
```

>>For example, the generated transaction files for the transactions calling the `like` function in the `Like` example >>can be found at:
>>```shell
>>   scaffold> benchmark/like/txs/like/like.out
>>```

### 2. Running the Benchmark

Send the generated transactions to your local node using the `arcology.net-tx-sender` tool. Assuming your node's IP address is `192.168.1.103`, you would run:

# Memory: 16GB

The following command will load all the transaction files (could be multiple) in the `like/` folder and send them to the node.
Assuming your node's IP address is `192.168.1.103`, you would run:

```shell
   npx arcology.net-tx-sender http://192.168.1.103:8545 benchmark/like/txs/like/
```  

You should see an output similar to this:

```shell 
height = 2014, empty block, timestamp = 1757509990965, maxTps = 0, realtimeTps = 0 maxGasBurned = 493640, realtimeGasBurned = 0 
height = 2015, total = 20000, success = 20000, fail = 0, timestamp = 1757509992541, maxTps = 12690, realtimeTps = 12690 maxGasBurned = 301992385, realtimeGasBurned = 301992385 
height = 2016, total = 20000, success = 20000, fail = 0, timestamp = 1757509993742, maxTps = 16652, realtimeTps = 16652 maxGasBurned = 396286427, realtimeGasBurned = 396286427 
height = 2017, total = 20000, success = 20000, fail = 0, timestamp = 1757509994826, maxTps = 18450, realtimeTps = 18450 maxGasBurned = 439059040, realtimeGasBurned = 439059040
```

>> The real-time TPS and gas consumption metrics are very much related to the performance of your machine.
>> Machines with more CPU cores and higher clock speeds will yield better results.


### 3. Benchmarking Metrics

| Metric                | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| **realtimeTps**       | Real-time TPS during the benchmarking.                      |
| **maxTps**            | Maximum TPS achieved during the benchmarking.               |
| **Total**             | Total number of transactions sent in the block.             |
| **Success**           | Number of successful transactions in the block.             |
| **Fail**              | Number of failed transactions in the block.                 |
| **realtimeGasBurned** | Real-time gas consumed during the benchmarking.             |
| **maxGasBurned**      | Maximum gas consumed in a single block during benchmarking. |
