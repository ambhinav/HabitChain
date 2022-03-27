pragma solidity ^0.5.0;
import {BokkyPooBahsDateTimeLibrary} from "./datelib2.sol";

contract Habit {

    struct user {
        address addr;
        uint256 pledge_amt;
        bool is_loser;
        uint8[5] check_list;
    }

    // user addr -> User struct & attributes
    // Mapping users address -> user
    
    struct habit {
        mapping(address => user) users;
        address owner;
        uint start_time;
        uint end_time;
        uint256 pool;
    }

    uint256 public num_habits = 0;
    uint256 public main_pool = 0;
    mapping(uint256 => habit) public habits;

    event CreateHabit(address owner, uint256 habit_id, uint start_time);
    event JoinHabit(address joiner, uint256 habit_id, uint256 pledge_amt);

    modifier is_valid_id(uint256 habit_id) {
        require(habit_id < num_habits, "Invalid habit id");
        _;
    }

    /**
    * @dev Creates and starts the challenge
    * @param start_time_ expects Unix timestamp in seconds
    *
    * Requirements:
    *
    * - `start_time_` must be in the future
    */
    function create_habit(uint start_time_) public {
        require(block.timestamp < start_time_, "Start time must be in the future");
        habit memory new_habit = habit(
            {
                owner: msg.sender,
                start_time: start_time_,
                end_time: start_time_ + 5 days,
                pool: 0
            }
        );

        uint256 new_habit_id = num_habits++;
        habits[new_habit_id] = new_habit;
        emit CreateHabit(msg.sender, new_habit_id, start_time_);
    }

    /**
    * @dev User joins the challenge with a pledge
    * @param habit_id expects a valid habit id
    * 
    * Requirements:
    * - `habit_id` is a valid id
    * - `msg.sender` is not part of challenge already
    */
    function join_habit(uint256 habit_id) public payable is_valid_id(habit_id) {
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
        emit JoinHabit(msg.sender, habit_id, msg.value);
    }

    function verify(uint256 habit_id, address user_addr) returns (bool) {
        uint curr_time = block.timestamp;
        uint habit_start_time = habits[habit_id].start_time;

        uint day_num = BokkyPooBahsDateTimeLibrary.diffDays(habit_start_time, curr_time);
        if (day_num > 5) {
            return false;
        }
        user curr_user = habits[habit_id].users[user_addr];
        if (curr_user.is_loser) {
            return false;
        }

        for (uint i=0; i<day_num-1; i++) {
            if (curr_user.check_list[i] == 0) {
                curr_user.is_loser = true;
                return false;
            }
        }
        curr_user.check_list[day_num-1] = 1;
        return true;
    }

    modifier is_not_loser(uint256 habit_id, address user_addr) public is_valid_id(habit_id) {
        require(!habits[habit_id].users[user_addr].is_loser, "User has lost, no need to check on him.");
        _;
    }

    /**
    * @dev A more abstract verification function. Front end tells us who finished what habit.
    * @param habit_id expects a valid habit id
    * @param user_addr expects a valid user address
    * @param date_num expects the index to tick the check_list for the user
    * 
    * @return bool where true if user is still a winner. else return true to say hes a loser.
    * Requirements:
    * - `habit_id` is a valid id
    * - `msg.sender` is not part of challenge already
    */
    function v2(uint256 habit_id, address user_addr, uint date_num) public is_not_loser(habit_id, user_addr)  returns (bool) {

        // for the days up to day offset, see if the other days have been checked.
        // if any of these days have not been filled, 
        for (uint i=0; i<day_num-1; i++) {
            if (curr_user.check_list[i] == 0) {
                curr_user.is_loser = true;
                return false;
            }
        }
        curr_user.check_list[day_num-1] = 1;
        return true;
    }

    /*
    // users call this to verify their habit each day
    // will also be used to check if user
    function verify() {
        time_of_verification = block.timestamp 
        require(start date <= current date <= end date)
        user  = users[msg.sender]
        require(user.is_loser is False) // no point verifying a loser
        
    If verification timestamp within acceptable time:
            Index = offset of current date from start date
            For day up till end of current day:
                If any day is False:
                    Set user.is_loser to True
                Elif day is current day:
                    Set check_list[idx] to True
        Else
            Set user.is_loser to True
    }

    // owner can end the contract after the start date
    // find out who won & distribute the funds from the loser’s pool
    Void end_contract():
        require(msg.sender is owner)
        Loser_pool = 0    
        For idx in users mapping:
            Addr, User = users[idx]
            If user.is_loser:
                Loser_pool += user.pledge

        If there are losers:
        Winner_pool = total_pool - loser_pool
    For idx in users mapping:
            Addr, user = users[idx]
            If not user.is_loser:
                Winnings = user.pledge + (user.pledge/winner_pool) * loser_pool
                addr.transfer(winnings) // transfer user's winnings
    Else: // just trf pledge amount back to all users
        For idx in users.mapping:
            Addr, user = users[idx]
            addr.transfer(user.pledge)

    selfdestruct(owner) // destroy the contract & send
    */

    function get_start_time(uint256 habit_id) public view is_valid_id(habit_id) returns (uint) {
        return habits[habit_id].start_time;
    }

    /*
    function timestampToDate(uint timestamp) internal pure returns (uint year, uint month, uint day) {
        (year, month, day) = _daysToDate(timestamp / SECONDS_PER_DAY);
    }
    */

    function get_start_time2(uint256 habit_id) public view is_valid_id(habit_id) returns (uint year, uint month, uint day){
        /*
        memory (year, month, day) = BokkyPooBahsDateTimeLibrary.timestampToDate(habits[habit_id].start_time);
        return (year, month, day);
        */

        return BokkyPooBahsDateTimeLibrary.timestampToDate(habits[habit_id].start_time);
    }

    function get_end_time(uint256 habit_id) public view is_valid_id(habit_id) returns (uint) {
        return habits[habit_id].end_time;
    }

    function get_owner(uint256 habit_id) public view is_valid_id(habit_id) returns (address) {
        return habits[habit_id].owner;
    }

    function get_num_habits() public view returns (uint256) {
        return num_habits;
    }

    function get_pool(uint256 habit_id) public view is_valid_id(habit_id) returns (uint256) {
        return habits[habit_id].pool;
    }

    /// Checks if user joined a habit
    function is_user_joined_habit(uint256 habit_id, address user_) public view is_valid_id(habit_id) returns (bool) {
        return habits[habit_id].users[user_].addr != address(0);
    }

}
