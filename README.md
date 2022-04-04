# HabitChain

## Testing
### Client
1. cd `frontend`
2. `yarn start`: starts react server

### Server
1. Open Ganache and Quickstart
2. `node index.js`: starts express.js server
3. `npm deploy:local` => runs `truffle migrate` and copies build files over to `frontend/src`

### Metamask
1. Install Metamask extension in Browser
2. Refer to [this](https://trufflesuite.com/docs/truffle/getting-started/truffle-with-metamask.html#using-metamask-with-ganache) guide.
3. Open Ganache and import one of the Accounts into Metamask, refer to [this](https://coinsbench.com/connect-to-metamask-from-new-or-existing-web-application-with-truffle-and-ganache-f48aa763c0ac) guide.
