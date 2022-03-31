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

const VerifyCaptcha = () => {
  const [open, setOpen] = React.useState(false);
  const [token, setToken] = React.useState(null);

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  // const handleClose = () => {
  //   setOpen(false);
  // };

  function verifiedCallback(token) {
    console.log("Captcha token: " + token);
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
