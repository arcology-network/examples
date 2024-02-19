require("@nomiclabs/hardhat-waffle");
require('dotenv').config()
const nets = require('./network.json');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

// const words = process.env.MNEMONIC.match(/[a-zA-Z]+/g).length
// validLength = [12, 15, 18, 24]
// if (!validLength.includes(words)) {
//    console.log(`The mnemonic (${process.env.MNEMONIC}) is the wrong number of words`)
//    process.exit(-1)
// }

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.19",
  networks: nets
};
