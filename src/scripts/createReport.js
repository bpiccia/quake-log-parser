const fs = require('fs')
const report = [];
const WORLD_ID = 1022
const outputFilePath = `${__dirname}/../data/output/report.json`;
const gamesFilePath = `${__dirname}/../data/output/games.json`;

const createReport = () => {
  console.log('Initializing report...')
  const games = require(gamesFilePath)

  for (const game of games) {
    const gameReport = getGameReportData(game)
    report.push (gameReport)
  }

  console.log("Games:");
  console.log(require('util').inspect(report, { depth: null }));

  try {
    fs.writeFileSync(outputFilePath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`Report created and saved to '${outputFilePath}'`);
  } catch (error) {
    console.log(`An error has occurred while saving the report to '${outputFilePath}' `, error);
  }
}

const getGameReportData = (game) => {

  const total_kills = game.killEvents.length || 0;

  const players = game.players.map(player => player.n);

  const kills = getKillsReport(game.killEvents, players)

  const ranking = getPlayerRanking(kills)

  const kills_by_means = getKillsByMeansReport(game.killEvents)

  return {
    id: game.id,
    total_kills,
    players,
    kills,
    kills_by_means,
    ranking,
  }
}

const getKillsReport = (killEvents, players) => {
  const kills = {};
  // initialize
  players.forEach(playerName => {
    kills[playerName] = 0
  });

  killEvents.forEach((killEvent) => {
    const {killerId, killedId, killer, killed} = killEvent

    // killed by world should lose 1 point
    if(killerId === WORLD_ID){
      kills[killed] -= 1
    }
    // [extra] Suicide shouldn't add a kill score (my understanding)
    else if (killerId !== killedId){
      kills[killer] += 1
    }
  })
  return kills
}

const getKillsByMeansReport = (killEvents) => {
  const kills_by_means = {};

  killEvents.forEach((killEvent) => {
    const {method} = killEvent
    if (!kills_by_means[method]){
      kills_by_means[method] = 0
    }
    kills_by_means[method] += 1
  })

  return kills_by_means
}

const getPlayerRanking = (kills) => {
  const sortable = []
  const ranking = []

  for (const player in kills) {
    sortable.push([player, kills[player]])
  }
  sortable.sort((a,b) => b[1] - a[1])

  for (let i=0; i<sortable.length; i++){
    ranking.push ({
      position: `#${i+1}`,
      player: sortable[i][0],
      score: sortable[i][1],
    })
  }

  return ranking
}

createReport();