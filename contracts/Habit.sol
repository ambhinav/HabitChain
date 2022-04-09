pragma solidity ^0.5.0;

contract Habit {

    struct user {
        address addr;
        uint256 pledge_amt;
        bool is_loser;
        uint8[5] check_list;
    }

    struct habit {
        mapping(address => user) users;
        mapping(uint256 => address) user_addresses;
        address owner;
        uint start_time;
        uint end_time;
        uint256 pool;
        uint256 num_users;
        uint habit_type;
        bool is_deleted;
    }

    /* ======= CONTRACT STATE ======= */

    address con_owner = msg.sender;
    uint256 public num_habits = 0;
    uint256 public main_pool = 0;
    mapping(uint256 => habit) public habits;

    /* ======= EVENTS ======= */

    event CreateHabit(address owner, uint256 habit_id, uint start_time, uint habit_type);
    event JoinHabit(address joiner, uint256 habit_id, uint256 pledge_amt);
    event EndHabit(address winner, uint256 habit_id, uint256 win_amt);
    event TickUserList(uint256 habit_id, address user_addr, uint date_num);
    event AllLose(uint256 habit_id, uint256 lose_amt);

    /* ======= MODIFIERS ======= */

    modifier is_valid_id(uint256 habit_id) {
        require(habit_id < num_habits, "Invalid habit id");
        _;
    }

    modifier is_not_loser(uint256 habit_id, address user_addr) {
        require(!habits[habit_id].users[user_addr].is_loser, "User has lost, no need to check on him.");
        _;
    }

    modifier only_owner(address addr) {
        require(addr == con_owner, "Only owner of this contract can call this method");
        _;
    }

    modifier is_not_deleted(uint256 habit_id) {
        require(!habits[habit_id].is_deleted, "Habit has been deleted");
        _;
    }
    /**
    * @dev Creates and starts the challenge
    * @param start_time_ expects Unix timestamp in seconds
    * @param habit_type_ expects Habit Types either 0 or 1
    *
    * Requirements:
    *
    * - `start_time_` must be in the future
    */
    function create_habit(uint start_time_, uint habit_type_) public {
        require(block.timestamp < start_time_, "Start time must be in the future");
        require(habit_type_ == 0 || habit_type_ == 1, "Habit type must be either id 0 or 1");
        habit memory new_habit = habit(
            {
                owner: msg.sender,
                start_time: start_time_,
                end_time: start_time_ + 5 days,
                pool: 0,
                num_users: 0,
                habit_type: habit_type_,
                is_deleted: false
            }
        );

        uint256 new_habit_id = num_habits++;
        habits[new_habit_id] = new_habit;
        emit CreateHabit(msg.sender, new_habit_id, start_time_, habit_type_);
    }

    /**
    * @dev User joins the challenge with a pledge
    * @param habit_id expects a valid habit id
    * 
    * Requirements:
    * - `habit_id` is a valid id
    * - `msg.sender` is not part of challenge already
    */
    function join_habit(uint256 habit_id) public payable is_valid_id(habit_id) is_not_deleted(habit_id) {
        require(msg.value > 0, "Pledge amount must be more than 0");
        require(habits[habit_id].users[msg.sender].addr == address(0), "User has already joined habit");
        user memory user_ = user(
            {
                addr: msg.sender,
                pledge_amt: msg.value,
                is_loser: false,
                check_list: [0, 0, 0, 0, 0] 
            }
        );
        habits[habit_id].pool += msg.value;
        habits[habit_id].users[msg.sender] = user_;
        // Added these two lines to keep track of all the addresses taking part in this habit
        habits[habit_id].user_addresses[habits[habit_id].num_users] = msg.sender;
        habits[habit_id].num_users++;
        emit JoinHabit(msg.sender, habit_id, msg.value);
    }

    /**
    * @dev A more abstract verification function. Front end tells us who finished what habit and what day of the check_list they are on to tick.
    * @param habit_id expects a valid habit id
    * @param user_addr expects a valid user address
    * @param date_num expects the index to tick the check_list for the user. DATE NUM IS 0 INDEXED
    * 
    */
    function tick_user_list(uint256 habit_id, address user_addr, uint date_num) public is_valid_id(habit_id) is_not_deleted(habit_id) {
        user storage curr_user = habits[habit_id].users[user_addr];

        curr_user.check_list[date_num] = 1;
        emit TickUserList(habit_id, user_addr, date_num);
    }

    /**
    * @dev Ends the challenge and distributes the reward
    * @param habit_id expects a valid habit id
    * 
    * Requirements:
    * - `habit_id` is a valid id
    * - `msg.sender` is owner of this contract
    * - habit has expired
    * @return 0: no winner (pool moved to main_pool), 1: at least 1 winner
    */
    function end_habit(uint256 habit_id) public is_valid_id(habit_id) is_not_deleted(habit_id) only_owner(msg.sender) returns (uint) {
        require(block.timestamp > habits[habit_id].end_time, "Can only end this habit after end time");
        // setup arr of winners and keep track of the number of winners
        address[] memory winners = new address[](habits[habit_id].num_users);
        uint256 num_winners = 0;
        // loser pool is initialized as total pool
        uint256 loser_pool = habits[habit_id].pool;
        // iterate through ea user in the habit
        for (uint i = 0; i < habits[habit_id].num_users; i ++) {
            address working_user_addr = habits[habit_id].user_addresses[i];
            user storage curr_user = habits[habit_id].users[working_user_addr];
            verify(habit_id, working_user_addr);
            // if user is a winner, remove his pledge from the losers_pool
            // wtv remains is the pool of losers pledges
            if (!curr_user.is_loser) {
                winners[num_winners] = working_user_addr;
                loser_pool -= curr_user.pledge_amt;
                num_winners++;
            }
        }
        uint256 winner_pool = habits[habit_id].pool - loser_pool;
        habits[habit_id].is_deleted = true;
        // if there are no winners, transfer to main_pool. 0 case
        if (num_winners == 0) {
            main_pool += loser_pool;
            emit AllLose(habit_id, main_pool);
            return 0;
        }
        for (uint j = 0; j < num_winners; j++) {
            address payable recipient = address(uint160(winners[j]));
            uint to_receive = habits[habit_id].users[winners[j]].pledge_amt;
            to_receive = to_receive + (to_receive/winner_pool) * loser_pool;
            recipient.transfer(to_receive);
            emit EndHabit(recipient, habit_id, to_receive);
        }

        return 1;
    }

    /* Contract owner can withdraw money in the case where everyone loses in the challenge
    */
    function withdraw(uint256 amt) public only_owner(msg.sender) {
        require(amt <= main_pool, "Amount is too big to withdraw.");
        address payable payable_owner = address(uint160(con_owner));
        payable_owner.transfer(amt);
        main_pool -= amt;
    }

    /* Setters for Habit properties */
    /**
    * @dev A more abstract verification function. To be used at end_habit. It will check each user's checklist
    * @param habit_id expects a valid habit id
    * @param user_addr expects a valid user address
    * 
    * @return bool where true if user is still a winner. else return false to say hes a loser.
    */
    function verify(uint256 habit_id, address user_addr) private is_valid_id(habit_id) is_not_deleted(habit_id) returns (bool) {
        user storage curr_user = habits[habit_id].users[user_addr];
        // if any of these days have not been filled, user becomes a loser.
        for (uint i=0; i<curr_user.check_list.length; i++) {
            if (curr_user.check_list[i] == 0) {
                curr_user.is_loser = true;
                // break;
                return false;
            }
        }
        return true;
    }

    /* Getters for Habit properties */

    function get_start_time(uint256 habit_id) public view is_valid_id(habit_id) returns (uint) {
        return habits[habit_id].start_time;
    }

    function get_end_time(uint256 habit_id) public view is_valid_id(habit_id) returns (uint) {
        return habits[habit_id].end_time;
    }

    function get_habit_type(uint256 habit_id) public view is_valid_id(habit_id) returns (uint) {
        return habits[habit_id].habit_type;
    }

    function get_owner(uint256 habit_id) public view is_valid_id(habit_id) returns (address) {
        return habits[habit_id].owner;
    }

    function get_pool(uint256 habit_id) public view is_valid_id(habit_id) returns (uint256) {
        return habits[habit_id].pool;
    }

    function get_num_users(uint256 habit_id) public view is_valid_id(habit_id) returns (uint256) {
        return habits[habit_id].num_users;
    }

    /* Getters for main contract fields */

    function get_num_habits() public view returns (uint256) {
        return num_habits;
    }

    function get_con_owner() public view returns (address) {
        return con_owner;
    }

    function get_main_pool() public view returns (uint256) {
        return main_pool;
    }

    /* Helpers for unit tests */

    function is_user_joined_habit(uint256 habit_id, address user_) public view is_valid_id(habit_id) returns (bool) {
        return habits[habit_id].users[user_].addr != address(0);
    }


    function is_user_a_loser(uint256 habit_id, address user_) public view is_valid_id(habit_id) returns (bool) {
        return habits[habit_id].users[user_].is_loser;
    }

    function get_user_check_list(uint256 habit_id, address user_) public view is_valid_id(habit_id) returns (uint8[5] memory) {
        return habits[habit_id].users[user_].check_list;
    }

    function is_habit_deleted(uint256 habit_id) public view is_valid_id(habit_id) returns (bool) {
        return habits[habit_id].is_deleted;
    }

}