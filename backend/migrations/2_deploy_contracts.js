var Habit = artifacts.require("./Habit.sol");

module.exports = function(deployer) {
    deployer.deploy(Habit, 1000);
};