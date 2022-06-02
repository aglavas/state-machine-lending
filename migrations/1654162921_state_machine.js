const StateMachine = artifacts.require("StateMachine.sol");

module.exports = function(deployer, _network, accounts) {
  deployer.deploy(StateMachine, 10000, 50, 100, accounts[1], accounts[2]);
};