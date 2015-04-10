// 0 tile is our hole
		var data = [4, 8, 1, 14, 7, 2, 3, 0, 12, 5, 6, 11, 13, 9, 15, 10];
		// 0 needs to end up in 15
		var destinations = [15, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

		var slots = [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3},
					{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3},
					{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}, {row: 2, col: 3},
					{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}, {row: 3, col: 3}];
	
		var backMap = [	[0, 1, 2, 3],
						[4, 5, 6, 7],
						[8, 9, 10, 11],
						[12, 13, 14, 15]
					  ];
		var tiles = new Array(16);

		var moveCount = 0;

		var setup = false;

		function positionTiles() {
			var unsortedTiles = document.querySelectorAll(".tile");
			for (var i = 0; i < data.length; ++i) {
				var tile = unsortedTiles[i];
				var tileNum = parseInt(tile.id.replace(/tile/, ""), 10);
				var pos = data[tileNum];
				var slot = slots[pos]; // data[i]
				tile.style.left = slot.col * 162 + "px"; // account for the border
				tile.style.top = slot.row * 162 + "px";
				tile.addEventListener("click", onMoveTile);
				tile.addEventListener("webkitTransitionEnd", anchorTile, false);
//				tile.addEventListener("transitionend", anchorTile, false); 
				tiles[tileNum] = tile;
			}
			moveCount = 0;
			displayMoveCount();
		}

		function solve() {
			alert("Not yet implemented");
			return;
			// TODO
			// solution algorithm http://www.wikihow.com/Solve-a-Fifteen-Puzzle

			/* From http://www.codeproject.com/Messages/3433178/Re-15-puzzle-algorithm-in-C-or-Cplusplus.aspx
				I'll give you a starting point. This puzzle can be solved efficiently with three algorithms:
				 
				1. The simple case: For numbers not in the rightmost column or the last two rows, move tiles to create a blank space between the next tile to place, and the correct location for this tile. Then move the tile into the blank space, bringing you one step closer to correct placement for this tile. Repeat until the tile is in the correct location.
				 
				2. For a position in the rightmost column (but not the last two rows), the problem is getting the wrong tile out and the right tile in. Get the right tile under the correct location (in the rightmost column). Then move another tile in the same row as the correct location down one (temporarily moving it out of its correct location), slide the rest of the row to the left, move the right tile up (to its correct position), get a blank spot under the wrong tile, move the wrong tile down, move the rest of the row right, then move the tile you moved out of its correct position back, thus completing the row.
				 
				3. For the last two rows, move them in a circular pattern until you get the opportunity to swap two tiles that are in the wrong order. Repeat until the last two rows are correct.


*/

			var count = 0;
			solveRow1();
/*
			var animatix = function () {
				if (count > 20) {
					alert("d'oy. Lion confoozed! Still learning to solve.\nCome back later for intelligence here.");
					return;
				}
				++count;
				setTimeout(animatix, 300);
				moveHole(1);
			};
			setTimeout(animatix, 300);
*/
		}
		
		function checkSolution() {
			for (var i = 0; i < data.length; ++i) {
				// 0 needs to end up in 15, Circular shifted right
				if (data[i] != ((i + 15) % 16)) {
					return;
				}
			}
			alert("Congrats! The love is real!");
		}

		function solveRow1() {
			var tile = getTileSlot(1);
			if (tile.row !== 0 || tile.col !== 0) {
				var iter = 0;
				while(data[1] != 0 && iter < 20) {
					console.log("@@@ data needs to move");
					moveTileToDest(1, destinations[1]);
					++iter;
				}
			}
		}

		function moveTileToDest(tileNum, dest) {
			console.log("### moving tile to dest");
			var setUp = function () {
				if (data[tileNum] !== dest) {
					console.log("### Pumpkin time!");
					var tile = getTileSlot(tileNum);
					var holeSlotNum = data[0];
					var hole = getHole();
					var destination = getSlotInfo(dest);
			
					// tile to hole diff
					var holeVDiff = tile.row - hole.row;
					var holeHDiff = tile.col - hole.col;
			
					// tile to destination diff
					var targetDestVDiff = tile.row - destination.row;
					var targetDestHDiff = tile.col - destination.col;

					// if tile needs to move, and hole is not adjacent
					if (targetDestVDiff != 0 && Math.abs(holeVDiff) > 1 ||
						targetDestHDiff != 0 && Math.abs(holeHDiff) > 1) {
						console.log("### need to align the hole");
						// if target needs to vertically, or horizontally, and hole is not adjacent
						moveHole(tileNum, dest);
					} else {
						console.log("### move the tile itself");
						moveTile(tileNum);
					}
					setTimeout(setUp, 800);
				}
				console.log("### Complete!");
			}
			setTimeout(setUp, 800);

		}

		function moveHole(tileNum, dest) {
			// move tile next to tileNum, which has the ultimate direction of dir
			// dir string, can be "up", "down", "left", "right"
			// move hole directly above a tile that has to move up, left of hole that has to move left, etc.
			console.log("@@@ tile num is : " + tileNum);

			var tile = getTileSlot(tileNum);
			var holeSlotNum = data[0];
			var hole = getHole();
			var candidates = [];
			var destination = getSlotInfo(dest);
			console.log("TILE: " + tile);
			console.log("HOLE: " + hole);
			console.log("DESTINATION: " + dest);

			var vDiff = tile.row - hole.row;
			var hDiff = tile.col - hole.col;
			
			var targetDestVDiff = tile.row - destination.row;
			var targetDestHDiff = tile.col - destination.col;

			if (targetDestVDiff > 0 && vDiff > 1) {
				// if target tile needs to move up
				// and we're above the target
				// move the hole down
				candidates.push(holeSlotNum + 4);
			}

			// UP-DOWN NAV
			if (targetDestVDiff < 0) {
				console.log("### target needs to go up");
				// if target tile needs to move up
				if (vDiff > 1) {
					// and we're below the target
					// move the hole up
					candidates.push(holeSlotNum - 4);
				} else if (vDiff < -1) {
					// otherwise, move the hole down to get closer
					candidates.push(holeSlotNum + 4);
				} else if (vDiff > 0) {
					// we're too close. move the hole around 
					moveHoleAround(dest);
				} else if (vDiff < 0) {
					candidates.push(holeSlotNum - 4);
				}
			}

			// UP-DOWN NAV
			if (targetDestVDiff > 0) {
				console.log("### target needs to go down");
				// if target tile needs to move down
				if (vDiff < -1) {
					// and we're above the target
					// move the hole down
					candidates.push(holeSlotNum + 4);
				} else if (vDiff > 1) {
					// otherwise, move the hole up to get closer
					candidates.push(holeSlotNum - 4);
				} else if (vDiff < 0) {
					// we're too close. move the hole around 
					moveHoleAround(dest);
				} else if (vDiff > 0) {
					// move the slot down
					candidates.push(holeSlotNum + 4);
				}
			}

			// left/right nav
			if (targetDestHDiff < 0) {
				console.log("### target needs to go left");
				if (hDiff < -1) {
					// if target tile needs to move left
					// and we're left of the target
					// move the hole right
					candidates.push(holeSlotNum + 1);
				} else if (hDiff > 1) {
					// otherwise, if we're more than one space away, move the hole left to get closer
					candidates.push(holeSlotNum - 1);
				} else if (hDiff > 0) {
					// we're too close. move the tile around the target to get to the other side
					moveHoleAround(dest);
				} else if (hDiff < 0) {
					// move the hole right
					candidates.push(holeSlotNum + 1);
				}
			}

			// left/right nav
			if (targetDestHDiff > 0) {
				console.log("### target needs to go right");
				if (hDiff > 1) {
					// if target tile needs to move right
					// and we're right of the target
					// move the hole left
					candidates.push(holeSlotNum - 1);
				} else if (hDiff < -1) {
					// otherwise, if we're more than one space away, move the hole right to get closer
					candidates.push(holeSlotNum + 1);
				} else if (hDiff < 0) {
					// we're too close. move the tile around the target to get to the other side
					moveHoleAround(dest);
				} else if (hDiff > 0) {
					// move the tile left
					candidates.push(holeSlotNum - 1);
				}
			}

			console.log("### here are our candidates: " + candidates);
			var target = candidates[Math.floor((candidates.length * Math.random()))];
			moveTile(getTileNumFromSlot(target));
		}

		function moveHoleAround(dest) {
			console.log("### need to move the hole around");
			return;
			var candidates = [];

			
			if (hole.row !== 0 && targetDestVDiff < 0 &&  vDiff < 0) {
				// can move down
				candidates.push(holeSlotNum - 4);
			}
			if (hole.col !== 0 && hDiff < 0) {
				// can move left
				candidates.push(holeSlotNum - 1);
			} 
			if (hole.col !== 3 && hDiff > 0) {
				// can move right
				candidates.push(holeSlotNum + 1);
			}	

			if (hole.row !== 3 && vDiff > 0) {
				// can move up
				candidates.push(holeSlotNum + 4);
			}
		
			var target = candidates[Math.floor((candidates.length * Math.random()))];
			moveTile(getTileNumFromSlot(target));
		}

		function getTileNumFromSlot(slotNum) {
			for (var i = 0; i < data.length; ++i) {
				if (data[i] == slotNum) {
					return i;
				}
			}
		}

		// stolen from http://www.codingforums.com/showpost.php?p=931088&postcount=11
       function isSolvable(a) {
			var i, j, zero, l = a.length, inversion = 0, cols = this.columns;
			// normalize "array"    
			zero = a.indexOf(0);
			j = l - cols;
			while (zero < j) {
				a[zero] = a[zero + cols];
				a[zero + cols] = 0;
				zero += cols;
			}
			// test "determinat"
			for (i = 0; i < l; i += 1) {
				for (j = i + 1; j < l; j += 1) {
				    if (a[i] > a[j] && a[j] > 0) {
				        inversion += 1;
				    }
				}
			}
			if (0 === (inversion % 2)) {
				return true;
			}
			return false;
		}



		function displayMoveCount() {
			displayMoveCount.countDiv = displayMoveCount.countDiv || document.getElementById("movCount");
			displayMoveCount.countDiv.innerText = moveCount;
		}

		function positionTileNum(tileNum) {
				var tile = tiles[tileNum];
				var pos = data[tileNum];
				var slot = slots[pos];
				tile.style.left = slot.col * 162 + "px"; // account for the border
				tile.style.top = slot.row * 162 + "px";

				
				tile.className = 'tile';
		}

		function anchorTile(event) {
			console.log("### grounding tile");
			var tileNum = parseInt(event.target.id.replace(/tile/, ""), 10);
			positionTileNum(tileNum);
		}

		function onMoveTile(event) {
			var tileNum = parseInt(event.target.id.replace(/tile/, ""), 10);
			moveTile(tileNum);
		}

		function getTileSlot(tileNum) {
			return slots[data[tileNum]];
		}

		function getSlotInfo(slotNum) {
			return slots[slotNum];
		}
		
		function getHole() {
			return getTileSlot(0);
		}

		function moveTile(tileNum) {
			if (!tileNum) {
				return; // 0 tile should not be moved
			}
			if (canMove(tileNum)) {
				console.log("### swap with the hole");
				swapWithHole(tileNum);
			}
		}

		function swapWithHole(tileNum) {
			var temp = data[0];
			var targetPos = slots[temp];
			var currPos = slots[data[tileNum]];
			data[0] = data[tileNum];
			data[tileNum] = temp;
			animateTile(tileNum, currPos, targetPos);
			var positionTile = function() {
				positionTileNum(0);
				positionTileNum(tileNum);
				checkSolution();
			}
			window.setTimeout(positionTile, 500);
			moveCount++;
			displayMoveCount();
		}

		function animateTile(tileNum, from, to) {
			var vDiff = to.row - from.row;
			var hDiff = to.col - from.col;
			var tile = tiles[tileNum];
			var dir = "";
			if (hDiff !== 0) {
				if (hDiff < 0) {
					dir = "Left";
				} else if (hDiff > 0) {
					dir = "Right";
				} 
			} else if (vDiff !== 0) {
				if (vDiff < 0) {
					dir = "Down";
				} else if (vDiff > 0) {
					dir = "Up";
				} 
			}

			var stem = "animate";
			tile.className = "tile " + stem + dir;
		}

		function canMove(tileNum) {
			if (tileNum === undefined) {
				return false;
			}
			var tile = getTileSlot(tileNum);
			var hole = getHole();
			var rowDiff = Math.abs(tile.row - hole.row);
			var colDiff = Math.abs(tile.col - hole.col);
			return ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1));
		}

		function scrambleIt() {
			scramble();
			positionTiles();
		}


		/*
		 * Scrambles the set of tiles so that a user may restart the game
		 * @param data An array containing a set of numbers defining the board state.
		 * @return boolean Returns true if the board was successfully scrambled. If
		 * input data was given the function should insure the validity of the data
		 * and return false if unsuccessfully scrambled.
		 */
		function scramble(datum) { 
			if (datum) {
				return checkData(datum);
			}

			console.log("### scrambling");
			// start with a circularly shifted array
			var init = Math.floor(Math.random() * 15);
			var nums = [];
			for (var i = 0; i < 16; ++i) {
				nums.push(init);
				init = (init + 1) % 16;
			}
	
			// then pull random elements out to make the scramble
			var scramble = [];
			while (nums.length) {
				scramble.push(nums.splice( Math.floor(Math.random() * nums.length) ,1));
			}
			if (checkData(scramble)) {
				data = scramble;
				return true;
			}
			return false;
		}

		function checkData(data) {
			/* idiotic check. Just make sure that order is not standard */
			if (!data || data.length < 16) {
				return false;
			}
			var copy = data.slice(0).sort(function(left, right) { return left - right; });
			if (data.toString() === copy.toString()) {	
				console.log("### data is already sorted");
				// not scrambled
				return false;
			}
	
			for (var i = 0; i < copy.length; ++i) {
				if (copy[i] != i) { // some coersion involved. Don't use !==
					// should have all numbers 0 - 15 in the matching index
					return false;
				} 
			}	

			// TODO: check validity of the scramble here.
			// ...
				
			return true;
		}


