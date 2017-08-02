var _thePuzzle = {width: 0, height: 0, grid: [], answers: [], clues: []};

var ACROSS = "ACROSS";
var DOWN = "DOWN";

var cursor = {row: 0, col: 0, direction: ACROSS};

function logCell(cell) {
    console.log("cell " + cell.row + "," + cell.col + " clicked");
}

var WHITE = true;
var BLACK = false;

function toggleCellColor(cell) {
    console.log("toggling cell " + cell.row + "," + cell.col);
    if (getGrid(cell) === BLACK) {
        getGrid(cell) = WHITE;
    } else {
        getGrid(cell) = BLACK;
    }
}

function symmetricCell(cell) {
    return makeCell(_thePuzzle.height - cell.row - 1, _thePuzzle.width - cell.col - 1);
}

function symmetricToggleCellColor(cell) {
    toggleCellColor(cell);
    if ($("#color-symmetrically").is(":checked")) {
        var other = symmetricCell(cell);
        if (cell.row != other.row || cell.col != other.col) {
            toggleCellColor(other);
        }
    }
    redrawPuzzle();
}

function setCursorToCell(cell) {
    if (getGrid(cell) !== BLACK) {
        cursor.row = cell.row;
        cursor.col = cell.col;
    }
}

function otherDirection(dir) {
    if (dir === ACROSS) {
        return DOWN;
    } else {
        return ACROSS;
    }
}

function answerToolCallback(cell) {
    console.log("answer tool callback", cell.row, cell.col, cursor.row, cursor.col);
    if (cell.row != cursor.row || cell.col != cursor.col) {
        setCursorToCell(cell);
    } else {
        cursor.direction = otherDirection(cursor.direction);
    }
    redrawPuzzle();
}

var cellCallback = answerToolCallback;

function getCellId(cell) {
  return "cell_" + cell.row + "_" + cell.col;
}

function parseCellId(s) {
    var a = s.split("_");
    if (a.length !== 3) {
        return undefined;
    }
    var row = parseInt(a[1]);
    var col = parseInt(a[2]);
    if (typeof row !== "number" || typeof col !== "number") {
        return undefined;
    }
    return {row: row, col: col};
}

function getCell(cell) {
  return $("#" + getCellId(cell));
}

function getCellContents(cell) {
    var ans = getCell(cell).find("span.contents");
    return ans;
}

function getCellLabel(cell) {
    var ans = getCell(cell).children(".label");
    return ans;
}


function redrawCell(cell) {
    var x = getGrid(cell);

    getCellContents(cell).empty();

    if (x === BLACK) {
        getCell(cell).css("background-color", "black");
    } else {
        getCell(cell).css("background-color", "white");
        if (typeof x === "string") {
            getCellContents(cell).text(x);
        }
    }
}


function redrawCursor() {
    var i = cursor.row;
    var j = cursor.col;
    getCell(cursor).css("background-color", "#ffffcc");
    if (cursor.direction == ACROSS) {
        j++;
        while (j < _thePuzzle.width && _thePuzzle.grid[cursor.row][j] !== BLACK) {
            getCell(makeCell(cursor.row, j)).css("background-color", "#ccccff");
            j++;
        }
        j = cursor.col - 1;
        while (j >= 0 && _thePuzzle.grid[cursor.row][j] !== BLACK) {
            getCell(makeCell(cursor.row, j)).css("background-color", "#ccccff");
            j--;
        }
    } else {
        i++;
        while (i < _thePuzzle.height && _thePuzzle.grid[i][cursor.col] !== BLACK) {
            getCell(makeCell(i, cursor.col)).css("background-color", "#ccccff");
            i++;
        }
        i = cursor.row - 1;
        while (i >= 0 && _thePuzzle.grid[i][cursor.col] !== BLACK) {
            getCell(makeCell(i, cursor.col)).css("background-color", "#ccccff");
            i--;
        }
    }
}

function makeCell(i, j) {
    return {row: i, col: j};
}

function redrawCells() {
    for (var i = 0; i < _thePuzzle.height; i++) {
        for (var j = 0; j < _thePuzzle.width; j++) {
            redrawCell(makeCell(i, j));
        }
    }
}

function redrawLabels() {
    for (var i = 0; i < _thePuzzle.clues.length; i++) {
        var clue = _thePuzzle.clues[i];
        getCellLabel(clue).empty();
        getCellLabel(clue).text("" + clue.index);
    }
}

function findClueForCell(cell) {
    for (var i = 0; i < _thePuzzle.clues.length; i++) {
        var clue = _thePuzzle.clues[i];
        if (clue.row == cell.row && clue.col == cell.col) {
            return clue;
        }
    }
}

function findTopMostLeftmostCellInCurrentAnswer() {
    var cell = cursor;

    if (cursor.direction == ACROSS) {
        var left = cellToLeft(cell);
        while (inPuzzleBounds(left) && getGrid(left) !== BLACK) {
            cell = left;
            left = cellToLeft(cell);
        }
    } else {
        var above = cellAbove(cell);
        while (inPuzzleBounds(above) && getGrid(above) !== BLACK) {
            cell = above;
            above = cellAbove(cell);
        }
    }


    return cell;
}

function clueTextForDirection(clue) {
    if (cursor.direction == ACROSS) {
        return clue.across;
    } else {
        return clue.down;
    }
}

function setClueTextForDirection(clue, text) {
    if (cursor.direction == ACROSS) {
        clue.across = text
    } else {
        clue.down = text;
    }
}

function findCurrentClue() {
    var cell = findTopMostLeftmostCellInCurrentAnswer();
    var clue = findClueForCell(cell);
    return clue;
}

function redrawClue() {
    var clue = findCurrentClue();
    $("#clue").text(clueTextForDirection(clue));
}

function redrawPuzzle() {
    redrawCells();
    redrawLabels();
    redrawCursor();
    redrawClue();
}

function buildGrid(puzzle) {
    var row = $("<tr></tr>")
        .addClass("row");

    $("<td></td>").appendTo(row);

    /*
    for (var i = 0; i < puzzle.width; i++) {
        $("<td style='text-align: center;'>" + (i+1) + "</td>").appendTo(row);
    }
    $("table #grid").append(row);
    */

    for (var i = 0; i < puzzle.height; i++) {
        var row = $("<tr></tr>")
            .addClass("row");
        // $("<td>" + (i+1) + "</td>").appendTo(row);
        for (var j = 0; j < puzzle.width; j++) {
            $("<td></td>")
                .addClass("cell")
                .attr({id: getCellId(makeCell(i, j))})
                .width(25)
                .height(25)
                .append($("<div />").addClass("label"))
                .append($("<div />").append($("<span />").addClass("contents")).addClass("contents"))
                .appendTo(row);
        }
        $("table #grid").append(row);
    }
}

function initPuzzle(puzzle) {
    var n = 15;
    puzzle.width = n;
    puzzle.height = n;
    puzzle.grid = [];
    puzzle.answers = [];
    puzzle.clues = [];
    for (var i = 0; i < n; i++) {
        var row = [];
        for (var j = 0; j < n; j++) {
           row.push(WHITE);
        }
        puzzle.grid.push(row);
    }
}

function answerCellCallback(cell) {
    console.log("answer callback " + i + "," + j);
    var i = cell.row;
    var j = cell.col;

}

function colorTool() {
    cellCallback = symmetricToggleCellColor;
}

function dumpJSON() {
    $("#dump").val(JSON.stringify(_thePuzzle, null, 2));
}

function loadJSON() {
    _thePuzzle = JSON.parse($("#dump").val());
    redrawPuzzle();
}

function loadPuzzleFromFile(filename) {
    console.log("loading from ", filename);
    $.getJSON(filename, function(data) {
        console.log("got data from ", filename);
        _thePuzzle = data;
        redrawPuzzle();
    }).fail(function() {
        console.log("Failed to load puzzle " + filename + "!");
    });
}

function loadFile() {
    console.log("loadFile clicked");
    loadPuzzleFromFile($("#load-file-name").val());
}


function isArrowKey(code) {
    return 37 <= code && code <= 40;
}

function arrowKeyDirection(code) {
    return code % 2 == 1 ? ACROSS : DOWN;
}

function isNegativeDirection(code) {
    return code < 39;
}

function inPuzzleBounds(cell) {
    return 0 <= cell.row && cell.row < _thePuzzle.height &&
        0 <= cell.col && cell.col < _thePuzzle.width;
}

function getGrid(cell) {
    return _thePuzzle.grid[cell.row][cell.col];
}

function setGrid(cell, x) {
    _thePuzzle.grid[cell.row][cell.col] = x;
}


function moveCursorInDirection(direction, backwards) {
    var drow = 0;
    var dcol = 0;
    if (direction === ACROSS) {
        dcol = 1;
    } else {
        drow = 1;
    }

    if (backwards) {
        drow *= -1;
        dcol *= -1;
    }

    var newPos = makeCell(cursor.row + drow, cursor.col + dcol);
    if (inPuzzleBounds(newPos)) {
        setCursorToCell(newPos);
    }
}

function adjustCursorByArrow(code) {
    var dir = arrowKeyDirection(code);
    if (dir == cursor.direction) {
        moveCursorInDirection(dir, isNegativeDirection(code));
    } else {
        cursor.direction = dir;
    }
}

function isAlpha(code) {
    return 65 <= code && code <= 90;
}

function anyModifier(event) {
    return event.metaKey || event.ctrlKey || event.altKey;
}

var BACKSPACE = 8;
var TAB = 9;

function nextCell(cell) {
    if (cell.col == _thePuzzle.width - 1) {
        if (cell.row == _thePuzzle.height - 1) {
            return makeCell(0, 0);
        } else {
            return makeCell(cell.row + 1, 0);
        }
    } else {
        return makeCell(cell.row, cell.col + 1);
    }
}

function nextNonBlackCell(cell) {
    var next = nextCell(cell);
    while (getGrid(next) === BLACK) {
        next = nextCell(next);
    }
    return next;
}

function moveCursorToNextClue() {
    var cell = nextNonBlackCell(findTopMostLeftmostCellInCurrentAnswer());

    while (!startsClueInCurrentDirection(cell)) {
        cell = nextNonBlackCell(cell);
    }
    cursor.row = cell.row;
    cursor.col = cell.col;
}

function previousCell(cell) {
    if (cell.col == 0) {
        if (cell.row == 0) {
            return makeCell(_thePuzzle.height - 1, _thePuzzle.width - 1);
        } else {
            return makeCell(cell.row - 1, _thePuzzle.width - 1);
        }
    } else {
        return makeCell(cell.row, cell.col - 1);
    }
}

function previousNonBlackCell(cell) {
    var previous = previousCell(cell);
    while (getGrid(previous) === BLACK) {
        previous = previousCell(previous);
    }
    return previous;
}


function moveCursorToPreviousClue() {
    var cell = previousNonBlackCell(findTopMostLeftmostCellInCurrentAnswer());

    while (!startsClueInCurrentDirection(cell)) {
        cell = previousNonBlackCell(cell);
    }
    cursor.row = cell.row;
    cursor.col = cell.col;
}

function handleTab(event) {
    event.preventDefault();
    if (!event.shiftKey) {
        moveCursorToNextClue();
    } else {
        moveCursorToPreviousClue();
    }
 }

function answerToolKeyCallback(event) {
    if (anyModifier(event)) {
        return;
    }

    if (isArrowKey(event.which)) {
        adjustCursorByArrow(event.which);
    } else if (isAlpha(event.which)) {
        setGrid(cursor, String.fromCharCode(event.which));
        moveCursorInDirection(cursor.direction, false);
    } else if (event.which == BACKSPACE) {
        setGrid(cursor, WHITE);
        moveCursorInDirection(cursor.direction, true);
    } else if (event.which == TAB) {
        handleTab(event);
    }

    redrawPuzzle();
}

function clueKeyCallback(event) {
    if (anyModifier(event)) {
        return;
    }

    if (isArrowKey(event.which)) {
        adjustCursorByArrow(event.which);
    } else if (event.which == TAB) {
        handleTab(event);
    } else {
        return;
    }
    redrawPuzzle();
}


var keyCallback = answerToolKeyCallback;

function onKeyDown(event) {
    console.log("keydown", event.which);
    keyCallback(event);
}

function onKeyUp(event) {
}

function answerTool() {
    cellCallback = answerToolCallback;
    keyCallback = answerToolCallback;
}

function saveGrid() {
    console.log("saving grid");
    _thePuzzle.answers = [];
    for (var i = 0; i < _thePuzzle.height; i++) {
        var row = [];
        for (var j = 0; j < _thePuzzle.width; j++) {
            row.push(getGrid(makeCell(i, j)));
        }
        _thePuzzle.answers.push(row)
    }
}

function loadGrid() {
    console.log("loading grid");
    _thePuzzle.grid = [];
    for (var i = 0; i < _thePuzzle.height; i++) {
        var row = [];
        for (var j = 0; j < _thePuzzle.width; j++) {
            row.push(_thePuzzle.answers[i][j]);
        }
        _thePuzzle.grid.push(row)
    }
    redrawPuzzle();
}


function clearGrid() {
    console.log("clearing grid");
    for (var i = 0; i < _thePuzzle.height; i++) {
        for (var j = 0; j < _thePuzzle.width; j++) {
            if (getGrid(makeCell(i, j)) !== BLACK) {
                setGrid(makeCell(i, j), WHITE)
            }
        }
    }
    redrawPuzzle();
}

function cellToLeft(c) {
    return makeCell(c.row, c.col - 1);
}

function cellAbove(c) {
    return makeCell(c.row - 1, c.col);
}


function makeClue(index, i, j) {
    return {index: index, row: i, col: j};
}

function startsAcrossClue(cell) {
    var l = cellToLeft(cell);
    return getGrid(cell) !== BLACK && (!inPuzzleBounds(l) || getGrid(l) === BLACK);
}

function startsDownClue(cell) {
    var a = cellAbove(cell);
    return getGrid(cell) !== BLACK && (!inPuzzleBounds(a) || getGrid(a) === BLACK);
}

function startsClueInCurrentDirection(cell) {
    if (cursor.direction == DOWN) {
        return startsDownClue(cell);
    } else {
        return startsAcrossClue(cell);
    }

}


function numberGrid() {
    console.log("numbering grid", _thePuzzle.clues);
    if (_thePuzzle.clues.length === 0 || confirm("Really renumber grid? Clues will be lost.")) {
        _thePuzzle.clues = [];
        for (var i = 0; i < _thePuzzle.height; i++) {
            for (var j = 0; j < _thePuzzle.width; j++) {
                var c = makeCell(i, j);
                var n = _thePuzzle.clues.length + 1;
                var clue = undefined;
                if (startsAcrossClue(c)) {
                    if (!clue) {
                        clue = makeClue(n, i, j);
                    }
                    clue.across = "TODO " + n;
                }
                if (startsDownClue(c)) {
                    if (!clue) {
                        clue = makeClue(n, i, j);
                    }
                    clue.down = "TODO " + n;
                }
                if (clue) {
                    _thePuzzle.clues.push(clue);
                }
            }
        }
    }
    redrawPuzzle();
}

function clueTool() {
    keyCallback = clueKeyCallback;
    $("#clue")
        .click(function (event) {
            if ($(this).find("input").length) {
                return;
            }

            var s = $(this).html();
            var inp = $("<input>")
                .attr({type: "text", size: "", value: s})
                .width("100%");
            $(this).empty().append(inp);
            inp.trigger("focus");
        })
        .focusout(function (event) {
            var s = $(this).find("input").val();
            if (s == "") {
                s = "TODO"
            }
            var clue = findCurrentClue();
            setClueTextForDirection(clue, s);
            $(this).empty();
            redrawPuzzle();
        });
}

function toggleAdvancedState() {
    if ($("#show-advanced").is(":checked")) {
        $(".advanced").show();
    } else {
        $(".advanced").hide();
    }
}

$(document).ready(function() {
    initPuzzle(_thePuzzle);
    buildGrid(_thePuzzle);

    $(".cell").click(function () {
        var cell = parseCellId($(this).attr("id"));
        if (cell !== undefined) {
            cellCallback(cell);
        }
    });

    $("body").keydown(onKeyDown);
    $("body").keyup(onKeyUp);

    $("#color-tool").click(colorTool);
    $("#answer-tool").click(answerTool);
    $("#clue-tool").click(clueTool);

    $("#save-grid").click(saveGrid);
    $("#load-grid").click(loadGrid);
    $("#clear-grid").click(clearGrid);
    $("#number-grid").click(numberGrid);

    $("#dump-json").click(dumpJSON);
    $("#load-json").click(loadJSON);
    $("#load-from-file").click(loadFile);

    $("#show-advanced").click(toggleAdvancedState);
    $(".advanced").hide();

    loadFile();
});
