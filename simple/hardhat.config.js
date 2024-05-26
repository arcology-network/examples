require("@nomiclabs/hardhat-waffle");
require('dotenv').config()
const nets = require('./network.json');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.19",
  networks: nets
};
