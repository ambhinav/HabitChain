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
import React, { useState, useEffect } from "react";
import moment from "moment";
import getWeb3 from "../ethereum/getWeb3";
import Habit from "../contracts/Habit.json";
import { useNavigate } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';

const JoinHabitDialog = ({openDialog, setOpenDialog, contract, habitId, account}) => {
  const [formData, setFormData] = useState({ value: 0 });
  console.log(habitId);

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleJoinHabit = async (e) => {
    e.preventDefault();
    console.log(habitId);
    if(formData.value <= 0) {
      alert("Amount must be more than zero!");
      setFormData({value: 0})
    } else {
      console.log(account);
      console.log(contract);
      try {
        await contract.methods.join_habit(habitId).send({from: account, value: (formData.value)*1e18});
        setFormData({value: 0})
        alert("Successfully joined habit")
      } catch(error) {
        console.log(error);
      }
    }
  };

  return (
    <Dialog justifycontent="center" fullWidth open={openDialog}>
      <DialogTitle >Enter a Pledge Amount (ETH)</DialogTitle>
      <DialogContent >
        <form autoComplete="off" noValidate onSubmit={handleJoinHabit}>
          <div>
            <TextField
              value={formData.value}
              variant="outlined"
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
            />
          </div>
          <br/>
          <Button variant="contained" type="submit">
            Confirm
          </Button>
          <IconButton sx={{position: "absolute", right: "0", top: "0"}} onClick={handleClose}>
            <CloseIcon/>
          </IconButton>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const JoinHabit = () => {
  const [allHabits, setAllHabits] = useState([]);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const history = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [habitId, setHabitId] = useState(null);


  useEffect(() => {
    getAllHabits();
  }, []);

  const getAllHabits = async () => {
    console.log("running example...");
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
      if (isUserJoined) {
        continue;
      }
        const currStartTime = await habit.methods.get_start_time(i).call();
        const currEndTime = await habit.methods.get_end_time(i).call();
        const currHabitType = await habit.methods.get_habit_type(i).call();
        const currOwner = await habit.methods.get_owner(i).call();
        const currPool = await habit.methods.get_pool(i).call();
        const currNumUsers = await habit.methods.get_num_users(i).call();

        const currHabit = {
          startTime: currStartTime,
          endTime: currEndTime,
          habitType: currHabitType,
          owner: currOwner,
          pool: currPool,
          numUsers: currNumUsers,
          habitId: i,
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

  const handleJoinHabit = (habitId) => {
    setOpenDialog(true);
    setHabitId(habitId);
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
                <div>
                  <Button variant="contained" onClick={() => handleJoinHabit(h.habitId)}>
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
            <br />

          </Grid>
        ))}
      </Grid>
      {openDialog ? <JoinHabitDialog openDialog={openDialog} setOpenDialog={setOpenDialog} habitId={habitId} contract={contract} account={accounts[0]}/> : null}

    </div>
  );
};

export default JoinHabit;
