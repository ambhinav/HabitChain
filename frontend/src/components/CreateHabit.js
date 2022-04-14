import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Select,
  TextField,
  Typography,
  MenuItem,
  Button,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import moment from "moment";
import getWeb3 from "../ethereum/getWeb3";
import Habit from "../contracts/Habit.json";
import { DatePicker } from "@mui/x-date-pickers";

const CreateHabit = () => {
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ startTime: null, habitType: 0, value: 0 });
  useEffect(() => loadContract(), []);

  const loadContract = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
      // create instanace of contract
      const networkId = await web3.eth.net.getId();
      const networkData = Habit.networks[networkId];
      const habit = new web3.eth.Contract(Habit.abi, networkData.address);
      setContract(habit);
      // console.log("Habit contract initialised", habit);
      // const startTime = Math.floor(moment().add(1, 'day').valueOf() / 1e3);
      // await habit.methods.create_habit(startTime, 0).send({from: accounts[0]});
      // const numHabits = await habit.methods.get_num_habits().call()
      // alert(`Challenge ${numHabits} created -> id is ${numHabits - 1}`);
    } catch (err) {
      console.log(err);
      alert("Failed to run example");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.value <= 0) {
      alert("Must pledge amount > 0!");
    }
    if (form.startTime == null || form.startTime < Date.now()) {
      alert("Please select a date in the future");
    } else {
      try {
        await contract.methods
          .create_habit(form.startTime.unix(), form.habitType)
          .send({ from: accounts[0], value: form.value * 1e18 });
        alert("Successfully created a new habit");
      } catch (error) {
        alert(error);
      }
    }
  };

  if (form.startTime) {
    console.log(form.startTime.unix());
  }

  return (
    <div>
      {contract ? (
        <div>
          <Card
            sx={{
              minWidth: 500,
              minHeight: 200,
              padding: 10,
              margin: 10,
              textAlign: "center",
            }}
          >
            <CardHeader title={`Create a New Habit`} />
            <form onSubmit={handleSubmit}>
              <div>
                <DatePicker
                  label="Select a Start Date"
                  value={form.startTime}
                  onChange={(date) => setForm({ ...form, startTime: date })}
                  renderInput={(params) => <TextField {...params} />}
                />

                <br />
                <Select
                  sx={{ minWidth: 260, marginTop: "10px" }}
                  value={form.habitType}
                  label="Habit Category"
                  onChange={(e) =>
                    setForm({ ...form, habitType: e.target.value })
                  }
                >
                  <MenuItem value={0}>Rise and Shine Habit</MenuItem>
                  <MenuItem value={1}>Keep Active and Run Habit</MenuItem>
                </Select>

                <br />
                <TextField
                  sx={{ minWidth: 260, marginTop: "10px", marginBottom: "10px" }}
                  value={form.value}
                  label="Enter a Pledge Amount (ETH)"
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                ></TextField>
              </div>
              <Button variant="contained" type="submit">
                Submit
              </Button>
            </form>
          </Card>
        </div>
      ) : (
        <CircularProgress />
      )}
    </div>
  );
};

export default CreateHabit;
