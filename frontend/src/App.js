import React, { Component, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import getWeb3 from "./getWeb3";
import Home from "./components/Home";
import UploadActivity from "./components/UploadActivity";
import ConnectStrava from "./components/ConnectStrava";
import VerifyCaptcha from "./components/VerifyCaptcha";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Toolbar,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import Token from "./components/Token";

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

  // componentDidMount = async () => {
  //   try {
  //     // Get network provider and web3 instance.
  //     const web3 = await getWeb3();
  //     // Use web3 to get the user's accounts.
  //     const accounts = await web3.eth.getAccounts();
  //     // Get the contract instance.
  //     const networkId = await web3.eth.net.getId();
  //     const deployedNetwork = SimpleStorageContract.networks[networkId];
  //     const instance = new web3.eth.Contract(
  //       SimpleStorageContract.abi,
  //       deployedNetwork && deployedNetwork.address
  //     );
  //     // Set web3, accounts, and contract to the state, and then proceed with an
  //     // example of interacting with the contract's methods.
  //     this.setState({ web3, accounts, contract: instance }, this.runExample);
  //   } catch (error) {
  //     // Catch any errors for any of the above operations.
  //     alert(
  //       `Failed to load web3, accounts, or contract. Check console for details.`
  //     );
  //     console.error(error);
  //   }
  // };

  const runExample = async () => {
    // const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    // this.setState({ storageValue: response });
    setStorageValue(response);
  };

  // if (!web3) {
  //   return (
  //     <div>
  //       <AppBar position="static">
  //         <Toolbar>
  //           <Typography variant="h1">HabitChain</Typography>
  //         </Toolbar>
  //       </AppBar>
  //       <div className={classes.home}>
  //         <CircularProgress />
  //       </div>
  //     </div>
  //   );
  // } else {
  return (
    <div className="App">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              HabitChain
            </Typography>
            <Button color="inherit">Login</Button>
          </Toolbar>
        </AppBar>
        <BrowserRouter>
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/fitnessTracker" exact element={<UploadActivity />} />
            <Route path="/connectTracker" exact element={<ConnectStrava />} />
            <Route path="/token" exact element={<Token />} />
            <Route path="/riseAndShine" exact element={<VerifyCaptcha />} />
          </Routes>
        </BrowserRouter>
      </Box>
    </div>
  );
  //}
}

export default App;
