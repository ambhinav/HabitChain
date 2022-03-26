import { Card, CardContent, Button } from "@mui/material";
import React from "react";

const CLIENT_ID = process.env.REACT_APP_STRAVA_CLIENT_ID;
const REDIRECT_URI = window.origin;

const ConnectStrava = () => {
  const handleAuthorization = () => {
    const { origin } = window;
    window.location.assign(
      `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}/token&response_type=code&scope=activity:read_all`
    );
  };

  return (
    <div>
      <Card
        sx={{ minWidth: 500, padding: 10, margin: 10, textAlign: "center" }}
      >
        <CardContent>
          <Button variant="contained" onClick={handleAuthorization}>
            Connect Strava
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectStrava;
