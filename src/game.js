class Game{
  constructor(p1Obj, p2Obj, p1StyleObj, p2StyleObj, inARowToWin) {
    this.board = [
      ['','',''],
      ['','',''],
      ['','','']
    ];
    this.p1 = new Player(p1Obj, p1StyleObj);
    this.p2 = new Player(p2Obj, p2StyleObj);
    this.p1.opponent = this.p2;
    this.p2.opponent = this.p1;
    this.currentPlayer = this.randomElementFromArray( [this.p1, this.p2] );
    this.inARowToWin = inARowToWin || 3;
    this.turns = 0;
  };

  getSymbol( coordinates ) {
    if ( this.board[ coordinates[0] ] === undefined ||
         this.board[ coordinates[0] ][ coordinates[1] ] === undefined) {
      return false;
    };
    return this.board[ coordinates[0] ][ coordinates[1] ];
   };

  randomElementFromArray(array) {
    var randomIndex =  Math.floor( Math.random() * array.length );
    return (array.length > 0) ? array[randomIndex] : false;
  };

  hasStarted() {
    return this.turns > 0;
  };

  tileIsEmpty(coordinates) {
    if ( this.getSymbol(coordinates) === '' ) {
      return true;
    };
    return false;
  };

  takeTurn(coordinates) {
    this.board[ coordinates[0] ][ coordinates[1] ] = this.currentPlayer.symbol;
    if (this.turns === 0) {
      this.p1.games++;
      this.p2.games++;
    };
    this.turns++;
  };

  checkForWins(coordinates) {
    var horizontal = this.numInARow( [ coordinates[0], 0 ], this.right );
    var vertical = this.numInARow( [ 0, coordinates[1] ], this.down );
    var diagonalDR = this.numInARow( [ 0, 0 ], this.downRight );
    var diagonalUR = this.numInARow( [ this.board.length - 1, 0 ], this.upRight );
    if ( Math.max( horizontal, vertical, diagonalDR, diagonalUR ) === this.inARowToWin ) {
      this.giveWin();
      return true;
    };
    return false;
  };

  numInARow(coordinates, direction) {
    if( this.getSymbol(coordinates) !== this.currentPlayer.symbol ) {
      return 0;
    };
    return 1 + this.numInARow( direction(coordinates), direction );
  };

  giveTie() {
    this.p1.ties++;
    this.p2.ties++;
  };

  giveWin() {
    this.currentPlayer.wins++;
  };

  switchCurrentPlayer() {
    this.currentPlayer = this.currentPlayer.opponent;
  };

  oppositeCornerTile( coordinates ) {
    var height = this.board.length - 1 ;
    var width = this.board[coordinates[0]].length - 1;
    var row = coordinates[0];
    var col = coordinates[1];
    row += (coordinates[0] === 0) ? width : (-width);
    col += (coordinates[1] === 0) ? height : (-height)
    return (this.getSymbol([row, col]) !== false) ? [row, col] : false;
  };

  sideTileBy( coordinates ) {
    var belowOrAbove = (coordinates[0] === 0) ?
                         [ coordinates[0] + 1, coordinates[1] ] :
                         [ coordinates[0] - 1, coordinates[1] ];
    var leftOrRight = (coordinates[1] === 0) ?
                         [ coordinates[0], coordinates[1] + 1 ] :
                         [ coordinates[0], coordinates[1] - 1 ];
    return this.randomElementFromArray( [belowOrAbove, leftOrRight] )
  };

  adjacentCornerBy( coordinates ) {
    var possibleTiles = [];
    (coordinates[0] === 1) ?
      (possibleTiles.push([ coordinates[0] + 1, coordinates[1] ]), possibleTiles.push([ coordinates[0] - 1, coordinates[1] ])) : '';
    (coordinates[1] === 1) ?
      (possibleTiles.push([ coordinates[0], coordinates[1] + 1]), possibleTiles.push([ coordinates[0], coordinates[1] - 1 ])) : '';
    return this.randomElementFromArray( possibleTiles )
  }

  isASide(coordinates) {
    return !this.isACorner(coordinates) && !this.isCenter(coordinates);
  };

  isCenter(coordinates) {
    return ( coordinates[0] === 1 ) && ( coordinates[1] === 1 );
  };

  isACorner(coordinates) {
    var topOrBot = [ 0, this.board.length - 1 ].includes( coordinates[0] );
    var leftOrRight = [ 0, this.board[0].length - 1 ].includes( coordinates[1] );
    return topOrBot && leftOrRight;
  };

  randomOpenCorner(){
    var corners = [
      [0,0],
      [2,0],
      [0,2],
      [2,2]
    ];
    this.removeFilledTiles(corners);
    return (corners.length > 0) ? this.randomElementFromArray(corners) : false;
  }

  hardAI() {
    return this.findWinningMove() ||
           this.preventEnemyCornerStrat() ||
           this.preventEnemySideStrat() ||
           this.tryPin() ||
           this.preventCornerPin() ||
           this.preventSidePin() ||
           this.cornerOnOpenSide() ||
           this.randomOpenCorner() ||
           this.randomOpenTile()
  }

  preventEnemyCornerStrat() {
    const enemyTile = this.findSpaceThatMatches(this.currentPlayer.opponent.symbol);
    if (this.turns === 1 && this.isACorner(enemyTile)) {
      return [1, 1];
    }
    return false;
  }

  preventEnemySideStrat() {
    const enemyTile = this.findSpaceThatMatches(this.currentPlayer.opponent.symbol);
    if (this.turns === 1 && this.isASide(enemyTile)) {
      return this.adjacentCornerBy(enemyTile);
    }
    return false;
  }

  tryPin() {
    const enemyTile = this.findSpaceThatMatches(this.currentPlayer.opponent.symbol);
    if (this.turns === 2 && this.isCenter(enemyTile)) {
      var playerTile = this.findSpaceThatMatches(this.currentPlayer.symbol);
      return this.oppositeCornerTile(playerTile);
    }
    return false;
  }

  preventCornerPin() {
    const enemyTile = this.findSpaceThatMatches(this.currentPlayer.opponent.symbol);
    if (this.turns === 3 && this.isACorner(enemyTile)) {
      return this.sideTileBy(enemyTile);
    }
    return false;
  }

  preventSidePin() {
    const enemyTile = this.findSpaceThatMatches(this.currentPlayer.opponent.symbol);
    if ((this.turns === 3 || this.turns === 4) && this.isASide(enemyTile)) {
      var copyBoard = this.board.concat();
      copyBoard[enemyTile[0]][enemyTile[1]] == '';
      const enemyTile2 = this.findSpaceThatMatches(this.currentPlayer.opponent.symbol, copyBoard);
      return (this.isASide(enemyTile2)) ? [1,1] : false;
    }
    return false;
  }

  cornerOnOpenSide() {
    var corners = [
      [0,0],
      [2,0],
      [0,2],
      [2,2]
    ];
    this.removeFilledTiles(corners);
    this.removeTilesAdjacentToEnemy(corners);
    this.removeCornersOppositeMe(corners);
    return this.randomElementFromArray(corners);
  }

  removeFilledTiles( tileArray ) {
    for (var i = 0; i < tileArray.length; i++) {
      if ( this.getSymbol( tileArray[i] ) !== '' ) {
        tileArray.splice( i, 1 )
        i--;
      };
    };
    return tileArray;
  };

  removeTilesAdjacentToEnemy( tileArray ) {
    for (var i = 0; i < tileArray.length; i++) {
      if ( this.isAdjacentToEnemy( tileArray[i] ) ) {
        tileArray.splice( i, 1 )
        i--;
      };
    };
    return tileArray;
  }

  removeCornersOppositeMe( tileArray ) {
    for (var i = 0; i < tileArray.length; i++) {
      if ( this.getSymbol(this.oppositeCornerTile( tileArray[i] ) ) === this.currentPlayer.symbol ) {
        tileArray.splice( i, 1 )
        i--;
      };
    };
    return tileArray;
  }

  isAdjacentToEnemy( coordinates ) {
    var adjacentTiles = [
      [coordinates[0] - 1, coordinates[1]],
      [coordinates[0] + 1, coordinates[1]],
      [coordinates[0], coordinates[1] - 1],
      [coordinates[0], coordinates[1] + 1]
    ]
    adjacentTiles = adjacentTiles.map((tile) => this.getSymbol(tile));
    return adjacentTiles.includes(this.currentPlayer.opponent.symbol);
  }

  findSpaceThatMatches( symbol, board ) {
    var arrayToSearch = board || this.board;
    for( var row = 0; row < arrayToSearch.length; row++ ) {
      for( var col = 0; col < arrayToSearch[row].length; col++ ) {
        if ( this.getSymbol( [row, col] ) === symbol ) {
          return [ row, col ];
        };
      };
    };
    return false;
  };

  winOrRandom() {
    return this.findWinningMove() || this.randomOpenTile();
  };

  findWinningMove() {
    var lines = [
      [[0,0],[0,1],[0,2]],
      [[1,0],[1,1],[1,2]],
      [[2,0],[2,1],[2,2]],
      [[0,0],[1,0],[2,0]],
      [[0,1],[1,1],[2,1]],
      [[0,2],[1,2],[2,2]],
      [[0,0],[1,1],[2,2]],
      [[0,2],[1,1],[2,0]]
    ];
    for( var player of [ this.currentPlayer, this.currentPlayer.opponent ] ) {
      for( var line of lines ) {
        var symbolsArr = this.convertToSymbols(line);
        var win = this.winningPlay(symbolsArr, player.symbol);
        if( win !== -1 ) {
          return line[win];
        };
      };
    };
    return false;
  };

  winningPlay(symbolArr, symbol) {
    var count = {};
    for (var i = 0; i < symbolArr.length; i++) {
      count[ symbolArr[i] ] = count[ symbolArr[i] ] ? count[ symbolArr[i] ] + 1 : 1;
    };
    return ( count[symbol] >= (this.inARowToWin - 1) ) ? symbolArr.indexOf('') : -1;
  };

  convertToSymbols(line) {
    var symbols = [];
    for( var tile of line ) {
      symbols.push( this.getSymbol(tile) );
    };
    return symbols;
  };

  randomOpenTile() {
    var openTiles = []
    for( var row = 0; row < this.board.length; row++ ) {
      for( var col = 0; col < this.board[row].length; col++) {
        if ( this.getSymbol( [row, col] ) === '' ) {
          openTiles.push([row, col])
        };
      };
    };
    return this.randomElementFromArray(openTiles);
  };

  right(coordinates) {
    return [ coordinates[0], (coordinates[1] + 1) ];
  };

  downRight(coordinates) {
    return [ (coordinates[0] + 1), (coordinates[1] + 1) ];
  };

  down(coordinates) {
    return [ (coordinates[0] + 1), coordinates[1] ];
  };

  upRight(coordinates) {
    return [ (coordinates[0] - 1), (coordinates[1] + 1) ];
  };
};
