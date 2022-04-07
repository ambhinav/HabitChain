import { Typography } from '@mui/material';
import React from 'react';
import moment from 'moment';
import getWeb3 from '../ethereum/getWeb3';
import Habit from '../contracts/Habit.json';

const CreateHabit = () => {
  React.useEffect(() => runExample(), []);

  const runExample = async () => {
    // const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    // await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    // const response = await contract.methods.get().call();

    // Update state with the result.
    // this.setState({ storageValue: response });
    // setStorageValue(response);
    console.log("running example...");
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      // create instanace of contract
      const networkId = await web3.eth.net.getId();
      const networkData = Habit.networks[networkId];
      const habit = new web3.eth.Contract(Habit.abi, networkData.address);
      console.log("Habit contract initialised", habit);
      // create habit id 0 with start time a day from now
      const startTime = Math.floor(moment().add(1, 'day').valueOf() / 1e3);
      await habit.methods.create_habit(startTime, 0).send({from: accounts[0]});
      const numHabits = await habit.methods.get_num_habits().call()
      alert(`Challenge ${numHabits} created -> id is ${numHabits - 1}`);
    } catch (err) {
      console.log(err);
      alert('Failed to run example');
    }
  };

  return (
      <Typography>Creating Habit...</Typography>
  );
}

export default CreateHabit;