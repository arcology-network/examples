require("@nomiclabs/hardhat-waffle");
const accounts = require('./accounts.json');

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity:  {
    compilers: [
      {
        version: "0.7.6",
        settings: { 
          optimizer: { enabled: true, runs: 100 } ,
          metadata: {
            bytecodeHash: "none"
          },
          debug: { revertStrings: "strip" }
        },
      },
      {
        version: "0.4.18",
        settings: { 
          optimizer: { enabled: true, runs: 200 } ,
          debug: { revertStrings: "strip" }
        },
      }
    ],
    overrides: {
      "contracts/WETH9.sol": {
        version: "0.4.18",
        settings: { 
          optimizer: { enabled: true, runs: 200 } ,
          debug: { revertStrings: "strip" }
        },
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
