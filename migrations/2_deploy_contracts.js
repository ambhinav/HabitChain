const Habit = artifacts.require("Habit");

module.exports = (deployer, network, accounts) => {
    deployer.deploy(Habit);
};