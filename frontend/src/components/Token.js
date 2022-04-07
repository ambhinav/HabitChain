import React, { useEffect, useState } from "react";
import queryString from "query-string";
import { getStravaTokens } from "../api";
import {
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  CardHeader,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import getWeb3 from "../ethereum/getWeb3";
import Habit from "../contracts/Habit.json";

const stravaApi = require("strava-v3");


const Token = () => {


  const tokenUrl = window.location.href;
  const CODE = queryString.parseUrl(tokenUrl).query.code;
  const CLIENT_ID = process.env.REACT_APP_STRAVA_CLIENT_ID;
  const CLIENT_SECRET = process.env.REACT_APP_STRAVA_CLIENT_SECRET;
  const GRANT_TYPE = "authorization_code";
  const [tokenData, setTokenData] = useState(null);
  const history = useNavigate();
  const habitId = localStorage.getItem("habitId");
  console.log(habitId);
  const [formData, setFormData] = useState({
    client_id: "",
    client_secret: "",
  });
  const [activityArr, setActivityArr] = useState([]);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]); 

  const handleGetStravaTokens = async (e) => {
    if (formData.client_id != "" && formData.client_secret != "") {
      e.preventDefault();
      getStravaTokens(
        formData.client_id,
        formData.client_secret,
        CODE,
        GRANT_TYPE
      )
        .then((response) => {
          if (response) {
            setTokenData(response.data);
            handleGetStravaActivities(response.data.access_token);
          }
        })
        .catch((error) => {
          console.log(error);
          history(`/connectStrava/${habitId}`);
        });
    } else {
      alert("Ensure that all fields are not empty!");
    }
  };

  const handleGetStravaActivities = async (access_token) => {
    const strava = new stravaApi.client(access_token);

    var now = new Date();
    var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startOfDay = startOfDay / 1000;

    const data = await strava.athlete.listActivities({
      before: Date.now() / 1000,
      after: startOfDay,
      page: 1,
      per_page: 30,
    });
    //const data1 = await strava.athletes.stats({id: 67746634});
    const approved = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].distance >= 5000 && data[i].type == "Run") {
        approved.push(data[i]);
      }
    }
    setActivityArr(approved);
    console.log(approved);

  };

  // console.log(tokenData);
  // console.log(activityArr);

  const verifyActivity = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
      // create instanace of contract
      const networkId = await web3.eth.net.getId();
      const networkData = Habit.networks[networkId];
      const habit = new web3.eth.Contract(Habit.abi, networkData.address);
      setContract(habit);
      const startTime = await habit.methods.get_start_time(habitId).call();
      const currTime = Math.floor(Date.now() / 1000);
      const dayDiff = Math.abs(currTime - startTime) / 60 / 60 / 24;
      console.log(dayDiff);
      await habit.methods.verify(habitId, accounts[0], dayDiff).send({from: accounts[0]});
    } catch (error) {
      alert(error);
    }
  }

  return (
    <div>
      <Card
        sx={{ minWidth: 500, padding: 10, margin: 10, textAlign: "center" }}
      >
        <CardContent>
          <Typography variant="h5">
            Connected to Strava Successfully!
          </Typography>
          <br />
          <form autoComplete="off" noValidate onSubmit={handleGetStravaTokens}>
            <div>
              <TextField
                label="Strava Client ID"
                name="client_id"
                variant="outlined"
                value={formData.client_id}
                onChange={(e) =>
                  setFormData({ ...formData, client_id: e.target.value })
                }
              />
            </div>
            <br />
            <div>
              <TextField
                label="Strava Client Secret"
                name="client_secret"
                variant="outlined"
                value={formData.client_secret}
                onChange={(e) =>
                  setFormData({ ...formData, client_secret: e.target.value })
                }
              />
            </div>
            <br />
            <Button variant="contained" type="submit">
              Sync Activities
            </Button>
          </form>
        </CardContent>
      </Card>
      <br/>
      <Card sx={{ minWidth: 500, padding: 10, margin: 10, textAlign: "center" }}>
          {activityArr.length == 0 ? (<Typography>You have yet to clock a run of at least 5 kilometers today</Typography>) :
          (activityArr.map((a) => (
            <Grid key={a.id} item xs={12} sm={12} md={6} lg={9}>
              <Card>
                <CardHeader title={`${a.name}`}/>
                <CardContent>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Typography fontWeight={"bold"}>
                    Distance: &nbsp;
                  </Typography>
                  <Typography>
                    {a.distance} meters
                  </Typography>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Typography fontWeight={"bold"}>
                    Start Time: &nbsp;
                  </Typography>
                  <Typography>
                    {a.start_date} 
                  </Typography>
                </div>
                </CardContent>
              </Card>
              <br/>
            </Grid>
          )))
          }  

          {activityArr.length > 0 ? 
          <Button onClick={verifyActivity}>Upload Activity</Button> : null}   
      </Card>
    </div>

  );
};

export default Token;
