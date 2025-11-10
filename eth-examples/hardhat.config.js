require("@nomiclabs/hardhat-waffle");
require('dotenv').config()
const accounts = require('./accounts.json');


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.6",
  networks: {
    TestnetInfo: {
      url: 'http://192.168.174.132:8545',
      accounts: [...accounts],
      chainId: 118,
    }
  },
};
