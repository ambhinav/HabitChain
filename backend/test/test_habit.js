const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');

var Habit = artifacts.require("../contracts/Habit.sol");

contract('Habit', function(accounts) {

    before(async () => {
        habit_instance = await Habit.deployed();
    });

    console.log("Testing Habit Contract");
    const TEST_START_TIME = Math.floor(Date.now()/1e3) + 1e2; // adjust to sec
    const FIVE_DAYS_IN_SECONDS = 432e3;

    it('Create Habit', async () => {
        let make_habit = await habit_instance.create_habit(TEST_START_TIME, {from: accounts[1]});

        assert.notStrictEqual(
            make_habit,
            undefined,
            "Failed to make habit"
        );

        truffleAssert.eventEmitted(make_habit, 'CreateHabit', (ev) => {
            return ev.owner == accounts[1] && ev.habit_id == 0 &&
             ev.start_time == TEST_START_TIME
        }, 'Create Habit event not emitted with correct params');
    });

    it('Cannot create habit if start time less than block.timestamp', async () => {
        return truffleAssert.reverts(
            habit_instance.create_habit(TEST_START_TIME - 1e3, {from: accounts[1]}),
            "Start time must be in the future"
        );
    });

    it('Verify habit fields', async () => {
        let _s_time = await habit_instance.get_start_time(0);
        let _e_time = await habit_instance.get_end_time(0);
        let _owner = await habit_instance.get_owner(0);
        let num_habits = await habit_instance.get_num_habits();

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
            num_habits.toNumber(),
            1,
            "Number of total habits not reflected accurately in contract"
        );

    });

    it('User can join habit', async () => {
        let user_joins = await habit_instance.join_habit(0, {from: accounts[1], value: web3.utils.toBN(1e18)});

        assert.notStrictEqual(
            user_joins,
            undefined,
            "Failed to join habit"
        );

        truffleAssert.eventEmitted(user_joins, 'JoinHabit', (ev) => {
             return ev.joiner == accounts[1] && ev.habit_id == 0 &&
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

        expect(pool).to.eql(web3.utils.toBN(1e18)); 

        assert.strictEqual(
            is_user_joined_habit_zero,
            true,
            "user not reflected in habit's users mapping"
        )
    });

    
});