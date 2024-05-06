const fs = require('fs')
const readline = require('readline');

const inputFilePath = `${__dirname}/../data/input/qgames.txt`;
const outputFilePath = `${__dirname}/../data/output/games.json`;

const WORLD_ID = 1022
const games = [];
let currentGameId = 0;

async function processLogFile(filePath) {
  console.log('Log parsing Initialized...')
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    output: process.stdout,
    terminal: false
  });

  for await (const line of rl) {
    parseLine(line)
  }
  
  try {
    fs.writeFileSync(outputFilePath, JSON.stringify(games, null, 2), 'utf8');
    console.log(`Log data parsed and saved to '${outputFilePath}'`);
  } catch (error) {
    console.log('An error has occurred while saving parsed log data ', error);
  }
}

const parseLine = (line) => {
  const event = line.match(/^.{0,7}([a-z A-Z][^:]*)/)[1] || null

  switch (event) {
    case 'InitGame':
      createGame(line)
      break;
    
    case 'ClientConnect':
      addPlayer(line)
      break;

    case 'ClientUserinfoChanged':
      updatePlayer(line)
      break;
    
    case 'Kill':
      addKill(line);
      break;

    default:
      // console.log('line ignored for event: ', event)
      break;
  }
}

// Create a new game and push it to Games array
const createGame = (line) => {
  currentGameId++;

  const game = {
    id: currentGameId,
    players: [],
    killEvents: [],
  }

  const splitGame = line.split('\\')

  for (let i = 1; i < splitGame.length; i += 2) {
    const key = splitGame[i].trim();
    const value = splitGame[i + 1];
    game[key] = value;
  }

  games.push (game)
}

// Add a Player to the current game
const addPlayer = (line) => {
  const playerId = Number(line.split(':')[2].trim())
  const game = getCurrentGame();

  if (!game){
    console.log('Failed to add player, Game not found')
    return
  }

  if (game.players.length === 0 || !game.players.find(player => player.id === playerId)) {
    game.players.push ({
      id: playerId
    })
  }
}

// Updates a previously added player with the player info
const updatePlayer = (line) => {

  const regex = /^(\d*:\d*) (\w+): (\d+) (.*)$/;
  const matches = line.trim().match(regex);

  if (!matches) {
    console.log('error updating user information for line: ')
    console.log(line)
    return
  }
  const playerId = parseInt(matches[3]);
  const playerDataString = matches[4];
  const playerDataSplit = playerDataString.split('\\');
  
  const player = {
    id: parseInt(playerId)
  }
    
  for (let i = 0; i < playerDataSplit.length; i += 2) {
    const key = playerDataSplit[i].trim();
    const value = playerDataSplit[i + 1];
    player[key] = value;
  }

  updatePlayerInformation(playerId, player);
}

// add a kill event to the current game
const addKill = (line) => {

  const game = getCurrentGame();

  const regex = /^(\d*:\d*) (\w+): (\d*) (\d*) (\d*): (.*)$/;
  const matches = line.trim().match(regex);

  if (!matches) {
    console.log('error updating user information for line: ')
    console.log(line)
    return
  }
  
  const killerId = parseInt(matches[3]);
  const killer = getPlayerName(killerId, game.players)

  const killedId = parseInt(matches[4]);
  const killed = getPlayerName(killedId, game.players)

  const methodId = parseInt(matches[5]);
  const killStringSplit = matches[6].split(' ')
  const method = killStringSplit[killStringSplit.length-1]

  game.killEvents.push ({
    killerId,
    killer,
    killedId,
    killed,
    method,
    methodId,
  })

  updateGame(game)
}

// UTILS

// returns the current running game
const getCurrentGame = () => 
  games.find(game => game.id === currentGameId) || null

// Gets the player name, based on the playerId
const getPlayerName = (playerId, players) =>
  (playerId !== WORLD_ID) ?
    players.find(player => player.id === playerId).n : 
    /* otherwise */ '<world>'

// Update game object into games array
const updateGame = (game) => {
  const gameIndex = games.findIndex(game => game.id === currentGameId)
  games[gameIndex] = game
}

// Updates player information into game object, of games array
const updatePlayerInformation = (playerId, player) => {

  const game = getCurrentGame();
  
  const playerIndex = game.players.findIndex(player => player.id === playerId)
  if (playerIndex !== -1){
    game.players[playerIndex] = player
  }
  updateGame(game)
}


// Call the function
processLogFile(inputFilePath);