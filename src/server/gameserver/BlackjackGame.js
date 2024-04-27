const SuitToName = { 0: 'Diamond', 1: 'Club', 2: 'Heart', 3: 'Spade' };

const SHORT_WAIT = 500;
const ONE_SECOND = 1000;
const LONG_WAIT = 2000;
const BLACKJACK = 21;
const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

class Card {
  number = 0;
  hidden = false;
  constructor(number) {
    this.number = number;
  }
  get suit() {
    return SuitToName[Math.floor((this.number - 1) / 13)];
  }
  get rank() {
    return ((this.number - 1) % 13) + 1;
  }
  get score() {
    return (this.rank >= 11) ? 10 : this.rank;
  }

  get visibleScore() {
    if (this.hidden) {
      return 0;
    }
    return (this.rank >= 11) ? 10 : this.rank;
  }

  get name() {
    return `${this.getSuit()} ${this.getRank()}`
  }
  setHidden(hidden) {
    this.hidden = hidden;
  }
  toString() {
    if (this.hidden) {
      return -1;
    }
    return this.number;
  }

}
class Hand {
  cards = [];
  constructor() {

  }
  addCard(card) {
    this.cards.push(card);
  }
  addNumberOfDecks(numberOfDecks) {
    this.cards.push(...new Deck(numberOfDecks).cards);
  }
  shuffleCards() {
    shuffleArray(this.cards);
  }
  popCard() {
    return this.cards.pop();
  }
  toString() {
    return this.cards.map((card) => card.toString());
  }
  getSoftScore() {
    return this.cards.reduce((s, c) => s + c.score, 0);
  }

  hasAce() {
    return this.cards.some((c) => c.score === 1);
  }

  isBlackJack() {
    return this.getMaxScore() === BLACKJACK && this.cards.length === 2;
  }

  isSplittable() {
    return (this.cards.length === 2 && this.cards[0].rank === this.cards[1].rank)
  }

  getMaxScore() {
    const minScore = this.getSoftScore();
    return (minScore <= 11 && this.hasAce()) ? minScore + 10 : minScore;
  }

  getVisibleScore() {
    return this.cards.reduce((s, c) => s + c.visibleScore, 0);
  }
}

class Deck {
  cards = [];
  constructor(numberOfDecks) {
    this.addDecks(numberOfDecks)
  }
  fullDeck() {
    const arr = Array.from({ length: 52 }, (_, i) => i + 1);
    //const arr = [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
    const cards = [];
    arr.forEach((i) => cards.push(new Card(i)));
    return cards;
  }
  addDecks(numberOfDecks) {
    for (let i = 0; i < numberOfDecks; i++) {
      this.cards.push(...this.fullDeck());
    }
  }
}

async function shortSleep() {
  await sleep(SHORT_WAIT);
}

async function sleep(duration) {
  await new Promise(r => setTimeout(r, duration));
}

function ins(compare, values) {
  return values.some(v => v === compare);
}

function btw(compare, min, max) {
  return compare >= min && compare <= max;
}

export class BlackjackGame {


  constructor(rules) {
    this.maxSplit = rules?.maxSplit || 2;
    this.bet = rules?.bet || 10;
    this.initMoney = rules?.initMoney || 1000;
    this.numberOfDecks = rules?.numberOfDecks || 3;
  }

  sendToClients = (data, sendRoomFunc) => {

    const { currentRound } = data.privateData;
    const { publicData } = data;
    publicData.clientList = currentRound.players.map((player) => {
      const actionPending = currentRound.actionPending;
      const isCurrentPlayer = (player === currentRound.currentPointer && actionPending);
      const money = publicData.playerStat[player.id] ? publicData.playerStat[player.id].money : 0;
      return {
        id: player.id,
        bet: player.bet,
        win: player.win,
        name: player.name,
        hands: player.hands.map(hand => ({ hand: hand.hand.toString(), stand: hand.stand, win: hand.win })),
        wait: (isCurrentPlayer) ? currentRound.currentWait : 0,
        money,
        isCurrentPlayer
      }
    })
    publicData.house = currentRound.house.toString();
    publicData.houseWin = currentRound.houseWin;
    publicData.startedGame = data.privateData.startedGame;

    sendRoomFunc({ scope: 'ROOM', type: 'DATA', roomType: 'Blackjack', message: data.publicData })

  }


  startGame = async (data, sendRoomFunc) => {

    if (data.clients.length === 0) {
      data.privateData.startedGame = false;
      return;
    }

    data.privateData.startedGame = true;
    data.privateData.currentRound = {
      players: [],
      bucket: new Hand(),
      house: new Hand(),
      playerTurnEnds: false,
      actionPending: true,
      currentPointer: -1,
      currentWait: 0,
      roundEnded: false
    };
    const { currentRound } = data.privateData;



    currentRound.players = data.clients.map((client) => ({
      id: client.id,
      name: client.name,
      hands: [{ hand: new Hand(), stand: false, win: 0 }],
      originalBet: this.bet,
      bet: this.bet,
      win: 0,
      isAI: false
    }));

    const aiPlayers = 4 - currentRound.players.length;

    for (let i = 1; i <= aiPlayers; i++) {
      currentRound.players.push(
        {
          id: `AI-${i}`,
          name: `AI-${i}`,
          hands: [{ hand: new Hand(), stand: false, win: 0 }],
          originalBet: this.bet,
          bet: this.bet,
          win: 0,
          isAI: true
        }
      )
    }

    for (let i = 1; i <= aiPlayers; i++) {
      data.publicData.playerStat[currentRound.players[i].id].money -= this.bet;

    }


    data.clients.forEach((client) => {
      data.publicData.playerStat[client.id].money -= this.bet;
    })



    const { bucket, house } = currentRound;
    bucket.addNumberOfDecks(this.numberOfDecks);
    bucket.shuffleCards();


    // House get 1 hidden card
    house.addCard(bucket.popCard());

    this.sendToClients(data, sendRoomFunc);



    // All players get 1 card
    const { players } = currentRound;
    for (let player of players) {

      let index = 0;
      for (let h of player.hands) {
        h.hand.addCard(bucket.popCard())
        h.hand.addCard(bucket.popCard())

        if (h.hand.getMaxScore() === BLACKJACK) {
          player.hands[index].stand = true;
        }
        index++;
      }
      this.sendToClients(data, sendRoomFunc);
      await shortSleep();
    }

    await shortSleep();
    // House get 1 card
    house.addCard(bucket.popCard());
    house.cards[1].setHidden(true);
    this.sendToClients(data, sendRoomFunc);

    await shortSleep();
    const houseScore = house.getMaxScore();
    const isHouseBlackJack = house.isBlackJack();

    if (isHouseBlackJack) {
      currentRound.playerTurnEnds = true;
      this.sendToClients(data, sendRoomFunc);
    }


    // Player Turns
    let index = 0;
    if (!currentRound.playerTurnEnds) {
      do {

        currentRound.currentPointer = players[index];
        currentRound.currentWait = 10;
        currentRound.actionPending = true;

        const player = players[index];

        if (!player.hands.every((hand) => hand.stand === true)) {
          if (!player.isAI) {
            do {

              this.sendToClients(data, sendRoomFunc);
              await sleep(ONE_SECOND);

              currentRound.currentWait--;
            } while (currentRound.actionPending && currentRound.currentWait > 0)
          }
          else {
            do {


              await this.aiHandling(data, sendRoomFunc, house, player);




              //await sleep(ONE_SECOND);

              currentRound.currentWait--;
            } while (currentRound.actionPending && currentRound.currentWait > 0)
          }
        }

        index++;
      } while (index < players.length)
    }

    currentRound.currentPointer = -1;
    currentRound.playerTurnEnds = true;

    // Check if all players bust
    let playersMinScore = 1000;
    for (let player of players) {
      for (let h of player.hands) {
        let minScore = h.hand.getMaxScore();
        if (minScore < playersMinScore) {
          playersMinScore = minScore
        }
      }
    }

    if (playersMinScore > BLACKJACK) {
      currentRound.roundEnded = true;
      this.sendToClients(data, sendRoomFunc);
    }
    else {

      // House get more cards
      house.cards[1].setHidden(false);
      this.sendToClients(data, sendRoomFunc);


      currentRound.actionPending = true;
      let houseSoftScore = house.getSoftScore();
      let houseMaxScore = house.getMaxScore();


      if (houseSoftScore >= 18) {
        currentRound.actionPending = false;
      }
      if (houseMaxScore >= 17) {
        currentRound.actionPending = false;
      }
      while (currentRound.actionPending) {

        await shortSleep();
        house.addCard(bucket.popCard());
        this.sendToClients(data, sendRoomFunc);

        houseSoftScore = house.getSoftScore();
        houseMaxScore = house.getMaxScore();

        if (houseSoftScore >= 18) {
          currentRound.actionPending = false;
        }
        if (houseMaxScore >= 17) {
          currentRound.actionPending = false;
        }
      }

      // House Busted
      if (houseMaxScore > BLACKJACK) {
        houseMaxScore = 0;
      }




      for (let player of players) {
        player.handWin = [];
        for (let h of player.hands) {

          let playerScore = h.hand.getMaxScore();
          let isPlayerBlackjack = h.hand.isBlackJack();

          if (isHouseBlackJack) {
            if (isPlayerBlackjack) {
              player.win += player.originalBet;
              h.win = player.originalBet;

            }
            else {
              player.handWin.push(-player.originalBet)
            }
          }
          else if (isPlayerBlackjack) {
            player.win += player.originalBet * 2.5;
            h.win = player.originalBet * 2.5;

          }
          else if (playerScore > houseMaxScore && playerScore <= BLACKJACK) {
            player.win += player.originalBet * 2;
            h.win = player.originalBet * 2;

          }
          else if (playerScore === houseMaxScore && playerScore <= BLACKJACK) {
            player.win += player.originalBet;
            h.win = player.originalBet;

          }
          else {
            h.win = -player.originalBet;
          }
        }
      }

      for (let player of players) {
        if (data.publicData.playerStat[player.id]) {
          data.publicData.playerStat[player.id].money += player.win;
        }
      }

      currentRound.roundEnded = true;
      this.sendToClients(data, sendRoomFunc);
    }

    await sleep(LONG_WAIT);


    data.privateData.startedGame = false;
    this.sendToClients(data, sendRoomFunc);

    //data.currentRound.players

  }

  aiHandling = async (data, sendRoomFunc, house, player) => {
    let index = 0;
    const dScore = house.getVisibleScore();

    for (let h of player.hands) {

      let action = null;

      // Pair Strategy
      const isSplittable = player.hands.length < this.maxSplit;
      const isPair = (h.hand.cards.length === 2 && h.hand.cards[0].rank === h.hand.cards[1].rank);
      const aceStrategy = h.hand.hasAce() && h.hand.cards.length === 2;

      if (isPair) {
        const rank = h.hand.cards[0].rank;
        if (rank == 1 || rank == 8) {
          action = isSplittable ? 'SP' : null;
        }
        else if (ins(rank, [2, 3])) {
          if (dScore >= 4 && dScore <= 7) {
            action = isSplittable ? 'SP' : null;
          }
          else {
            action = 'H';
          }
        }
        else if (rank == 4) {
          action = 'H';
        }
        else if (rank == 5) {
          if (ins(dScore, [1, 10])) {
            action = 'H';
          }
          else {
            action = 'D';
          }
        }
        else if (ins(rank, [6, 7])) {
          if (btw(dScore, 2, 6)) {
            action = isSplittable ? 'SP' : null;
          }
          else {
            action = 'H'
          }
        }
        else if (rank == 9) {
          if (ins(dScore, [1, 7, 10])) {
            action = 'S'
          }
          else {
            action = isSplittable ? 'SP' : null;
          }
        }
        else {
          action = 'S'
        }
      }


      // Ace-X Strategy
      if (aceStrategy && !action) {
        const score = h.hand.getSoftScore()
        if (btw(score, 2, 7)) {
          if (btw(dScore, 4, 6)) {
            action = 'D'
          }
          else {
            action = 'H'
          }
        }
        else if (score == 8) {
          if (ins(dScore, [1, 2, 7, 8])) {
            action = 'S'
          }
          else if (ins(dScore, [9, 10])) {
            action = 'H'
          }
          else {
            action = 'D'
          }
        }
        else {
          action = 'S'
        }
      }

      if (!action) {
        const score = h.hand.getMaxScore();
        if (score <= 7) {
          action = 'H'
        }
        else if (score == 8) {
          if (ins(dScore, [5, 6])) {
            action = 'D'
          }
          else {
            action = 'H'
          }
        }
        else if (score == 9) {
          if (ins(dScore, [2, 3, 4, 5, 6])) {
            action = 'D'
          }
          else {
            action = 'H'
          }
        }
        else if (score == 10) {
          if (ins(dScore, [1, 10])) {
            action = 'H'
          }
          else {
            action = 'D'
          }
        }
        else if (score == 11) {
          action = 'D'
        }
        else if (score == 12) {
          if (ins(dScore, [4, 5, 6])) {
            action = 'S';
          }
          else {
            action = 'H';
          }
        }
        else if (ins(dScore, [13, 14, 15, 16])) {
          if (ins(dScore, [1, 7, 8, 9, 10])) {
            action = 'H'
          }
        }
      }

      if (!action) {
        action = 'S';
      }



      if (action == 'D' && (player.hands.length > 1 || h.hand.cards.length > 2)) {
        action = 'H'
      }

      switch (action) {
        case 'H': {
          await this.hitCard(data, sendRoomFunc, player.id, index);
          await shortSleep();

          break;
        }
        case 'D': {
          await this.double(data, sendRoomFunc, player.id);
          await shortSleep();

          break;
        }
        case 'S': {
          await this.stand(data, sendRoomFunc, player.id, index);
          break;
        }
        case 'SP': {
          await this.split(data, sendRoomFunc, player.id, index);
          break;
        }
      }
      index++;
    }
  }

  split = async (data, sendRoomFunc, clientid, index) => {
    const { currentRound } = data.privateData;
    const findPlayer = currentRound.players.find(player => player.id === clientid);
    const { bucket } = currentRound;

    let realIndex = 0;
    if (index) {
      realIndex = index;
    }

    if (currentRound.currentPointer === findPlayer && !findPlayer.hands[realIndex].stand) {

      const originalHand = findPlayer.hands[realIndex].hand;
      if (findPlayer.hands.length < this.maxSplit && originalHand.isSplittable() && data.publicData.playerStat[clientid].money >= findPlayer.bet) {

        currentRound.currentWait = 10;

        data.publicData.playerStat[clientid].money -= findPlayer.originalBet;
        findPlayer.bet += findPlayer.originalBet;

        const newHand = new Hand();
        newHand.addCard(originalHand.popCard());
        findPlayer.hands.push({ hand: newHand, stand: false, win: 0 });
        const latestIndex = findPlayer.hands.length - 1;


        this.sendToClients(data, sendRoomFunc);

        await shortSleep();


        originalHand.addCard(bucket.popCard())
        newHand.addCard(bucket.popCard());

        if (findPlayer.hands[realIndex].hand.getMaxScore() == BLACKJACK) {
          findPlayer.hands[realIndex].stand = true;
        }

        if (findPlayer.hands[latestIndex].hand.getMaxScore() == BLACKJACK) {
          findPlayer.hands[latestIndex].stand = true;
        }




        this.sendToClients(data, sendRoomFunc);


      }

    }

  }

  double = async (data, sendRoomFunc, clientid) => {
    const { currentRound } = data.privateData;
    const findPlayer = currentRound.players.find(player => player.id === clientid);
    const { bucket } = currentRound;
    const realIndex = 0;

    if (currentRound.currentPointer === findPlayer && !findPlayer.hands[realIndex].stand) {

      if (findPlayer.hands.length === 1 && findPlayer.hands[realIndex].hand.cards.length === 2) {



        if (data.publicData.playerStat[clientid].money >= findPlayer.originalBet) {

          currentRound.currentWait = 10;

          data.publicData.playerStat[clientid].money -= findPlayer.originalBet;
          findPlayer.originalBet *= 2;
          findPlayer.bet *= 2;


          findPlayer.hands[realIndex].hand.addCard(bucket.popCard())
          findPlayer.hands[realIndex].stand = true;


          if (findPlayer.hands.every((hand) => hand.stand === true)) {
            currentRound.actionPending = false;
          }

          this.sendToClients(data, sendRoomFunc);
        }
        else {
          await this.hitCard(data, sendRoomFunc, clientid, 0);
        }
      }
    }
  }

  hitCard = async (data, sendRoomFunc, clientid, index) => {
    const { currentRound } = data.privateData;
    const findPlayer = currentRound.players.find(player => player.id === clientid);
    const { bucket } = currentRound;

    let realIndex = 0;
    if (index) {
      realIndex = index;
    }

    if (currentRound.currentPointer === findPlayer && !findPlayer.hands[realIndex].stand) {
      findPlayer.hands[realIndex].hand.addCard(bucket.popCard())

      const softScore = findPlayer.hands[realIndex].hand.getSoftScore();
      const maxScore = findPlayer.hands[realIndex].hand.getMaxScore();
      currentRound.currentWait = 10;

      if (softScore == BLACKJACK || maxScore >= BLACKJACK) {
        findPlayer.hands[realIndex].stand = true;
      }

      if (findPlayer.hands.every((hand) => hand.stand === true)) {
        currentRound.actionPending = false;
      }

      this.sendToClients(data, sendRoomFunc);
    }
  }

  stand = async (data, sendRoomFunc, clientid, index) => {
    const { currentRound } = data.privateData;
    let realIndex = 0;
    if (index) {
      realIndex = index;
    }

    const findPlayer = currentRound.players.find(player => player.id === clientid);


    if (currentRound.currentPointer === findPlayer && !findPlayer.hands[realIndex].stand) {
      findPlayer.hands[realIndex].stand = true;
      currentRound.currentWait = 10;


      if (findPlayer.hands.every((hand) => hand.stand === true)) {
        currentRound.actionPending = false;
      }
      this.sendToClients(data, sendRoomFunc);
    }
  }

  ping = async ({ gameServer, client, data, sendRoomFunc, customInstance }) => {
    if (!data.privateData.startedGame && data.clients.length > 0) {
      this.startGame(data, sendRoomFunc);
    }
  }



  callback = async ({ gameServer, client, msg, data, sendRoomFunc, customInstance }) => {


    switch (msg.type) {
      case 'CREATE': {

        data.privateData.adminId = client.id;

        data.privateData.startedGame = false;
        data.publicData.playerStat = {};
        data.clients.push(client);
        data.publicData.playerStat[client.id] = { money: 10000 }

        //data.publicData.clientList = [];
        //data.publicData.clientList.push({ id: client.id, name: client.name, hand: null });

        break;
      }
      case 'JOIN': {

        data.clients.push(client);
        if (!data.publicData.playerStat) {
          data.publicData.playerStat = {};
        }
        data.publicData.playerStat[client.id] = {};
        data.publicData.playerStat[client.id].money = 10000;

        for (let i = 1; i <= 4; i++) {
          if (!data.publicData.playerStat['AI-' + i]) {
            data.publicData.playerStat['AI-' + i] = {};
            data.publicData.playerStat['AI-' + i].money = 10000;
          }
        }


        //data.publicData.clientList.push({ id: client.id, name: client.name, hand: null });
        //sendRoomFunc({ message: 'test' })
        break;
      }
      case 'LEAVE': {

        data.clients = data.clients.filter((eachclient) => eachclient.id !== client.id);
        delete data.publicData.playerStat[client.id]
        //data.publicData.clientList = data.publicData.clientList.filter((eachclient) => eachclient.id !== client.id);
        break;
      }
      case 'DATA': {

        if (msg.data === 'DOUBLE') {
          await this.double(data, sendRoomFunc, client.id);
        }
        if (msg.data === 'HIT') {
          await this.hitCard(data, sendRoomFunc, client.id, msg.index);
        }
        if (msg.data === 'STAND') {
          await this.stand(data, sendRoomFunc, client.id, msg.index);
        }
        if (msg.data === 'SPLIT') {
          await this.split(data, sendRoomFunc, client.id, msg.index);
        }
        break;
      }

    }
  }
}