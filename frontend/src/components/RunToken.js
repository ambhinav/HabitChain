import { Button, CircularProgress, Card } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getWeb3 from "../ethereum/getWeb3";
import Habit from "../contracts/Habit.json";

const RunToken = () => {
  const habitId = useParams().habitId;
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    connect();
  }, []);

  const connect = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);

      const networkId = await web3.eth.net.getId();
      const networkData = Habit.networks[networkId];
      const habit = new web3.eth.Contract(Habit.abi, networkData.address);
      setContract(habit);
      console.log(habit);
    } catch (error) {
      console.log(error);
    }
  };

  const verifyCaptcha = async (habit, accounts) => {
    try {
      const startTime = await habit.methods.get_start_time(habitId).call();
      const currTime = Math.floor(Date.now() / 1000);
      const dayDiff = Math.floor(Math.abs(currTime - startTime) / 60 / 60 / 24);
      const response = await habit.methods
        .verify(habitId, accounts[0], dayDiff)
        .send({ from: accounts[0] });

      console.log(response);
    } catch (error) {
      alert(error);
    }
  };

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
            <Button
              variant="contained"
              onClick={() => verifyCaptcha(contract, accounts)}
            >
              Run Complete!
            </Button>
          </Card>
        </div>
      ) : (
        <CircularProgress />
      )}
    </div>
  );
};

export default RunToken;
