<h1 style="text-align:center;">Discord.js v14 movies bot</h1>

## Features

* 🟦 Typescript
* 🔥 SlashCommands
* ✉️ Message commands
* 🕛 Cooldowns
* 🏴 Detailed Permissions
* 💪 Event & Command handlers
* 🍃 MongoDB

## Installation, Build and Run
1) Clone the repository then create a file named `.env` and fill it out accordingly
```js
TOKEN=YOURTOKENHERE
CLIENT_ID=BOTS CLIENT ID
PREFIX=!
MONGO_URI=YOUR MONGO CONNECTION STRING
MONGO_DATABASE_NAME=YOUR DATABASE NAME
TMDB_API_KEY =YOUR TMDB API KEY
```
2) Install typescript, To install TypeScript, you can run the following command in your terminal, This will install the latest version of TypeScript globally on your computer. (You can skip this if you already have typescript installed)
  ```ts
  npm install -g typescript
  ```
3) Build the project by running the following command:

`This command will also install the node modules if you haven't installed them.`
```js
npm run build
```

4) Once the build is complete it will generated a folder named `build` that contains compiled version of your ts code to js. You can run the following command in your terminal to run the project:
```js
npm start
```
