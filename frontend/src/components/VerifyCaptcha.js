import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import SliderCaptcha from "@slider-captcha/react";
import { useNavigate, useParams } from "react-router-dom";
import getWeb3 from "../ethereum/getWeb3";
import Habit from "../contracts/Habit.json";

const VerifyCaptcha = () => {
  const habitId = useParams().habitId;
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const history = useNavigate();

  function verifiedCallback(token) {
    console.log("Captcha token: " + token);
    history(`/confirmHabit0/${habitId}/${token}`)
  }

  return (
    <div>
      <Card sx={{ padding: 10, margin: 10, textAlign: "center" }}>
        <SliderCaptcha
          create="http://localhost:3000/riseAndShine/captcha/create"
          verify="http://localhost:3000/riseAndShine/captcha/verify"
          callback={verifiedCallback}
          text={{
            anchor: "I am human",
            challenge: "Slide to finish the puzzle",
          }}
        />
      </Card>
    </div>
  );
};

export default VerifyCaptcha;
