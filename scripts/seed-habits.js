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
        console.log(chalk.blue("========= Connecting to deployed Habit Contract ========="))
        let habit_instance = await Habit.deployed();
        console.log(chalk.green("=========> Habit contract is deployed and available"));
        let habit_contract_address = habit_instance.address;
        console.log("Habit contract address:", habit_contract_address);
        let habit_contract_owner = await habit_instance.get_con_owner();
        console.log("Habit contract owner:", habit_contract_owner);

        // Fetch accounts from wallet/ganache
        const accounts = await web3.eth.getAccounts();

        // Set up Habit users - uses accounts 1 to 8
        const user1 = accounts[1];
        const user2 = accounts[2];
        const user3 = accounts[3];
        const user4 = accounts[4];
        const user5 = accounts[5];
        const user6 = accounts[6];
        const user7 = accounts[7];

        // Set up random start times for the five habits
        var start_time1 = adjust_to_sec(set_time(moment().add(1, 'days'), 8).valueOf());
        var start_time2 = adjust_to_sec(set_time(moment().add(2, 'days'), 12).valueOf());
        var start_time3 = adjust_to_sec(set_time(moment().add(3, 'days'), 9).valueOf());
        var start_time4 = adjust_to_sec(set_time(moment().add(4, 'days'), 6).valueOf());
        var start_time5 = adjust_to_sec(set_time(moment().add(5, 'days'), 10).valueOf());

        /// Create five of habits
        console.log(chalk.blue("========= Creating habits ========="));

        // 3 x habit type 0 -> Rise and Shine
        await habit_instance.create_habit(start_time1, 0, { from: user1 });
        await habit_instance.create_habit(start_time3, 0, { from: user2 });
        await habit_instance.create_habit(start_time5, 0, { from: user3 });

        // 2 x habit type 1 -> Strava
        await habit_instance.create_habit(start_time2, 1, { from: user4 });
        await habit_instance.create_habit(start_time4, 1, { from: user5 });

        // Sanity check 1
        let num_habits = await habit_instance.get_num_habits();
        let start_time_actual = await habit_instance.get_start_time(0);
        if (num_habits != 5) {
            throw "Habits created count is incorrect";
        }
        if (start_time1 != start_time_actual.toNumber()) {
            throw "Habit 1 start time is incorrect";
        }
        console.log(chalk.cyan("Number of habits created:", num_habits));
        console.log(chalk.green("=========> Habits are created"));

        /// Let users join the habits
        console.log(chalk.blue("========= Users are joining habits ========="));

        // Rise and Shine habits
        await habit_instance.join_habit(0, {
            from: user1,
            value: web3.utils.toBN(1e17)
        });
        await habit_instance.join_habit(0, {
            from: user6, 
            value: web3.utils.toBN(0.5 * 1e18)
        });
        await habit_instance.join_habit(1, {
            from: user2, 
            value: web3.utils.toBN(1e17)
        });
        await habit_instance.join_habit(2, {
            from: user3, 
            value: web3.utils.toBN(1e18)
        });

        // Strava habits
        await habit_instance.join_habit(3, {
            from: user4,
            value: web3.utils.toBN(1e17)
        });
        await habit_instance.join_habit(3, { 
            from: user7, 
            value: web3.utils.toBN(0.5*1e18)
        });
        await habit_instance.join_habit(4, {
            from: user5,
            value: web3.utils.toBN(1e18)
        });

        // Sanity check 2
        let num_users = await habit_instance.get_num_users(0);
        let pool = await habit_instance.get_pool(0);
        if (num_users != 2) {
            throw "Habit users count is incorrect";
        }

        console.log(chalk.cyan("Number of users in habit 1:", num_users));
        console.log(chalk.green("=========> Users have joined habits"));
        done();
    } catch (err) {
        console.log(chalk.red(err));
        done();
    }
}

