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
    mapping(address => user) users;
    // address[] user_addresses; // maybe this
    address owner;
    // all times in timestamp as solidity uses unix timestamp
    uint start_time;
    uint end_time;
    uint256 pool;


    // Create the challenge and set a date range
    // client side will convert date/time to block.timestamp offset
    constructor(uint start_time_) public payable {
        owner = msg.sender;
        start_time = start_time_;
        end_time = start_time + 5 days;
        // owner joins & starts challenge
        join();
    }

    // user joins the habit with an amount to pledge
    // set the check_list size to be the date_range
    function join() public payable {
        require(users[msg.sender].addr == address(0), "User already exists");
        user memory user_ = user(msg.sender, msg.value, false, [0, 0, 0, 0, 0]); // create user
        pool += msg.value; // increase pool
        users[msg.sender] = user_; // add to user mapping
    }

    // curr day is the day in offset [0,..5]
    function verify_user(address user_addr, uint8 verify_value, uint curr_day) public {
        // if called by user, change 'user' to 'msg.sender'
        require(users[user_addr].addr != address(0), "User not in challenge");
        
        if (verify_value == 0) {
            users[user_addr].is_loser = true;
        } else {
            for (uint dayNum = 0; dayNum <= curr_day; dayNum++) {
                // if any day has failed, user is loser and break
                if (users[user_addr].check_list[dayNum] == 0) {
                    users[user_addr].is_loser = true;
                    break;
                }
            }
            // else fill up the val
            users[user_addr].check_list[curr_day] = verify_value;
        }
    }

    /*
    // users call this to verify their habit each day
    // will also be used to check if user
    function verify() {
        //  user needs to be in challenge before verifying
        require(users[msg.sender].addr != address(0), "User not in challenge")
        // get time of the current block, refreshes every 10 seconds.
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
}

