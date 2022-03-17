pragma solidity ^0.5.0;

contract Habit {

    struct user {
        address addr;
        uint pledge_amt;
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

    uint256 public numHabits = 0;
    mapping(uint256 => habit) public habits;

    // Checks if valid Id
    modifier isValidId(uint256 habitId) {
        require(habitId < numHabits, "Invalid habit id");
        _;
    }

    // Create the challenge and set a date range
    // client side will convert date/time to block.timestamp offset
    function createHabit(uint start_time_) public {

        habit memory newHabit = habit(
            {
                owner: msg.sender,
                start_time: start_time_,
                end_time: start_time_ + 5 days,
                pool: 0
            }
        );

        uint256 newHabitId = numHabits++;
        habits[newHabitId] = newHabit;
    }

    // user joins the habit with an amount to pledge
    // set the check_list size to be the date_range
    // function join() public payable {
    //     require(users[msg.sender].addr == address(0), "User already exists");
    //     user memory user_ = user(msg.sender, msg.value, false, [0, 0, 0, 0, 0]); // create user
    //     pool += msg.value; // increase pool
    //     users[msg.sender] = user_; // add to user mapping
    // }

    /*
    // users call this to verify their habit each day
    // will also be used to check if user
    function verify() {
        require(msg.sender in users)
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

    function getStartTime(uint256 habitId) public view isValidId(habitId) returns (uint) {
        return habits[habitId].start_time;
    }

    function getEndTime(uint256 habitId) public view isValidId(habitId) returns (uint) {
        return habits[habitId].end_time;
    }

    function getOwner(uint256 habitId) public view isValidId(habitId) returns (address) {
        return habits[habitId].owner;
    }

}

