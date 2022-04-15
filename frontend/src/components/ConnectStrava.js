import { Card, CardContent, Button, TextField } from "@mui/material";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

//const CLIENT_ID = process.env.REACT_APP_STRAVA_CLIENT_ID;
const REDIRECT_URI = window.origin;

const ConnectStrava = () => {
  const [formData, setFormData] = useState({ client_id: "" });
  const habitId = useParams().habitId;
  localStorage.setItem("habitId", habitId);

  const handleAuthorization = (e) => {
    e.preventDefault();
    if (formData.client_id == "") {
      alert("Strava Client ID cannot be empty");
    } else {
      window.location.assign(
        `https://www.strava.com/oauth/authorize?client_id=${formData.client_id}&redirect_uri=${REDIRECT_URI}/token&response_type=code&scope=activity:read_all`
      );
    }
  };

  return (
    <div>
      <Card
        sx={{ minWidth: 500, padding: 10, margin: 10, textAlign: "center" }}
      >
        <CardContent>
          <form autoComplete="off" noValidate onSubmit={handleAuthorization}>
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
            <Button variant="contained" type="submit">
              Connect Strava
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectStrava;
