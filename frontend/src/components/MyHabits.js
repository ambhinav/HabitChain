import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Alert,
} from "@mui/material";
import moment from "moment";
import getWeb3 from "../ethereum/getWeb3";
import Habit from "../contracts/Habit.json";
import { useNavigate } from "react-router-dom";

const MyHabits = () => {
  const [allHabits, setAllHabits] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const history = useNavigate();

  useEffect(() => {
    getMyHabits();
  }, []);

  const todayDate = moment(new Date()).format("DD/MM/YYYY");
  console.log(todayDate);

  const getMyHabits = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
      // create instanace of contract
      const networkId = await web3.eth.net.getId();
      const networkData = Habit.networks[networkId];
      const habit = new web3.eth.Contract(Habit.abi, networkData.address);
      setContract(habit);
      console.log("Habit contract initialised", habit);
      // create habit id 0 with start time a day from now
      const habitSize = await habit.methods.get_num_habits().call();
      console.log(habitSize);
      var habitArr = [];
      for (let i = 0; i < habitSize; i++) {
        const isUserJoined = await habit.methods
          .is_user_joined_habit(i, accounts[0])
          .call();
        if (!isUserJoined) {
          continue;
        }
        const currStartTime = await habit.methods.get_start_time(i).call();
        const currEndTime = await habit.methods.get_end_time(i).call();
        const currHabitType = await habit.methods.get_habit_type(i).call();
        const currOwner = await habit.methods.get_owner(i).call();
        const currPool = await habit.methods.get_pool(i).call();
        const currNumUsers = await habit.methods.get_num_users(i).call();
        const isLoser = await habit.methods
          .is_user_a_loser(i, accounts[0])
          .call();
        const checkList = await habit.methods
          .get_user_check_list(i, accounts[0])
          .call();
        var verificationState;

        const currTime = Math.floor(Date.now() / 1000);
        if (currTime >= currStartTime) {
          const dayDiff = Math.floor(Math.abs(currTime - currStartTime) / 60 / 60 / 24);
          console.log(dayDiff);
          const arrTime = checkList;
          if (arrTime[dayDiff] == 1) {
            //already verified
            verificationState = "VERIFIED";
          } else {
            verificationState = "VERIFY";
          }
        } else {
          verificationState = "CHALLENGE HAS NOT STARTED";
        }

        const currHabit = {
          startTime: currStartTime,
          endTime: currEndTime,
          habitType: currHabitType,
          owner: currOwner,
          pool: currPool,
          numUsers: currNumUsers,
          habitId: i,
          isLoser: isLoser,
          checkList: checkList,
          verificationState: verificationState,
        };
        habitArr.push(currHabit);
        console.log(allHabits);
      }
      console.log(habitArr);
      setAllHabits(habitArr);
    } catch (err) {
      console.log(err);
      alert("Failed to fetch habits");
    }
  };

  const verifyHabit = (verificationState, habitType, habitId) => {
    if (verificationState == "VERIFY") {
      if (habitType == 0) {
        history(`/riseAndShine/${habitId}`);
      } else {
        history(`/connectStrava/${habitId}`);
      }
    }
  };

  if (contract == null) {
    return (
      <div>
        <CircularProgress></CircularProgress>
      </div>
    );
  }

  return (
    <div>
      <Grid
        item
        container
        justifyContent="center"
        xs={12}
        style={{ margin: 20 }}
      >
        {allHabits.map((h) => (
          <Grid key={h.habitId} item xs={12} sm={12} md={6} lg={9}>
            <Card>
              <CardHeader title={`Habit ${h.habitId}`} />
              <CardContent>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Typography fontWeight={"bold"}>
                    Start Time: &nbsp;
                  </Typography>
                  <Typography>
                    {moment.unix(h.startTime).format("DD/MM/YYYY")}
                  </Typography>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Typography fontWeight={"bold"}>End Time: &nbsp;</Typography>
                  <Typography>
                    {moment.unix(h.endTime).format("DD/MM/YYYY")}
                  </Typography>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Typography fontWeight={"bold"}>
                    Habit Type: &nbsp;
                  </Typography>
                  {h.habitType == 0 ? (
                    <Typography color={"red"}>Rise and Shine</Typography>
                  ) : (
                    <Typography color={"blue"}>Run 5km</Typography>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Typography fontWeight={"bold"}>
                    Owner Address: &nbsp;
                  </Typography>
                  <Typography>{h.owner}</Typography>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Typography fontWeight={"bold"}>
                    Total Number of Participants: &nbsp;
                  </Typography>
                  <Typography>{h.numUsers}</Typography>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Typography fontWeight={"bold"}>
                    Total Pool Amount: &nbsp;
                  </Typography>
                  <Typography>{h.pool / 1e18}ETH</Typography>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Typography fontWeight={"bold"}>Status: &nbsp;</Typography>
                  {h.isLoser ? (
                    <Typography color="red">FAILED</Typography>
                  ) : (
                    <Typography color="#228B22">ONGOING</Typography>
                  )}
                </div>
                <br />
                <Button
                  variant="contained"
                  onClick={() =>
                    verifyHabit(h.verificationState, h.habitType, h.habitId)
                  }
                >
                  {h.verificationState}
                </Button>
              </CardContent>
            </Card>
            <br />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default MyHabits;
