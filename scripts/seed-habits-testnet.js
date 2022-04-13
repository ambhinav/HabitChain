const chalk = require('chalk');
const Habit = artifacts.require('Habit');
const moment = require('moment');

const set_time = (start_time, hour) => {
    start_time.set('hour', hour);
    start_time.set('minute', 00);
    start_time.set('second', 00);
    start_time.set('millisecond', 0);
    return start_time;
};

const adjust_to_sec = time => Math.floor(time / 1e3);

module.exports = async function (done) {
    try {
        // Connect to the deployed Habit contract and get some info
        console.log(chalk.blue("========= Connecting to deployed Habit Contract @rinkeby network ========="))
        let habit_instance = await Habit.deployed();
        console.log(chalk.green("=========> Habit contract is deployed and available"));
        let habit_contract_address = habit_instance.address;
        console.log("Habit contract address:", habit_contract_address);
        let habit_contract_owner = await habit_instance.get_con_owner();
        console.log("Habit contract owner:", habit_contract_owner);

        // Fetch accounts from metamask (rinkeby)
        const accounts = await web3.eth.getAccounts();

        // Set up Habit users
        const user1 = accounts[1];
        const user2 = accounts[2];

        // Set up random start times for the five habits
        var start_time1 = adjust_to_sec(set_time(moment().add(1, 'days'), 8).valueOf());
        var start_time2 = adjust_to_sec(set_time(moment().add(2, 'days'), 8).valueOf());

        /// Create five of habits
        console.log(chalk.blue("========= Creating habits ========="));

        // 1 x habit type 0 -> Rise and Shine
        await habit_instance.create_habit(start_time1, 0, { from: user1 });

        // 1 x habit type 0 -> Run 5 km
        await habit_instance.create_habit(start_time2, 1, { from: user2 });

        // Sanity check 1
        let num_habits = await habit_instance.get_num_habits();
        let start_time_actual = await habit_instance.get_start_time(0);
        if (num_habits != 1) {
            throw "Habits created count is incorrect";
        }
        if (start_time1 != start_time_actual.toNumber()) {
            throw "Habit 1 start time is incorrect";
        }
        console.log(chalk.cyan("Number of habits created:", num_habits));
        console.log(chalk.green("=========> Habits are created"));

        done();
    } catch (err) {
        console.log(chalk.red(err));
        done();
    }
}

