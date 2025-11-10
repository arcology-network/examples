import { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-ethers";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import accounts from './accounts.json' assert { type: "json" };

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.19",
      },
      production: {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    TestnetInfo: {
      type: 'http',
      url: 'http://192.168.174.132:8545',
      accounts: [...accounts],
      chainId: 118,
    }
  }
};

export default config;
