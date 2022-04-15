
const PIECE_TYPE_CAR = "CAR";
const PIECE_TYPE_HORSE = "HORSE";
const PIECE_TYPE_ELEPHANT = "ELEPHANT";
const PIECE_TYPE_GUARD = "GUARD";
const PIECE_TYPE_KING = "KING";
const PIECE_TYPE_CANNON = "CANNON";
const PIECE_TYPE_SOLDIER = "SOLDIER";

const PIECE_BELONG_RED = "RED";
const PIECE_BELONG_BLUE = "BLUE";

const BAORD_STATUS_ONGOING = 0;
const BAORD_STATUS_CHECKED = 1;

class Piece {
    constructor(pieceType, pieceBelong) {
        this.pieceType = pieceType;
        this.pieceBelong = pieceBelong;
    }
};

class Board {
    constructor() {
        this.board = [];
        for (let i = 0; i < 9; i++) {
            this.board.push([]);
            for (let j = 0; j < 10; j++) {
                this.board[i].push(null);
            }
        }
        this.status = BAORD_STATUS_ONGOING;
        this.pieceBlueLost = [];
        this.pieceRedLost = [];
        this.initBoard();
    }
    initBoard() {
        this.board[0][0] = new Piece(PIECE_TYPE_CAR, PIECE_BELONG_BLUE);
        this.board[8][0] = new Piece(PIECE_TYPE_CAR, PIECE_BELONG_BLUE);
        this.board[1][0] = new Piece(PIECE_TYPE_HORSE, PIECE_BELONG_BLUE);
        this.board[7][0] = new Piece(PIECE_TYPE_HORSE, PIECE_BELONG_BLUE);
        this.board[2][0] = new Piece(PIECE_TYPE_ELEPHANT, PIECE_BELONG_BLUE);
        this.board[6][0] = new Piece(PIECE_TYPE_ELEPHANT, PIECE_BELONG_BLUE);
        this.board[3][0] = new Piece(PIECE_TYPE_GUARD, PIECE_BELONG_BLUE);
        this.board[5][0] = new Piece(PIECE_TYPE_GUARD, PIECE_BELONG_BLUE);
        this.board[4][0] = new Piece(PIECE_TYPE_KING, PIECE_BELONG_BLUE);
        this.board[1][2] = new Piece(PIECE_TYPE_CANNON, PIECE_BELONG_BLUE);
        this.board[7][2] = new Piece(PIECE_TYPE_CANNON, PIECE_BELONG_BLUE);
        for (let i = 0; i < 5; i++) {
            this.board[i * 2][3] = new Piece(PIECE_TYPE_SOLDIER, PIECE_BELONG_BLUE);
        }
        this.board[0][9] = new Piece(PIECE_TYPE_CAR, PIECE_BELONG_RED);
        this.board[8][9] = new Piece(PIECE_TYPE_CAR, PIECE_BELONG_RED);
        this.board[1][9] = new Piece(PIECE_TYPE_HORSE, PIECE_BELONG_RED);
        this.board[7][9] = new Piece(PIECE_TYPE_HORSE, PIECE_BELONG_RED);
        this.board[2][9] = new Piece(PIECE_TYPE_ELEPHANT, PIECE_BELONG_RED);
        this.board[6][9] = new Piece(PIECE_TYPE_ELEPHANT, PIECE_BELONG_RED);
        this.board[3][9] = new Piece(PIECE_TYPE_GUARD, PIECE_BELONG_RED);
        this.board[5][9] = new Piece(PIECE_TYPE_GUARD, PIECE_BELONG_RED);
        this.board[4][9] = new Piece(PIECE_TYPE_KING, PIECE_BELONG_RED);
        this.board[1][7] = new Piece(PIECE_TYPE_CANNON, PIECE_BELONG_RED);
        this.board[7][7] = new Piece(PIECE_TYPE_CANNON, PIECE_BELONG_RED);
        for (let i = 0; i < 5; i++) {
            this.board[i * 2][6] = new Piece(PIECE_TYPE_SOLDIER, PIECE_BELONG_BLUE);
        }
    }
};

var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 50, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    var pl = new BABYLON.PointLight("", new BABYLON.Vector3(10, 100, -80), scene);
    pl.intensity = 0.8;
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 600, height: 600 }, scene);


    function putBoxAt(pos3d, scene) {
        var box = BABYLON.MeshBuilder.CreateBox("name", { size: 0.5, height: 0.5, width: 0.5 }, scene);
        var mat = new BABYLON.StandardMaterial("mat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.3, 0.4, 0.6);
        box.material = mat;
        box.position = pos3d;
        return box;
    }


    var board = new Board();
    for (let x = 0; x < board.board.length; x++) {
        for (let y = 0; y < board.board[x].length; y++) {
            if (board.board[x][y] != null)
                putBoxAt(new BABYLON.Vector3(x * 4, 1, y * 5));
        }
    }

    return scene;
};