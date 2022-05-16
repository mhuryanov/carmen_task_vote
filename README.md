# Articles Dapp

## How to install?

Just install the node dependencies:

**If you use NPM**

    npm i

**If you use Yarn**

    yarn

## How to test?

You just need to run the following command:

**If you use NPM**

    npm run test

**If you use Yarn**

    yarn test

## How to launch?

Make sure you have MetaMask in your browser and also that you have selected localhost:7545 as your RPC provider.

Open a terminal and run the following command to launch a local blockchain node:

**If you use NPM**

    npm run devNode

**If you use Yarn**

    yarn devNode

Once it is running, **in another terminal** run this command to upload the contracts to that blockchain node:

**If you use NPM**

    npm run devMigration

**If you use Yarn**

    yarn devMigration

After the migration finishes, you can run the website server (you can in the same terminal, since the process ended).

**If you use NPM**

    npm run dev

**If you use Yarn**

    yarn dev

You can now go to your browser and open this URL: http://localhost:3001

Congratulations, you have launched the project! 🚀
