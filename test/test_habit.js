const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const { verify } = require("crypto");
const helper = require('./truffleTestHelper');

var Habit = artifacts.require("../contracts/Habit.sol");
/*
Every test needs you to restart the ganache instance. This is because the tests create a habit in the array of habits.

So when you try and rerun the test, the creating of habits does not start at 0. 
*/

contract('Habit', function(accounts) {

    before(async () => {
        habit_instance = await Habit.deployed();
    });

    console.log("Testing Habit Contract");
    const TEST_START_TIME = Math.floor(Date.now()/1e3) + 1e2; // adjust to sec
    const FIVE_DAYS_IN_SECONDS = 432e3;

    it('Create Habit', async () => {
        let make_habit = await habit_instance.create_habit(TEST_START_TIME, 0, {from: accounts[1]});

        assert.notStrictEqual(
            make_habit,
            undefined,
            "Failed to make habit"
        );

        truffleAssert.eventEmitted(make_habit, 'CreateHabit', (ev) => {
            return ev.owner == accounts[1] && ev.habit_id == 0 &&
             ev.start_time == TEST_START_TIME && ev.habit_type == 0
        }, 'Create Habit event not emitted with correct params');
    });

    it('Cannot create habit if start time less than block.timestamp', async () => {
        return truffleAssert.reverts(
            habit_instance.create_habit(TEST_START_TIME - 1e3, 0, {from: accounts[1]}),
            "Start time must be in the future"
        );
    });

    it('Verify habit fields', async () => {
        let _s_time = await habit_instance.get_start_time(0);
        let _e_time = await habit_instance.get_end_time(0);
        let _owner = await habit_instance.get_owner(0);
        let habit_type = await habit_instance.get_habit_type(0);
        let num_habits = await habit_instance.get_num_habits();

        // print type of obj1
        // console.log(typeof obj1);
        // console.log(obj1[0].toNumber());
        // console.log(obj1[1].toNumber());
        // console.log(obj1[2].toNumber());




        // console.log("Start time: " + _s_time);
        //console.log("Start time2: ", y.toNumber() , m.toNumber(), d.toNumber());

        assert.strictEqual(
            _s_time.toNumber(),
            TEST_START_TIME,
            "Start time not created properly"
        );

        assert.strictEqual(
            _e_time.toNumber(),
            FIVE_DAYS_IN_SECONDS + TEST_START_TIME,
            "End time not created properly or using wrong measurements"
        );

        assert.strictEqual(
            _owner,
            accounts[1],
            "Owner not set properly"
        );

        assert.strictEqual(
            habit_type.toNumber(),
            0,
            "Habit type not set properly"
        );

        assert.strictEqual(
            num_habits.toNumber(),
            1,
            "Number of total habits not reflected accurately in contract"
        );

    });

    it('User can join habit', async () => {
        let user_joins = await habit_instance.join_habit(0, {from: accounts[1], value: web3.utils.toBN(1e18)});
        let user_joins_2 = await habit_instance.join_habit(0, {from: accounts[2], value: web3.utils.toBN(1e18)});

        assert.notStrictEqual(
            user_joins,
            undefined,
            "User 1 failed to join habit"
        );
        assert.notStrictEqual(
            user_joins_2,
            undefined,
            "User 2 failed to join habit"
        );

        truffleAssert.eventEmitted(user_joins, 'JoinHabit', (ev) => {
             return ev.joiner == accounts[1] && ev.habit_id == 0 &&
                expect(ev.pledge_amt).to.eql(web3.utils.toBN(1e18)); 
        }, 'Join Habit event not emitted with correct params');
        truffleAssert.eventEmitted(user_joins_2, 'JoinHabit', (ev) => {
            return ev.joiner == accounts[2] && ev.habit_id == 0 &&
               expect(ev.pledge_amt).to.eql(web3.utils.toBN(1e18)); 
       }, 'Join Habit event not emitted with correct params');
    });

    it('User cannot join habit twice', async () => {
        return truffleAssert.reverts(
            habit_instance.join_habit(0, {from: accounts[1], value: web3.utils.toBN(1e10)}),
            "User has already joined habit"
        );
    });

    it('Verify habit fields after user joins', async () => {
        let pool = await habit_instance.get_pool(0);
        let is_user_joined_habit_zero = await habit_instance.is_user_joined_habit(0, accounts[1]);

        expect(pool).to.eql(web3.utils.toBN(1e18 * 2)); 

        assert.strictEqual(
            is_user_joined_habit_zero,
            true,
            "user not reflected in habit's users mapping"
        )
    });

    /*
    user1 verifies on days 1 to 3 (0 to 2 index)
    */
    it("Verifying consistently up to day offset results in a winner", async () => {
        let user1_day0_verified = await habit_instance.verify(0, accounts[1], 0);
        let user1_day1_verified = await habit_instance.verify(0, accounts[1], 1);
        let user1_day2_verified = await habit_instance.verify(0, accounts[1], 2);
        let is_user1_loser1 = await habit_instance.is_user_a_loser(0, accounts[1]);
        assert.strictEqual(
            is_user1_loser1,
            false,
            "users check_list not filled properly"
        )

    });

    /*
    user1 skips verifying on day 4
    user1 verifies on day 5. user1 should be labelled as a loser.
    */
    it("Skipping a day and then verify results in a loser", async () => {

        let user1_day4_verified = await habit_instance.verify(0, accounts[1], 4);
        // console.log(user1_day4_verified);
        /* check user1 array after 5 days and skipping day 4
        let is_user1_array2 = await habit_instance.get_user_check_list.call(0, accounts[1]);
        // loop through array of big numbers
        for (let i = 0; i < is_user1_array2.length; i++) {
            console.log(is_user1_array2[i].toNumber());
        }
        */

        // console.log(is_user1_array2);
        let is_user1_loser2 = await habit_instance.is_user_a_loser(0, accounts[1]);
        assert.strictEqual(
            is_user1_loser2,
            true,
            "users check_list not filled properly 2"
        )
    });


    it('End habit fails when non contract owner calls it', async () => {
        return truffleAssert.reverts(
            habit_instance.end_habit(0, {from: accounts[1]}),
            "Only owner of this contract can call this method"
        );
    });
    
    it('Unable to call method before end time', async () => {
        return truffleAssert.reverts(
            habit_instance.end_habit(0, {from: accounts[0]}),
            "Can only end this habit after end time"
        );
    });

    it('Returns money to 1 winner', async () => {
        const new_block = await helper.advanceTimeAndBlock(FIVE_DAYS_IN_SECONDS + 100);
        let end_habit = await habit_instance.end_habit(0, {from: accounts[0]});

        assert.notStrictEqual(
            end_habit,
            undefined,
            "Failed to end habit"
        );

        truffleAssert.eventEmitted(end_habit, 'EndHabit', (ev) => {
            return ev.winner == accounts[2] && ev.habit_id == 0 &&
                expect(ev.win_amt).to.eql(web3.utils.toBN(1e18 * 2)); 
        }, 'End Habit event not emitted with correct params');
    });


    it('Create 2 new habits with two users each', async () => {
        const NEW_START_TIME = TEST_START_TIME + FIVE_DAYS_IN_SECONDS + 200;
    
        // Make habits for habits 1 and 2
        let make_habit = await habit_instance.create_habit(NEW_START_TIME, 0, {from: accounts[3]});
        let make_habit_2 = await habit_instance.create_habit(NEW_START_TIME, 1, {from: accounts[5]});

        assert.notStrictEqual(
            make_habit,
            undefined,
            "Failed to make habit"
        );
        assert.notStrictEqual(
            make_habit_2,
            undefined,
            "Failed to make habit"
        );

        truffleAssert.eventEmitted(make_habit, 'CreateHabit', (ev) => {
            return ev.owner == accounts[3] && ev.habit_id == 1 &&
             ev.start_time == NEW_START_TIME && ev.habit_type == 0
        }, 'Create Habit event not emitted with correct params');
        truffleAssert.eventEmitted(make_habit_2, 'CreateHabit', (ev) => {
            return ev.owner == accounts[5] && ev.habit_id == 2 &&
             ev.start_time == NEW_START_TIME && ev.habit_type == 1
        }, 'Create Habit event not emitted with correct params');

        // User joins for habit 1
        let user_joins = await habit_instance.join_habit(1, {from: accounts[3], value: web3.utils.toBN(1e18)});
        let user_joins_2 = await habit_instance.join_habit(1, {from: accounts[4], value: web3.utils.toBN(1e18)});

        assert.notStrictEqual(
            user_joins,
            undefined,
            "User 1 failed to join habit"
        );
        assert.notStrictEqual(
            user_joins_2,
            undefined,
            "User 2 failed to join habit"
        );

        truffleAssert.eventEmitted(user_joins, 'JoinHabit', (ev) => {
             return ev.joiner == accounts[3] && ev.habit_id == 1 &&
                expect(ev.pledge_amt).to.eql(web3.utils.toBN(1e18)); 
        }, 'Join Habit event not emitted with correct params');
        truffleAssert.eventEmitted(user_joins_2, 'JoinHabit', (ev) => {
            return ev.joiner == accounts[4] && ev.habit_id == 1 &&
               expect(ev.pledge_amt).to.eql(web3.utils.toBN(1e18)); 
       }, 'Join Habit event not emitted with correct params');

       // User joins for habit 2
       let user_joins_3 = await habit_instance.join_habit(2, {from: accounts[5], value: web3.utils.toBN(1e18)});
        let user_joins_4 = await habit_instance.join_habit(2, {from: accounts[6], value: web3.utils.toBN(1e18)});

        assert.notStrictEqual(
            user_joins_3,
            undefined,
            "User 1 failed to join habit"
        );
        assert.notStrictEqual(
            user_joins_4,
            undefined,
            "User 2 failed to join habit"
        );

        truffleAssert.eventEmitted(user_joins_3, 'JoinHabit', (ev) => {
             return ev.joiner == accounts[5] && ev.habit_id == 2 &&
                expect(ev.pledge_amt).to.eql(web3.utils.toBN(1e18)); 
        }, 'Join Habit event not emitted with correct params');
        truffleAssert.eventEmitted(user_joins_4, 'JoinHabit', (ev) => {
            return ev.joiner == accounts[6] && ev.habit_id == 2 &&
               expect(ev.pledge_amt).to.eql(web3.utils.toBN(1e18)); 
       }, 'Join Habit event not emitted with correct params');  
    });

    /*
    user1 verifies on days 1 to 3 (0 to 2 index)
    */
    it("Losing user account 5 and 6", async () => {
        let user1_day0_verified = await habit_instance.verify(2, accounts[5], 0);
        let user1_day1_verified = await habit_instance.verify(2, accounts[5], 1);
        let user1_day2_verified = await habit_instance.verify(2, accounts[5], 2);
        let is_user1_loser1 = await habit_instance.is_user_a_loser(2, accounts[5]);
        assert.strictEqual(
            is_user1_loser1,
            false,
            "user1 check_list not filled properly"
        );

        let user1_day4_verified = await habit_instance.verify(2, accounts[5], 4);
        let is_user1_loser2 = await habit_instance.is_user_a_loser(2, accounts[5]);
        assert.strictEqual(
            is_user1_loser2,
            true,
            "user1 check_list not filled properly 2"
        );

        let user2_day0_verified = await habit_instance.verify(2, accounts[6], 0);
        let user2_day1_verified = await habit_instance.verify(2, accounts[6], 1);
        let user2_day2_verified = await habit_instance.verify(2, accounts[6], 2);
        let is_user2_loser1 = await habit_instance.is_user_a_loser(2, accounts[6]);
        assert.strictEqual(
            is_user2_loser1,
            false,
            "user2 check_list not filled properly"
        );

        let user2_day4_verified = await habit_instance.verify(2, accounts[6], 4);
        let is_user2_loser2 = await habit_instance.is_user_a_loser(2, accounts[6]);
        assert.strictEqual(
            is_user2_loser2,
            true,
            "user2 check_list not filled properly 2"
        );
    });

    it('Returns money to both winners', async () => {
        const new_block = await helper.advanceTimeAndBlock(FIVE_DAYS_IN_SECONDS + 500);
        let end_habit = await habit_instance.end_habit(1, {from: accounts[0]});

        assert.notStrictEqual(
            end_habit,
            undefined,
            "Failed to end habit"
        );

        truffleAssert.eventEmitted(end_habit, 'EndHabit', (ev) => {
            return ev.winner == accounts[3] && ev.habit_id == 1 &&
                expect(ev.win_amt).to.eql(web3.utils.toBN(1e18)); 
        }, 'End Habit event not emitted with correct params');
        truffleAssert.eventEmitted(end_habit, 'EndHabit', (ev) => {
            return ev.winner == accounts[4] && ev.habit_id == 1 &&
                expect(ev.win_amt).to.eql(web3.utils.toBN(1e18)); 
        }, 'End Habit event not emitted with correct params');
    });

    it('Does not return money to anyone', async () => {
        let end_habit = await habit_instance.end_habit(2, {from: accounts[0]});

        assert.notStrictEqual(
            end_habit,
            undefined,
            "Failed to end habit"
        );

        let balance = await web3.eth.getBalance(habit_instance.address);
        expect(web3.utils.toBN(balance)).to.eql(web3.utils.toBN(1e18 * 2));
    });
    
});