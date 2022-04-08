import React, { Component, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./components/Home";
import ConnectStrava from "./components/ConnectStrava";
import VerifyCaptcha from "./components/VerifyCaptcha";
import JoinHabit from "./components/JoinHabit";
import CreateHabit from "./components/CreateHabit";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import Token from "./components/Token";
import MyHabits from "./components/MyHabits";
import HomeIcon from '@mui/icons-material/Home';

const useStyles = makeStyles(() => {
  return {
    home: {
      justifyContent: "center",
      display: "flex",
      padding: "300px 300px 300px 300px",
    },
  };
});

function App() {
  const classes = useStyles();
  // state = { storageValue: 0, web3: null, accounts: null, contract: null };
  const [storageValue, setStorageValue] = useState(0);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const history = useNavigate();

  const home = () => {
    history("/")
  }

  return (
    <div className="App">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              HabitChain
            </Typography>
            <IconButton onClick={home}>
                <HomeIcon/>
            </IconButton>
          </Toolbar>
        </AppBar>
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/connectStrava/:habitId" exact element={<ConnectStrava />} />
            <Route path="/token" exact element={<Token />} />
            <Route path="/riseAndShine/:habitId" exact element={<VerifyCaptcha />} />
            <Route path="/createHabit" exact element={<CreateHabit />} />
            <Route path="/joinHabit" exact element={<JoinHabit />} />
            <Route path="/myHabits" exact element={<MyHabits />} />
          </Routes>
      </Box>
    </div>
  );
  //}
}

export default App;
