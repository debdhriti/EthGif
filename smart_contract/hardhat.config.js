//Smart contract is deployed on alchemy
//https://eth-goerli.g.alchemy.com/v2/l840tfcj47CGb8FLh85vft7pM6jmm1PH

//plugin to build smart contact tests
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/l840tfcj47CGb8FLh85vft7pM6jmm1PH",
      accounts: [
        //private key of the metamask account to be connected
        "36ecc98be2ea844937667e05d8d479e8b420db4e813cb41ed5d2aa1ea57bdf57",
      ],
    },
  },
};
