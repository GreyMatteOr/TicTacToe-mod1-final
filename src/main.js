var clearButton = document.querySelector('.clear');
var exclaim = document.querySelector('#exclaim-win');
var forfeitButton = document.querySelector('.forfeit');
var gameBoard = document.querySelector('#game-board');
var kablam = document.querySelector('#kablam');
var nextPlayerIcon = document.querySelector('h1 img');
var p1AI = document.querySelector('#section-left .AI');
var p2AI = document.querySelector('#section-right .AI');
var p1AIStop = document.querySelector('#section-left .stop')
var p2AIStop = document.querySelector('#section-right .stop')
var p1Anon = document.querySelector('#section-left .anonymous');
var p2Anon = document.querySelector('#section-right .anonymous');
var p1ChangeName = document.querySelector('#section-left>button');
var p2ChangeName = document.querySelector('#section-right>button');
var p1NameInput = document.querySelector('#section-left input');
var p2NameInput = document.querySelector('#section-right input');
var p1Step = document.querySelector('#section-left .step')
var p2Step = document.querySelector('#section-right .step')
var p1SubmitName = document.querySelector('#section-left>.input-flex>button');
var p2SubmitName = document.querySelector('#section-right>.input-flex>button')
var playerNames = document.querySelectorAll('.div-player-score h2');
var overlay = document.querySelector('.overlay');

var game;

window.onload = function doOnLoad() {
  clearBoard();
  updatePlayerWinsDisplay();
};

window.beforeunload = function ifGameThenForfeit() {
  if( game.hasStarted ) {
    forfeit(false);
  }
};

clearButton.addEventListener('click', clearScores);
gameBoard.addEventListener('click', ifTileAttemptTurn);
forfeitButton.addEventListener('click', function forfeitAndShowAnimation() {
  forfeit(true);
});
p1AI.addEventListener('click', ifAIButtonCreateGame);
p2AI.addEventListener('click', ifAIButtonCreateGame);
p1AIStop.addEventListener('click', toggleAutoAI);
p2AIStop.addEventListener('click', toggleAutoAI);
p1Anon.addEventListener('click', becomeAnonymous);
p2Anon.addEventListener('click', becomeAnonymous);
p1ChangeName.addEventListener('click', toggleForm);
p2ChangeName.addEventListener('click', toggleForm);
p1NameInput.addEventListener('keydown', ifEnterAttemptChangeName);
p2NameInput.addEventListener('keydown', ifEnterAttemptChangeName);
p1Step.addEventListener('click', takeAITurn);
p2Step.addEventListener('click', takeAITurn);
p1SubmitName.addEventListener('click', tryName);
p2SubmitName.addEventListener('click', tryName);


function clearBoard() {
  startNewGame();
  refreshDisplay();
  setButtonStatus();
};

function startNewGame(p1Name, p2Name, p1Type, p2Type) {
  var p1Obj = {
     name : p1Name || ( (game) ? game.p1.name : 'Ruby Player' ),
     type : p1Type || ( (game) ? game.p1.type : 'human' ),
     autoRun : (game) ? game.p1.autoRun : true
   }
  var p2Obj = {
    name : p2Name || ( (game) ? game.p2.name : 'JS Player' ),
    type : p2Type || ( (game) ? game.p2.type : 'human' ),
    autoRun : (game) ? game.p2.autoRun : true
  }
  var p1StyleObj = {
    symbol: 'x',
    icon: './assets/ruby.png',
    bgClass: 'ruby-bg',
    fontClass: 'ruby-font'
  };
  var p2StyleObj = {
    symbol: 'o',
    icon: './assets/js-icon.webp',
    bgClass: 'js-bg',
    fontClass: 'js-font'
  };
  game = new Game( p1Obj, p2Obj, p1StyleObj, p2StyleObj);
  nextPlayerIcon.src = game.currentPlayer.icon;
  updatePlayerWinsDisplay();
  tryAITurnLoop()
};

function tryAITurnLoop() {
  if( ( game.currentPlayer.isAutoAI() )) {
    takeAITurn();
  }
}

function takeAITurn(){
  if(game.currentPlayer.type !== 'human'){
    var behavior = {
      'ez': 'randomOpenTile',
      'med': 'winOrRandom',
      'hard': 'hardAI'
    }
    var coordinates = game[ behavior[game.currentPlayer.type] ]();
    game.takeTurn( coordinates );
    refreshDisplay();
    checkGameOver( coordinates );
  }
}

function checkGameOver( coordinates ) {
  if( game.checkForWins(coordinates) ) {
    updatePlayerWinsDisplay();
    winAnimation(game.currentPlayer);
  } else if (game.turns >= 9) {
    game.giveTie();
    tieAnimation();
  } else {
    getNextPlayer();
    setButtonStatus();
    tryAITurnLoop();
  }
};

function toggleAutoAI(event){
  var isLeft = event.target.closest('section').dataset.side === 'left';
  ( (isLeft) ? game.p1 : game.p2 ).toggleAutoRun();
  event.target.innerText = ( event.target.innerText === 'manual' ) ? 'run=auto' : 'manual';
  tryAITurnLoop();
  ifNotAutoDisplayStep();
}

function ifAIButtonCreateGame(event){
  var isLeft = event.target.closest('section').dataset.side === 'left';
  var type = event.target.dataset.ai;
  var nameIndex = ['ez', 'med', 'hard'].indexOf(type);
  var argsObj= {
    p1Name: (isLeft) ? ['Cole', 'Sylva', 'Rube Goldberg'][nameIndex] : game.p1.name,
    p2Name: (isLeft) ? game.p2.name : ['Chip', 'Mouse', 'Skynet'][nameIndex] ,
    p1Type: (isLeft) ?  type: game.p1.type,
    p2Type: (isLeft) ? game.p2.type : type
  }
  startNewGame( argsObj.p1Name, argsObj.p2Name, argsObj.p1Type, argsObj.p2Type );
}

function toggleForm(event) {
  clearInputs();
  var isLeft = event.target.closest('section').dataset.side === 'left';
  var section = (isLeft) ? '#section-left' : '#section-right';
  var node = (isLeft) ? p1ChangeName : p2ChangeName
  var toggleText = (node.innerText === 'Change') ? 'hide' : 'Change';
  node.innerText = toggleText;
  document.querySelector(`${ section } .input-flex`).classList.toggle('hidden');
  document.querySelector(`${ section } .anonymous`).classList.toggle('hidden');
  document.querySelector(`${ section } .AI`).classList.toggle('hidden')
};

function ifEnterAttemptChangeName(event) {
  if (event.key === 'Enter'){
    tryName(event);
  }
};

function tryName(event){
  var isLeft = event.target.closest('section').dataset.side === 'left';
  attemptChangeName(isLeft, event);
}

function attemptChangeName(isLeft, event){
  var userText = ( isLeft ) ? p1NameInput.value : p2NameInput.value;
  if ( isNotTooLong(isLeft, userText ) && notCurrentlyInUse(isLeft, userText ) ) {
    changeName(userText, isLeft, event);
  }
}

function changeName(userText, isLeft, event){
  game.p1.name = (isLeft) ? userText : game.p1.name;
  game.p2.name = (isLeft) ? game.p2.name : userText;
  game[(isLeft ? 'p1' : 'p2')].type = 'human';
  updatePlayerWinsDisplay();
  setButtonStatus();
}

function notCurrentlyInUse(isLeft, name) {
  var currentlyInUse = name.toLowerCase() === game.p1.name ||
                       name.toLowerCase() === game.p2.name;
  if (currentlyInUse) {
    flashWarning(isLeft, 'ALREADY EXISTS!');
  }
  return !currentlyInUse;
};

function isNotTooLong(isLeft, name) {
  var isTooLong = name.length > 20
  if (isTooLong) {
    flashWarning(isLeft, 'TOO LONG');
  }
  return !isTooLong;
};

function flashWarning(isLeft, warningText){
  var warningNode = document.querySelector(`${(isLeft) ? '#section-left' : '#section-right'} .invisible`)
  warningNode.innerText = warningText;
  warningNode.classList.add('show-exclaim', 'draw');
  window.setTimeout( function warningReset(){
    warningNode.classList.remove('show-exclaim', 'draw');
  }, 1200);
}

function clearInputs() {
  p1NameInput.value = '';
  p2NameInput.value = '';
};

function becomeAnonymous(event) {
  var isLeft = event.target.closest('section').dataset.side === 'left';
  changeName( ( (isLeft) ? 'Ruby Player' : 'JS Player' ), isLeft, event );
};

function ifTileAttemptTurn(event) {
  var tile = event.target.closest('.tile');
  if (tile) {
    ifEmptyThenFill(tile);
  }
};

function ifEmptyThenFill(tile) {
  var row = 'tmb'.indexOf(tile.id[0]);
  var col = 'lcr'.indexOf(tile.id[1]);
  if ( game.tileIsEmpty( [row, col] ) ) {
    fill(tile, game.currentPlayer);
    game.takeTurn( [row, col] );
    checkGameOver( [row, col] );
  }
};

function forfeit(showAnimation) {
  game.switchCurrentPlayer();
  game.giveWin();
  updatePlayerWinsDisplay();
  if (showAnimation) {
    winAnimation(game.currentPlayer);
    window.setTimeout(winAnimationReset, 2400);
  } else {
    clearBoard();
  }
};

function getNextPlayer() {
  game.switchCurrentPlayer();
  nextPlayerIcon.src = game.currentPlayer.icon;
};

function clearScores() {
  for (var player of [game.p1, game.p2] ) {
    player.eraseStats();
  };
  updatePlayerWinsDisplay();
};

function refreshDisplay(){
  var tiles = document.querySelectorAll('.tile');
  tiles.forEach(function insertEmptyIcon(tile) {
    var row = 'tmb'.indexOf(tile.id[0]);
    var col = 'lcr'.indexOf(tile.id[1]);
    if(game.getSymbol( [row, col] ) === ''){
      empty(tile);
    } else {
      var player = (game.p1.symbol === game.getSymbol( [row, col] ) ) ? game.p1 : game.p2;
      fill(tile, player)
    }
  });
}

function empty(tile){
  tile.src = './assets/empty.png';
  tile.classList.add('empty');
  tile.classList.remove(game.p2.bgClass, game.p1.bgClass);
}

function fill(tile, player) {
  tile.src = player.icon;
  tile.classList.add(player.colorClass);
  tile.classList.remove('empty');
};

function winAnimation(winner) {
  disableDuringAnimation();
  kablam.classList.remove('fade'), kablam.classList.add('show-kablam');
  exclaim.classList.remove(game.p2.bgClass, game.p1.bgClass, game.p2.fontClass, game.p1.fontClass);
  overlay.classList.remove('hidden');
  window.setTimeout(function stage1() { winAnimationStage1(winner) }, 600);
  window.setTimeout(winAnimationStage2, 1800);
  window.setTimeout(winAnimationReset, 2400);
};

function winAnimationStage1(winner) {
  exclaim.innerText = `${winner.name} wins!!`;
  exclaim.classList.add('show-exclaim');
  exclaim.classList.add(winner.bgClass, winner.fontClass);
};

function winAnimationStage2() {
  kablam.classList.add('fade');
  exclaim.classList.remove('show-exclaim');
};

function winAnimationReset() {
  clearBoard();
  kablam.classList.remove('show-kablam');
  overlay.classList.add('hidden');
};

function tieAnimation() {
  disableDuringAnimation();
  exclaim.innerText = `tie.`;
  exclaim.classList.remove(game.p2.bgClass, game.p1.bgClass, game.p2.fontClass, game.p1.fontClass);
  exclaim.classList.add('show-exclaim', 'draw');
  window.setTimeout(tieAnimationReset, 1200);
};

function tieAnimationReset() {
  exclaim.classList.remove('show-exclaim', 'draw');
  clearBoard();
};

function setButtonStatus() {
  forfeitButton.disabled = !game.hasStarted();
  clearButton.disabled = game.hasStarted();
  p1ChangeName.disabled = game.hasStarted(), p1ChangeName.innerText = 'Change';
  p2ChangeName.disabled = game.hasStarted(), p2ChangeName.innerText = 'Change';
  for ( var node of document.querySelectorAll('.if-game-dont-show') ) {
    node.classList.add('hidden');
  }
  ifNotHumanDisplayStop()
};

function ifNotHumanDisplayStop(){
  p1AIStop.innerText = (game.p1.autoRun) ? 'run=auto' : 'manual';
  p1AIStop.classList[ (game.p1.type === 'human') ? 'add' : 'remove' ]( 'hidden' );
  p2AIStop.innerText = (game.p2.autoRun) ? 'run=auto' : 'manual';
  p2AIStop.classList[ (game.p2.type === 'human') ? 'add' : 'remove' ]( 'hidden' );
  ifNotAutoDisplayStep();
}

function ifNotAutoDisplayStep() {
  p1Step.classList[ (game.p1.autoRun || game.p1.type === 'human') ? 'add' : 'remove' ]( 'hidden' );
  p2Step.classList[ (game.p2.autoRun || game.p2.type === 'human' ) ? 'add' : 'remove' ]( 'hidden' );
  p1Step.disabled = false;
  p2Step.disabled = false;
}

function updatePlayerWinsDisplay() {
  var doNotShowScoreP1 = (game.p1.name === 'ruby player' || game.p1.name === 'js player');
  var doNotShowScoreP2 = (game.p2.name === 'ruby player' || game.p2.name === 'js player');
  p1 = `${game.p1.name}${ (doNotShowScoreP1) ? `` : ` wins: ${game.p1.wins}` }`;
  p2 = `${game.p2.name}${ (doNotShowScoreP2) ? `` : ` wins: ${game.p2.wins}` }`;
  playerNames[0].innerText = p1;
  playerNames[1].innerText = p2;
};

function disableDuringAnimation(){
  p1Step.disabled = true;
  p2Step.disabled = true;
  forfeitButton.disabled = true;
}
