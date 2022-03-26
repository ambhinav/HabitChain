import React, { useState } from "react";
import queryString from "query-string";
import { getStravaTokens } from "../api";
import { Button, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
const stravaApi = require("strava-v3");

const Token = () => {
  const tokenUrl = window.location.href;
  const CODE = queryString.parseUrl(tokenUrl).query.code;
  const CLIENT_ID = process.env.REACT_APP_STRAVA_CLIENT_ID;
  const CLIENT_SECRET = process.env.REACT_APP_STRAVA_CLIENT_SECRET;
  const GRANT_TYPE = "authorization_code";
  const [tokenData, setTokenData] = useState(null);
  const history = useNavigate();

  const handleGetStravaTokens = async () => {
    getStravaTokens(CLIENT_ID, CLIENT_SECRET, CODE, GRANT_TYPE)
      .then((response) => {
        if (response) {
          setTokenData(response.data);
          handleGetStravaActivities(response.data.access_token);
        }
      })
      .catch((error) => {
        console.log(error);
        history("/connectTracker");
      });
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
      if (data[i].distance >= 5000) {
        approved.push(data[i]);
      }
    }
    console.log(data);
    console.log(approved);
  };

  console.log(tokenData);

  return (
    <div>
      <Card
        sx={{ minWidth: 500, padding: 10, margin: 10, textAlign: "center" }}
      >
        <CardContent>
          Token Received
          <br />
          <Button variant="contained" onClick={handleGetStravaTokens}>
            Post tokens
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Token;
