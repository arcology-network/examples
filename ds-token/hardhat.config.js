require("@nomiclabs/hardhat-waffle");
require('dotenv').config()
const accounts = require('./accounts.json');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.6",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.4.18",
        settings: { optimizer: { enabled: true, runs: 200 } },
      }
    ],
    overrides: {
      "contracts/WETH9.sol": {
        version: "0.4.18",
        settings: { optimizer: { enabled: true, runs: 200 } },
      }
    }
  },
  networks: {
    TestnetInfo: {
      url: 'http://192.168.174.132:8545',
      accounts: [...accounts],
      chainId: 118,
    }
  },
};
