import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React from "react";
import SliderCaptcha from "@slider-captcha/react";
import {useParams} from "react-router-dom";
import getWeb3 from "../ethereum/getWeb3";

const VerifyCaptcha = () => {
  const [open, setOpen] = React.useState(false);
  const [token, setToken] = React.useState(null);
  const habitId = useParams().habitId;
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]); 

  function verifiedCallback(token) {
    console.log("Captcha token: " + token);
    if(token) {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        const networkId = await web3.eth.net.getId();
        const networkData = Habit.networks[networkId];
        const habit = new web3.eth.Contract(Habit.abi, network.address);
        setContract(habit);
        const curr = new Date();
        if(curr.getHours > 8) { //late
          alert("You woke up late today");
        } else {
          await habit.methods.verify(habitId, accounts[0], dayDiff).send({from: accounts[0]});
        }
      } catch(error) {
        alert(error);
      }
    }
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
        {/* <Button variant="outlined" onClick={handleClickOpen}>
          Verify Captcha
        </Button>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" onClose={handleClose}>
            {"Good morning!"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Verify captcha to confirm that you are awake.
            </DialogContentText>
            
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} autoFocus>
              Done
            </Button>
          </DialogActions>
        </Dialog> */}
      </Card>
    </div>
  );
};

export default VerifyCaptcha;
