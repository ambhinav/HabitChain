# HabitChain

## Testing
## Versions
1. node: 14.8.0
2. npm: 6.14.15 (although 6.14.7 has some workarounds)
3. truffle: 5.4.29
4. solidity 0.5.16
5. web3.js: 1.5.3

### Server
1. Open Ganache and Quickstart
2. `node index.js`: starts express.js server
3. `npm run deploy:local` => runs `truffle migrate` and copies build files over to `frontend/src`
    - if have error, run each line on your own and it should work

### Client
1. cd `frontend`
2. `yarn start`: starts react server

### Metamask
1. Install Metamask extension in Browser
2. Refer to [this](https://trufflesuite.com/docs/truffle/getting-started/truffle-with-metamask.html#using-metamask-with-ganache) guide.
3. Open Ganache and import one of the Accounts into Metamask, refer to [this](https://coinsbench.com/connect-to-metamask-from-new-or-existing-web-application-with-truffle-and-ganache-f48aa763c0ac) guide.
