

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    // var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    var camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2, Math.PI / 5, 60,
        new BABYLON.Vector3(18, 2, 18), scene);
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 10, 0), scene);
    light.intensity = 0.5;
    // var pl = new BABYLON.PointLight("pl", new BABYLON.Vector3(-20, 100, 10), scene);

    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 600, height: 600 }, scene);
    ground.position.y = -0.1;
    var gridMat = new BABYLON.GridMaterial("gridMat", scene);
    ground.material = gridMat;

    // init

    // init board
    var board = [];
    for (let i = 0; i < 9; i++) {
        board.push([]);
        for (let j = 0; j < 10; j++) {
            board[i].push({
                pieceType: null,
                belong: null,
                isSelected: false,
            });
        }
    }

    const PIECE_TYPE_CAR = "CAR";
    const PIECE_TYPE_HORSE = "HORSE";
    const PIECE_TYPE_ELEPHANT = "ELEPHANT";
    const PIECE_TYPE_GUARD = "GUARD";
    const PIECE_TYPE_KING = "KING";
    const PIECE_TYPE_CANNON = "CANNON";
    const PIECE_TYPE_SOLDIER = "SOLDIER";

    const PIECE_BELONG_RED = "RED";
    const PIECE_BELONG_BLUE = "BLUE";

    // init piece
    (function () {
        board[0][0] = { pieceType: PIECE_TYPE_CAR, belong: PIECE_BELONG_BLUE, isSelected: false };
        board[8][0] = { pieceType: PIECE_TYPE_CAR, belong: PIECE_BELONG_BLUE, isSelected: false };
        board[1][0] = { pieceType: PIECE_TYPE_HORSE, belong: PIECE_BELONG_BLUE, isSelected: false };
        board[7][0] = { pieceType: PIECE_TYPE_HORSE, belong: PIECE_BELONG_BLUE, isSelected: false };
        board[2][0] = { pieceType: PIECE_TYPE_ELEPHANT, belong: PIECE_BELONG_BLUE, isSelected: false };
        board[6][0] = { pieceType: PIECE_TYPE_ELEPHANT, belong: PIECE_BELONG_BLUE, isSelected: false };
        board[3][0] = { pieceType: PIECE_TYPE_GUARD, belong: PIECE_BELONG_BLUE, isSelected: false };
        board[5][0] = { pieceType: PIECE_TYPE_GUARD, belong: PIECE_BELONG_BLUE, isSelected: false };
        board[4][0] = { pieceType: PIECE_TYPE_KING, belong: PIECE_BELONG_BLUE, isSelected: false };
        board[1][2] = { pieceType: PIECE_TYPE_CANNON, belong: PIECE_BELONG_BLUE, isSelected: false };
        board[7][2] = { pieceType: PIECE_TYPE_CANNON, belong: PIECE_BELONG_BLUE, isSelected: false };
        for (let i = 0; i < 5; i++) {
            board[i * 2][3] = { pieceType: PIECE_TYPE_SOLDIER, belong: PIECE_BELONG_BLUE, isSelected: false };
        }
        board[0][9] = { pieceType: PIECE_TYPE_CAR, belong: PIECE_BELONG_RED, isSelected: false };
        board[8][9] = { pieceType: PIECE_TYPE_CAR, belong: PIECE_BELONG_RED, isSelected: false };
        board[1][9] = { pieceType: PIECE_TYPE_HORSE, belong: PIECE_BELONG_RED, isSelected: false };
        board[7][9] = { pieceType: PIECE_TYPE_HORSE, belong: PIECE_BELONG_RED, isSelected: false };
        board[2][9] = { pieceType: PIECE_TYPE_ELEPHANT, belong: PIECE_BELONG_RED, isSelected: false };
        board[6][9] = { pieceType: PIECE_TYPE_ELEPHANT, belong: PIECE_BELONG_RED, isSelected: false };
        board[3][9] = { pieceType: PIECE_TYPE_GUARD, belong: PIECE_BELONG_RED, isSelected: false };
        board[5][9] = { pieceType: PIECE_TYPE_GUARD, belong: PIECE_BELONG_RED, isSelected: false };
        board[4][9] = { pieceType: PIECE_TYPE_KING, belong: PIECE_BELONG_RED, isSelected: false };
        board[1][7] = { pieceType: PIECE_TYPE_CANNON, belong: PIECE_BELONG_RED, isSelected: false };
        board[7][7] = { pieceType: PIECE_TYPE_CANNON, belong: PIECE_BELONG_RED, isSelected: false };
        for (let i = 0; i < 5; i++) {
            board[i * 2][6] = { pieceType: PIECE_TYPE_SOLDIER, belong: PIECE_BELONG_RED, isSelected: false };
        }
    })();


    // DEBUG light beam
    {
        var zeroBox = BABYLON.MeshBuilder.CreateBox("zb", { width: 0.1, height: 20, depth: 0.1 }, scene);
        var zeroMat = new BABYLON.StandardMaterial("zm", scene);
        zeroMat.emissiveColor = BABYLON.Color3.Green();
        zeroBox.material = zeroMat;
        zeroBox.position = BABYLON.Vector3.Zero();
    }

    const PIECE_SIZE = 4;
    const BOARD_PLANE_Y = 2;
    const BOARD_WIDTH = PIECE_SIZE * 9;
    const BOARD_HALF_DEPTH = PIECE_SIZE * 5;
    const BOARD_RIVER_DEPTH = 2 * PIECE_SIZE;
    var boardBlueBox, boardRedBox;;
    // draw board
    {
        var drawHalfBoard = (name, lbPos3d, width, height, depth) => {
            var boardBox = BABYLON.MeshBuilder.CreateBox(
                name, { width: width, height: height, depth: depth }, scene
            );
            boardBox.position = lbPos3d.add(new BABYLON.Vector3(
                (width - PIECE_SIZE) / 2,
                height / 2,
                (depth - PIECE_SIZE) / 2));
            // var sandTexture = new BABYLON.Texture("textures/sand.jpg", scene);
            var boardMat = new BABYLON.StandardMaterial(name + "mat", scene);
            // boardBlueMat.diffuseTexture = sandTexture;
            boardMat.diffuseColor = new BABYLON.Color3(0.94, 0.76, 0.16);
            boardBox.material = boardMat;
            for (let i = 0; i < 9; i++) {
                BABYLON.MeshBuilder.CreateLines("l" + i, {
                    points: [
                        new BABYLON.Vector3(lbPos3d.x + i * PIECE_SIZE, BOARD_PLANE_Y + 0.1, lbPos3d.z),
                        new BABYLON.Vector3(lbPos3d.x + i * PIECE_SIZE, BOARD_PLANE_Y + 0.1, lbPos3d.z + 4 * PIECE_SIZE),
                    ], colors: [
                        new BABYLON.Color4(0.47, 0.97, 0.97, 0.9),
                        new BABYLON.Color4(0.01, 1, 1, 0.5)]
                }, scene)
            }
            for (let i = 0; i < 5; i++) {
                BABYLON.MeshBuilder.CreateLines("l" + i, {
                    points: [
                        new BABYLON.Vector3(lbPos3d.x, BOARD_PLANE_Y + 0.1, lbPos3d.z + i * PIECE_SIZE),
                        new BABYLON.Vector3(lbPos3d.x + 8 * PIECE_SIZE, BOARD_PLANE_Y + 0.1, lbPos3d.z + i * PIECE_SIZE),
                    ], colors: [
                        new BABYLON.Color4(0.3, 0.8, 0.8, 0.9),
                        new BABYLON.Color4(0.3, 0.8, 0.8, 0.5)]
                }, scene)
            }
            return boardBox;
        };
        // leave one PIECE_SIZE each side
        boardBlueBox = drawHalfBoard(
            "boardblue",
            BABYLON.Vector3.Zero(),
            BOARD_WIDTH,
            BOARD_PLANE_Y,
            BOARD_HALF_DEPTH
        );
        boardRedBox = drawHalfBoard(
            "boardred",
            new BABYLON.Vector3(
                0,
                0,
                BOARD_HALF_DEPTH - PIECE_SIZE / 2 + BOARD_RIVER_DEPTH + PIECE_SIZE / 2),
            BOARD_WIDTH,
            BOARD_PLANE_Y,
            BOARD_HALF_DEPTH
        );
        // draw water
        (function () {
            // river
            var riverTexture = new BABYLON.Texture("textures/sand.jpg", scene);
            // riverTexture.vScale = riverTexture.uScale = 4.0;
            var riverMaterial = new BABYLON.StandardMaterial("rivermat", scene);
            riverMaterial.diffuseTexture = riverTexture;
            var river = BABYLON.MeshBuilder.CreateGround(
                "riverbed",
                { width: BOARD_WIDTH, height: BOARD_RIVER_DEPTH },
                scene
            );
            river.position = new BABYLON.Vector3(
                (BOARD_WIDTH - PIECE_SIZE) / 2, 0, BOARD_HALF_DEPTH - PIECE_SIZE / 2 + BOARD_RIVER_DEPTH / 2);
            river.material = riverMaterial;
            // Water
            var waterMesh = BABYLON.MeshBuilder.CreateGround(
                "waterMesh",
                { width: BOARD_WIDTH, height: BOARD_RIVER_DEPTH },
                scene
            );
            waterMesh.position = river.position.clone();
            waterMesh.position.y = BOARD_PLANE_Y;
            var water = new BABYLON.WaterMaterial(
                "water",
                scene,
                new BABYLON.Vector2(1024, 1024));
            water.backFaceCulling = true;
            water.bumpTexture = new BABYLON.Texture("textures/waterbump.png", scene);
            water.windForce = -51;
            water.waveHeight = 0;
            water.bumpHeight = 0.1;
            water.waveLength = 0.4;
            water.colorBlendFactor = 0;
            water.addToRenderList(river);
            waterMesh.material = water;

        })();
    }
    // draw piece
    var pieceMeshSet = new Set();
    {
        var calcPiecePos = (i, j) => {
            var lbPos = new BABYLON.Vector3(0, BOARD_PLANE_Y + PIECE_SIZE / 4, 0);
            if (j >= 5)
                lbPos.z = BOARD_HALF_DEPTH - PIECE_SIZE / 2 + BOARD_RIVER_DEPTH + PIECE_SIZE / 2;
            lbPos.x += i * PIECE_SIZE;
            lbPos.z += j % 5 * PIECE_SIZE
            return lbPos;
        };
        var drawPiece = (pieceInfo, pos3d) => {
            // use text as pieceType for now
            var pieceText = new BABYLON.DynamicTexture("dynamic texture", { width: 20, height: 20 }, scene);
            pieceText.drawText(
                pieceInfo.pieceType, 0, 12,
                "bold 10px Consolas",
                "white",
                pieceInfo.belong == PIECE_BELONG_BLUE ? "blue" : "red",
                true, true
            );
            var piece = BABYLON.MeshBuilder.CreateBox("p", { size: PIECE_SIZE / 2 })
            var pieceMat = new BABYLON.StandardMaterial("pmat", scene);
            pieceMat.diffuseTexture = pieceText;
            piece.material = pieceMat;
            piece.position = pos3d;
            return piece;
        };
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].pieceType != null) {
                    let pos3d = calcPiecePos(i, j);
                    var piece = drawPiece(board[i][j], pos3d);
                    board[i][j].mesh = piece;
                    pieceMeshSet.add(piece);
                }
            }
        }
    }

    // return if a pos (x,y) is pickable to a piece
    function isPickable(pieceInfo, x, y) {
        // TODO
    }

    // return a list of (x,y) that the piece can move to
    function getPickablePos(x, y, pieceInfo) {
        // Two kings should not meet along a line
        // TODO
        return [];
    }

    const NEXT_RED = "RED";
    const NEXT_BLUE = "BLUE";
    var whoNext = NEXT_BLUE;

    // if checkmate now
    function isChecked() {
        let pieceBelong = whoNext == NEXT_BLUE ? PIECE_BELONG_RED : PIECE_BELONG_BLUE;
        let kingBelong = whoNext == NEXT_BLUE ? PIECE_BELONG_BLUE : PIECE_BELONG_RED;
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                if (board[x][y].belong == pieceBelong &&
                    board[x][y].pieceType != PIECE_TYPE_KING) {
                    let pickablePos = getPickablePos(x, y, board[x][y]);
                    for (let i = 0; i < pickablePos.length; i++) {
                        let tmpPieceInfo = board[pickablePos.x][pickablePos.y];
                        if (tmpPieceInfo.pieceType != null &&
                            tmpPieceInfo.belong == kingBelong &&
                            tmpPieceInfo.pieceType == PIECE_TYPE_KING)
                            return true;
                    }
                }
            }
        }
        return false;
    }

    // enter |PICKED| status when left mouse
    const BOARD_STATUS_PIECE_PICKED = "PIECE_PICKED";
    const BOARD_STATUS_CHECKING = "CHECKING";
    const BOARD_STATUS_CHECKED = "CHECKED";
    const BOARD_STATUS_PLAYING = "PLAYING";
    var boardStatus = BOARD_STATUS_PLAYING;

    var hintBox = BABYLON.MeshBuilder.CreateBox("hint", { size: 2*PIECE_SIZE/3, height: 0.1 });
    hintBox.visibility = 0;
    {
        let hintMat = new BABYLON.StandardMaterial("hintmat", scene);
        hintMat.emissiveColor = new BABYLON.Color4(0, 0.58, 0.97);
        hintBox.material = hintMat;
    }
    var lastHoverInfo = { mesh: null, color: null };
    function pointerMove() {
        // playing, highlight when hover on piece
        if (boardStatus == BOARD_STATUS_PLAYING ||
            boardStatus == BOARD_STATUS_CHECKING) {
            var tmpPickInfo = scene.pick(
                scene.pointerX, scene.pointerY, (mesh) => {
                    return pieceMeshSet.has(mesh);
                }
            );
            if (tmpPickInfo.hit) {
                if (lastHoverInfo.mesh != null)
                    lastHoverInfo.mesh.material.diffuseColor = lastHoverInfo.color;
                lastHoverInfo.mesh = tmpPickInfo.pickedMesh;
                lastHoverInfo.color = tmpPickInfo.pickedMesh.material.diffuseColor.clone();
                tmpPickInfo.pickedMesh.material.diffuseColor = BABYLON.Color3.Green();
            } else {
                if (lastHoverInfo.mesh != null)
                    lastHoverInfo.mesh.material.diffuseColor = lastHoverInfo.color;
                lastHoverInfo.mesh = null;
            }
        } else if (boardStatus == BOARD_STATUS_PIECE_PICKED) {
            var tmpPickInfo = scene.pick(
                scene.pointerX, scene.pointerY, (mesh) => {
                    return mesh == boardRedBox || mesh == boardBlueBox;
                }
            );
            if (tmpPickInfo.hit) {
                let curPoint = tmpPickInfo.pickedPoint;
                let targetX = Math.round(curPoint.x / PIECE_SIZE) * PIECE_SIZE;
                let targetZ = Math.round(curPoint.z / PIECE_SIZE) * PIECE_SIZE;
                
                hintBox.position = new BABYLON.Vector3(targetX, BOARD_PLANE_Y, targetZ);
                hintBox.visibility = 1;
            }
        }
    }

    function pointerDown(pickInfo) {
        // TODO
        if (boardStatus == BOARD_STATUS_PLAYING) {
            if (pieceMeshSet.has(pickInfo.pickedMesh)) {
                boardStatus = BOARD_STATUS_PIECE_PICKED;
            }
        }
        if (boardStatus == BOARD_STATUS_PIECE_PICKED) {

        }
    }

    scene.onPointerObservable.add((pointerInfo, evtState) => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERMOVE:
                pointerMove();
                break;
            case BABYLON.PointerEventTypes.POINTERDOWN:
                pointerDown(pointerInfo.pickInfo);
                break;
            default:
                break;
        }
    });

    return scene;
};






