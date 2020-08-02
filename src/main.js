// var players ={
//   'Ruby Player': {
//     name: 'Ruby Player',
//     wins: 0
//   },
//   'JS Player': {
//     name: 'JS Player',
//     wins: 0
//   }
// };
var game;

var gameBoard = document.querySelector('#game-board');
var nextPlayerIcon = document.querySelector('h1 img');
var playerNames = document.querySelectorAll('.div-player-score h2');
var forfeitButton = document.querySelector('.forfeit');
var clearButton = document.querySelector('.clear');
var p1ChangeName = document.querySelector('#section-left>button');
var p2ChangeName = document.querySelector('#section-right>button');
var p1nameInput = document.querySelector('#section-left>input');
var p2nameInput = document.querySelector('#section-right>input');
var kablam = document.querySelector('#kablam');
var exclaim = document.querySelector('#exclaim-win');
var overlay = document.querySelector('.overlay');

window.onload = function doOnLoad(){
  clearBoard();
  updatePlayerWinsDisplay();
}

window.beforeunload = function ifGameThenForfeit(){
  if( !game.isEmpty ){
    forfeit(false);
  }
}

gameBoard.addEventListener('click', ifTileAttemptTurn);
forfeitButton.addEventListener('click', function forfeitAndShowAnimation(){
  forfeit(true)
});
clearButton.addEventListener('click', clearScores);
p1ChangeName.addEventListener('click', toggleForm)
p2ChangeName.addEventListener('click', toggleForm)
p1nameInput.addEventListener('keydown', ifEnterAttemptGetName)
p2nameInput.addEventListener('keydown', ifEnterAttemptGetName)

function toggleForm(event){
  clearInputs();
  var isLeft = event.target.dataset.side === 'left';
  var node = (isLeft) ? p1ChangeName : p2ChangeName;
  var toggleText = (node.innerText === 'Change') ? 'back!' : 'Change';
  node.innerText = toggleText;
  document.querySelector(`${ isLeft ? '#section-left' : '#section-right'} input`).classList.toggle('hidden')
}

function ifEnterAttemptGetName(event){
  if (event.key === 'Enter' && isValid() && notCurrentlyInUse() ){
    var p1Name = p1nameInput.value || game.p1.name;
    var p2Name = p2nameInput.value || game.p2.name;
    startNewGame( p1Name, p2Name );
    clearInputs();
  }
}

function notCurrentlyInUse(){
  var ret = (
    p1nameInput.value.toLowerCase() !== game.p2.name &&
    p2nameInput.value.toLowerCase() !== game.p1.name
  )
  message = (ret) ? 'Good to go!' : 'Sorry, this person is already playing!';
  console.log(message);
  return ret;
}

function isValid(){
  var isNotEmpty = (
    p1nameInput.value !== '' ||
    p2nameInput.value !== ''
  )
  var isNotTooLong = (
    p1nameInput.value.length <= 20 &&
    p2nameInput.value.length <=20
  )
  message = (isNotEmpty) ?
    ( (isNotTooLong) ? 'Good to go!' : 'Too Many Characters!' ) :
    'Too Few Characters!';
  console.log(message);
  return isNotEmpty && isNotTooLong;
}

function clearInputs(){
  p1nameInput.value = '';
  p2nameInput.value = '';
}

function startNewGame(p1Name, p2Name){
  var name1 = p1Name || ( (game) ? game.p1.name : 'Ruby Player' );
  var name2 = p2Name || ( (game) ? game.p2.name : 'JS Player' );
  game = new Game( name1, name2 );
  nextPlayerIcon.src = game.currentPlayer.icon;
  updatePlayerWinsDisplay();
}

function clearBoard(){
  startNewGame();
  var tiles = document.querySelectorAll('.tile');
  tiles.forEach(function insertEmptyIcon(tile) {
    tile.src = './assets/empty.png';
    tile.classList.add('empty');
    tile.classList.remove('js-bg', 'ruby-bg');
  });
  setButtonStatus();
}

function ifTileAttemptTurn(event) {
  var tile = event.target.closest('.tile');
  if (tile) {
    ifEmptyThenFill(tile);
  }
}

function ifEmptyThenFill(tile) {
  var row = 'tmb'.indexOf(tile.id[0]);
  var col = 'lcr'.indexOf(tile.id[1]);
  if ( game.tileIsEmpty( [row, col] ) ) {
    fill(tile);
    checkGameOver( [row, col] );
  }
}

function fill(tile){
  tile.src = game.currentPlayer.icon;
  tile.classList.add(game.currentPlayer.colorClass);
  tile.classList.remove('empty');
}

function checkGameOver( coordinates ){
  if( game.checkForWins(coordinates) ) {
    addPlayerWin();
    winAnimation();
  } else if (game.turns >= 9) {
    tieAnimation();
  } else {
    getNextPlayer();
    setButtonStatus();
  }
}

function addPlayerWin(){
  game.giveWin()
  forfeitButton.disabled = true;
}

function forfeit(showAnimation){
  game.switchCurrentPlayer();
  addPlayerWin();
  if (showAnimation){
    winAnimation(game.currentPlayer);
    window.setTimeout(winAnimationReset, 2400);
  }
  clearBoard();
  updatePlayerWinsDisplay();
}
function clearScores(){
  for (var player of [game.p1, game.p2] ){
    player.eraseWins();
  }
  updatePlayerWinsDisplay();
}

function winAnimation(winner){
  kablam.classList.remove('fade'), kablam.classList.add('show-kablam');
  exclaim.classList.remove('js-bg', 'ruby-bg', 'js-font', 'ruby-font')
  overlay.classList.remove('hidden');
  window.setTimeout(function stage1() { winAnimationStage1(winner) }, 600);
  window.setTimeout(winAnimationStage2, 1800);
  window.setTimeout(winAnimationReset, 2400);
}

function winAnimationStage1(winner){
  exclaim.innerText = `${winner.name} wins!!`
  exclaim.classList.add('show-exclaim');
  exclaim.classList.add(winner.bgClass, winner.fontClass);
}

function winAnimationStage2(){
  kablam.classList.add('fade');
  exclaim.classList.remove('show-exclaim');
}

function winAnimationReset(){
  clearBoard();
  updatePlayerWinsDisplay();
  kablam.classList.remove('show-kablam');
  overlay.classList.add('hidden');
}

function tieAnimation(){
  forfeitButton.disabled = true;
  exclaim.innerText = `tie.`
  exclaim.classList.remove('js-bg', 'ruby-bg', 'js-font', 'ruby-font')
  exclaim.classList.add('show-exclaim', 'draw');
  window.setTimeout(tieAnimationReset, 1200);
}

function tieAnimationReset(){
  exclaim.classList.remove('show-exclaim', 'draw');
  clearBoard();
}

function getNextPlayer(){
  game.switchCurrentPlayer();
  nextPlayerIcon.src = game.currentPlayer.icon;
}

function setButtonStatus(){
  var gameIsEmpty = game.isEmpty();
  forfeitButton.disabled = gameIsEmpty;
  clearButton.disabled = !gameIsEmpty;
  p1ChangeName.disabled = !gameIsEmpty, p1ChangeName.innerText = 'Change';
  p2ChangeName.disabled = !gameIsEmpty, p2ChangeName.innerText = 'Change';
  for ( var node of document.querySelectorAll('input') ) {
    node.classList.add('hidden');
  }
}

function updatePlayerWinsDisplay(){
  playerNames[0].innerText = `${game.p1.name} wins: ${game.p1.wins}`;
  playerNames[1].innerText = `${game.p2.name} wins: ${game.p2.wins}`;
}
