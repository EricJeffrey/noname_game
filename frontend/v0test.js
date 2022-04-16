

var createScene = function () {

    const PIECE_TYPE_CAR = "CAR";
    const PIECE_TYPE_HORSE = "HORSE";
    const PIECE_TYPE_ELEPHANT = "ELEPHANT";
    const PIECE_TYPE_GUARD = "GUARD";
    const PIECE_TYPE_KING = "KING";
    const PIECE_TYPE_CANNON = "CANNON";
    const PIECE_TYPE_SOLDIER = "SOLDIER";

    const CAMP_RED = "RED";
    const CAMP_BLUE = "BLUE";

    const BOARD_STATUS_PLAYING = "PLAYING";
    const BOARD_STATUS_PIECE_PICKED = "PIECE_PICKED";
    const BOARD_STATUS_CHECKING = "CHECKING";
    const BOARD_STATUS_DECHECKING = "DECHECKING";

    // !!! chessBoard should NOT contain nested Object !!!
    var chessBoard = [];
    var posOfRedKing = { x: 4, y: 9 };
    var posOfBlueKing = { x: 4, y: 0 };

    var graveOfBlue = [];
    var graveOfRed = [];

    var curCamp = CAMP_BLUE;
    var boardStatus = BOARD_STATUS_PLAYING;
    // internal chess mechanism
    {

        // init board
        (function (chessBoard) {
            for (let i = 0; i < 9; i++) {
                chessBoard.push([]);
                for (let j = 0; j < 10; j++) {
                    chessBoard[i].push({
                        pieceType: null,
                        belong: null,
                        isSelected: false,
                    });
                }
            }
        })(chessBoard);

        // init piece
        (function (chessBoard) {
            chessBoard[0][0] = { pieceType: PIECE_TYPE_CAR, belong: CAMP_BLUE };
            chessBoard[8][0] = { pieceType: PIECE_TYPE_CAR, belong: CAMP_BLUE };
            chessBoard[1][0] = { pieceType: PIECE_TYPE_HORSE, belong: CAMP_BLUE };
            chessBoard[7][0] = { pieceType: PIECE_TYPE_HORSE, belong: CAMP_BLUE };
            chessBoard[2][0] = { pieceType: PIECE_TYPE_ELEPHANT, belong: CAMP_BLUE };
            chessBoard[6][0] = { pieceType: PIECE_TYPE_ELEPHANT, belong: CAMP_BLUE };
            chessBoard[3][0] = { pieceType: PIECE_TYPE_GUARD, belong: CAMP_BLUE };
            chessBoard[5][0] = { pieceType: PIECE_TYPE_GUARD, belong: CAMP_BLUE };
            chessBoard[4][0] = { pieceType: PIECE_TYPE_KING, belong: CAMP_BLUE };
            chessBoard[1][2] = { pieceType: PIECE_TYPE_CANNON, belong: CAMP_BLUE };
            chessBoard[7][2] = { pieceType: PIECE_TYPE_CANNON, belong: CAMP_BLUE };
            for (let i = 0; i < 5; i++) {
                chessBoard[i * 2][3] = { pieceType: PIECE_TYPE_SOLDIER, belong: CAMP_BLUE };
            }
            chessBoard[0][9] = { pieceType: PIECE_TYPE_CAR, belong: CAMP_RED };
            chessBoard[8][9] = { pieceType: PIECE_TYPE_CAR, belong: CAMP_RED };
            chessBoard[1][9] = { pieceType: PIECE_TYPE_HORSE, belong: CAMP_RED };
            chessBoard[7][9] = { pieceType: PIECE_TYPE_HORSE, belong: CAMP_RED };
            chessBoard[2][9] = { pieceType: PIECE_TYPE_ELEPHANT, belong: CAMP_RED };
            chessBoard[6][9] = { pieceType: PIECE_TYPE_ELEPHANT, belong: CAMP_RED };
            chessBoard[3][9] = { pieceType: PIECE_TYPE_GUARD, belong: CAMP_RED };
            chessBoard[5][9] = { pieceType: PIECE_TYPE_GUARD, belong: CAMP_RED };
            chessBoard[4][9] = { pieceType: PIECE_TYPE_KING, belong: CAMP_RED };
            chessBoard[1][7] = { pieceType: PIECE_TYPE_CANNON, belong: CAMP_RED };
            chessBoard[7][7] = { pieceType: PIECE_TYPE_CANNON, belong: CAMP_RED };
            for (let i = 0; i < 5; i++) {
                chessBoard[i * 2][6] = { pieceType: PIECE_TYPE_SOLDIER, belong: CAMP_RED };
            }
        })(chessBoard);

        // helper used by canMoveTo
        let helper = (function () {
            function canCarMoveTo(x1, y1, x2, y2, chessBoard) {
                if (x1 != x2 && y1 != y2)
                    return false;
                if (chessBoard[x2][y2].belong == chessBoard[x1][y1].belong)
                    return false;
                if (x1 != x2) {
                    let start = Math.min(x1, x2), end = Math.max(x1, x2);
                    for (let i = start + 1; i < end; i++) {
                        if (chessBoard[i][y1].pieceType != null)
                            return false;
                    }
                }
                if (y1 != y2) {
                    let start = Math.min(y1, y2), end = Math.max(y1, y2);
                    for (let i = start + 1; i < end; i++) {
                        if (chessBoard[x1][i].pieceType != null)
                            return false;
                    }
                }
                return true;
            };
            function canHorseMoveTo(x1, y1, x2, y2, chessBoard) {
                let absx = Math.abs(x1 - x2), absy = Math.abs(y1 - y2);
                if (absx == 1 && absy == 2) {
                    if (y1 < y2 && chessBoard[x1][y1 + 1].pieceType == null)
                        return true;
                    if (y1 > y2 && chessBoard[x1][y1 - 1].pieceType == null)
                        return true;
                }
                if (absx == 2 && absy == 1) {
                    if (x1 < x2 && chessBoard[x1 + 1][y1].pieceType == null)
                        return true;
                    if (x1 > x2 && chessBoard[x1 - 1][y1].pieceType == null)
                        return true;
                }
                return false;
            };
            function canElephMoveTo(x1, y1, x2, y2, chessBoard) {
                if (y1 <= 4 && y2 <= 4 || y1 > 4 && y2 > 4) {
                    let absx = Math.abs(x1 - x2), absy = Math.abs(y1 - y2);
                    if (absx == absy &&
                        absx == 2 &&
                        chessBoard[(x1 + x2) / 2][(y1 + y2) / 2].pieceType == null)
                        return true;
                }
                return false;
            };
            function canGuardMoveTo(x1, y1, x2, y2, chessBoard) {
                if (x1 >= 3 && x1 <= 5 && x2 >= 3 && x2 <= 5) {
                    if ((y1 <= 2 && y2 <= 2) || (y1 >= 7 && y2 >= 7)) {
                        console.log("here")
                        let absx = Math.abs(x1 - x2), absy = Math.abs(y1 - y2);
                        if (absx == 1 && absy == 1 &&
                            chessBoard[x2][y2].pieceType == null)
                            return true;
                    }
                }
                return false;
            };
            function canKingMoveTo(x1, y1, x2, y2, chessBoard) {
                if (x1 >= 3 && x1 <= 5 && x2 >= 3 && x2 <= 5) {
                    if ((y1 <= 2 && y2 <= 2) || (y1 >= 7 && y2 >= 7)) {
                        let absx = Math.abs(x1 - x2), absy = Math.abs(y1 - y2);
                        if (absx + absy <= 1 &&
                            chessBoard[x2][y2].pieceType == null)
                            return true;
                    }
                }
                return false;
            };
            function canCannonMoveTo(x1, y1, x2, y2, chessBoard) {
                if (x1 != x2 && y1 != y2)
                    return false;
                if (chessBoard[x2][y2].pieceType == null)
                    return canCarMoveTo(x1, y1, x2, y2, chessBoard);
                let cnt = 0;
                if (x1 != x2) {
                    let start = Math.min(x1, x2), end = Math.max(x1, x2);
                    for (let i = start + 1; i < end; i++) {
                        if (chessBoard[i][y1].pieceType != null) {
                            cnt += 1;
                        }
                    }
                }
                if (y1 != y2) {
                    let start = Math.min(y1, y2), end = Math.max(y1, y2);
                    for (let i = start + 1; i < end; i++) {
                        if (chessBoard[x1][i].pieceType != null) {
                            cnt += 1;
                        }
                    }
                }
                return cnt == 1;

            };
            function canSoldierMoveTo(x1, y1, x2, y2, chessBoard) {
                let pieceInfo = chessBoard[x1][y1];
                if (pieceInfo.belong == CAMP_BLUE && y1 < 4)
                    return x1 == x2 && y2 - y1 == 1;
                if (pieceInfo.belong == CAMP_RED && y1 > 4)
                    return x1 == x2 && y1 - y2 == 1;
                if (y1 <= y2 && Math.abs(x1 - x2) + Math.abs(y1 - y2) <= 1)
                    return true;
                return false;
            };
            return {
                canCarMoveTo, canHorseMoveTo,
                canElephMoveTo, canGuardMoveTo,
                canKingMoveTo, canCannonMoveTo, canSoldierMoveTo
            };
        })();

        // if piece can move to pos(x, y)
        var canMoveTo = function (x1, y1, x2, y2, chessBoard) {
            if (x1 < 0 || x2 < 0 || y1 < 0 || y2 < 0
                || x1 > 8 || x2 > 8 || y1 > 9 || y2 > 9)
                return false;
            if (x1 == x2 && y1 == y2)
                return false;
            let pieceInfo = chessBoard[x1][y1];
            if (chessBoard[x2][y2].belong != null &&
                chessBoard[x2][y2].belong == pieceInfo.belong)
                return false;
            console.log("canmoveto", x1, y1, x2, y2);
            switch (pieceInfo.pieceType) {
                case PIECE_TYPE_CAR:
                    return helper.canCarMoveTo(x1, y1, x2, y2, chessBoard);
                case PIECE_TYPE_HORSE:
                    return helper.canHorseMoveTo(x1, y1, x2, y2, chessBoard);
                case PIECE_TYPE_ELEPHANT:
                    return helper.canElephMoveTo(x1, y1, x2, y2, chessBoard);
                case PIECE_TYPE_GUARD:
                    return helper.canGuardMoveTo(x1, y1, x2, y2, chessBoard);
                case PIECE_TYPE_KING:
                    return helper.canKingMoveTo(x1, y1, x2, y2, chessBoard);
                case PIECE_TYPE_CANNON:
                    return helper.canCannonMoveTo(x1, y1, x2, y2, chessBoard);
                case PIECE_TYPE_SOLDIER:
                    return helper.canSoldierMoveTo(x1, y1, x2, y2, chessBoard);
                default:
                    console.warn("INVALID PIECE_TYPE");
            }
            return false;
        }

        // if checkmate now
        var isChecked = function (camp = curCamp, chessBoard, posOfKing) {
            let xOfKing = posOfKing.x, yOfKing = posOfKing.y;
            for (let x = 0; x < chessBoard.length; x++) {
                for (let y = 0; y < chessBoard[x].length; y++) {
                    let pieceInfo = chessBoard[x][y];
                    if (pieceInfo.belong == camp &&
                        pieceInfo.pieceType != PIECE_TYPE_KING &&
                        pieceInfo.pieceType != PIECE_TYPE_GUARD &&
                        pieceInfo.pieceType != PIECE_TYPE_ELEPHANT) {
                        if (canMoveTo(x, y, xOfKing, yOfKing, chessBoard))
                            return true;
                    }
                }
            }
            return false;
        }

        // move piece at (x1, y1) to (x2, y2)
        var moveTo = function (x1, y1, x2, y2, chessBoard) {
            let pieceInfo1 = chessBoard[x1][y1];
            let pieceInfo2 = chessBoard[x2][y2];
            if (pieceInfo2.pieceType != null)
                (pieceInfo2.belong == CAMP_BLUE ? graveOfBlue : graveOfRed).push(pieceInfo2);
            chessBoard[x2][y2] = pieceInfo1;
            if (pieceInfo1.pieceType == PIECE_TYPE_KING) {
                if (pieceInfo1.belong == CAMP_BLUE)
                    posOfBlueKing = { x: x2, y: y2 };
                else
                    posOfRedKing = { x: x2, y: y2 };
            }
        }

        // if move piece at (x1,y1) to (x2,y2) can help the king
        var canDeCheckmate = function (x1, y1, x2, y2) {
            if (pieceInfo.belong == curCamp &&
                canMoveTo(x1, y1, x2, y2, chessBoard)) {
                let tmpBoard = [];
                for (let i = 0; i < chessBoard.length; i++) {
                    tmpBoard.push([]);
                    for (let j = 0; j < chessBoard[i].length; j++) {
                        let tmp = {};
                        tmpBoard.push(Object.assign(tmp, chessBoard[i][j]));
                    }
                }
                var posOfKing = {};
                Object.assign(posOfKing, curCamp == CAMP_BLUE ? posOfBlueKing : posOfRedKing);
                if (tmpBoard[x1][y1].pieceType == PIECE_TYPE_KING
                    && tmpBoard[x1][y1].belong == curCamp) {
                    posOfKing = { x: x2, y: y2 };
                }
                tmpBoard[x2][y2] = tmpBoard[x1][y1];
                if (!isChecked(curCamp, tmpBoard, posOfKing)) return true;
            }
            return false;
        }
    }

    // babylon game mechanism
    const PIECE_SIZE = 4;
    const BOARD_PLANE_Y = 2;
    const BOARD_WIDTH = PIECE_SIZE * 9;
    const BOARD_HALF_DEPTH = PIECE_SIZE * 5;
    const BOARD_RIVER_DEPTH = 2 * PIECE_SIZE;

    var scene = new BABYLON.Scene(engine);
    var chessBoardMeshes = [];

    // !!! NO Nesting Object !!!
    var pickingInfo = {
        pickedMesh: null,
        x: 0, y: 0,
    };
    {
        // camera ground light
        {
            var camera = new BABYLON.ArcRotateCamera(
                "camera",
                -Math.PI / 2, Math.PI / 5, 60,
                new BABYLON.Vector3(18, 2, 18), scene);
            camera.attachControl(canvas, true);

            var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 10, 0), scene);
            light.intensity = 0.5;

            var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 600, height: 600 }, scene);
            ground.position.y = -0.1;
            var gridMat = new BABYLON.GridMaterial("gridMat", scene);
            ground.material = gridMat;

            // DEBUG light beam
            {
                var zeroBox = BABYLON.MeshBuilder.CreateBox("zb", { width: 0.1, height: 20, depth: 0.1 }, scene);
                var zeroMat = new BABYLON.StandardMaterial("zm", scene);
                zeroMat.emissiveColor = BABYLON.Color3.Green();
                zeroBox.material = zeroMat;
                zeroBox.position = BABYLON.Vector3.Zero();
            }
        }

        var boardBlueBox, boardRedBox;;
        // draw board
        {
            let drawHalfBoard = (name, lbPos3d, width, height, depth) => {
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
            // draw river
            {
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
            }
        }

        var pieceMeshSet = new Set();
        // draw piece
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
                    pieceInfo.belong == CAMP_BLUE ? "blue" : "red",
                    true, true
                );
                var piece = BABYLON.MeshBuilder.CreateBox("p", { size: PIECE_SIZE / 2 })
                var pieceMat = new BABYLON.StandardMaterial("pmat", scene);
                pieceMat.diffuseTexture = pieceText;
                piece.material = pieceMat;
                piece.position = pos3d;
                return piece;
            };
            for (let i = 0; i < chessBoard.length; i++) {
                chessBoardMeshes.push([]);
                for (let j = 0; j < chessBoard[i].length; j++) {
                    chessBoardMeshes[i].push(null);
                    if (chessBoard[i][j].pieceType != null) {
                        let pos3d = calcPiecePos(i, j);
                        var piece = drawPiece(chessBoard[i][j], pos3d);
                        // chessBoard[i][j].mesh = piece;
                        chessBoardMeshes[i][j] = piece;
                        pieceMeshSet.add(piece);
                    }
                }
            }
        }

        var hintBox = BABYLON.MeshBuilder.CreateBox("hint", { size: 2 * PIECE_SIZE / 3, height: 0.2 });
        {
            hintBox.visibility = 0.3;
            let hintMat = new BABYLON.StandardMaterial("hintmat", scene);
            hintMat.emissiveColor = new BABYLON.Color3(0, 0.16, 0.26);
            hintBox.material = hintMat;
        }

        let uiHelper = (function () {
            let lastHoverInfo = { mesh: null, color: null };

            // FIXME: highlight a piece at pos(x, y) with color
            // FIXME: recover a piece at pos(x, y)
            function highlightPiece(mesh, color, recoverLast = true) {
                if (recoverLast)
                    unHighlightLastPiece();
                lastHoverInfo.mesh = mesh;
                lastHoverInfo.color = mesh.material.diffuseColor;
                mesh.material.diffuseColor = color;
            }
            function unHighlightLastPiece() {
                if (lastHoverInfo.mesh != null) {
                    lastHoverInfo.mesh.material.diffuseColor = lastHoverInfo.color;
                    lastHoverInfo.mesh = null;
                }
            }
            function highlightPos(pos3d) {
                let targetX = Math.round(pos3d.x / PIECE_SIZE) * PIECE_SIZE;
                let targetZ = Math.round(pos3d.z / PIECE_SIZE) * PIECE_SIZE;
                hintBox.position = new BABYLON.Vector3(targetX, BOARD_PLANE_Y, targetZ);
                hintBox.visibility = 0.5;
            }
            function pos3d2BoardPos(pos3d) {
                let x = pos3d.x, y = pos3d.z;
                x = Math.round(x / PIECE_SIZE);
                y = Math.round(y / PIECE_SIZE);
                if (y > 4) y = y - BOARD_RIVER_DEPTH / PIECE_SIZE;
                return { x, y };
            }
            function unHighlightPos() {
                hintBox.visibility = 0;
            }

            return {
                highlightPiece, unHighlightLastPiece, highlightPos,
                pos3d2BoardPos, unHighlightPos
            };
        })();

        function pointerMove() {
            let piecePickInfo = scene.pick(
                scene.pointerX, scene.pointerY, (mesh) => pieceMeshSet.has(mesh)
            );
            switch (boardStatus) {
                case BOARD_STATUS_CHECKING:
                case BOARD_STATUS_PLAYING:
                    if (piecePickInfo.hit) {
                        uiHelper.highlightPiece(piecePickInfo.pickedMesh,
                            BABYLON.Color3.Green(), true)
                    } else {
                        uiHelper.unHighlightLastPiece();
                    }
                    break;
                case BOARD_STATUS_DECHECKING:
                case BOARD_STATUS_PIECE_PICKED:
                    let boardPickInfo = scene.pick(
                        scene.pointerX, scene.pointerY, (mesh) => {
                            return mesh == boardRedBox || mesh == boardBlueBox;
                        }
                    );
                    if (boardPickInfo.hit) {
                        let pos = uiHelper.pos3d2BoardPos(boardPickInfo.pickedPoint);
                        console.log("pos", pos);
                        let pickedPiece = chessBoardMeshes[pos.x][pos.y];
                        let whichToLight = -1;
                        if (pickedPiece != null) {
                            if (pickedPiece != pickingInfo.pickedMesh &&
                                canMoveTo(pickingInfo.x, pickingInfo.y, pos.x, pos.y, chessBoard)) {
                                whichToLight = 1;
                            }
                        } else {
                            if (canMoveTo(pickingInfo.x, pickingInfo.y, pos.x, pos.y, chessBoard))
                                whichToLight = 0;
                        }
                        if (whichToLight == 1)
                            uiHelper.highlightPiece(pickedPiece, BABYLON.Color3.Black(), true);
                        else if (whichToLight == 0)
                            uiHelper.highlightPos(boardPickInfo.pickedPoint);
                        else {
                            uiHelper.unHighlightPos();
                        }
                    }
                    break;
                default:
                    console.warn("INVALID BOARD STATUS");
            }
        }

        function pointerDown(pickInfo) {
            // TODO
            if (boardStatus == BOARD_STATUS_PLAYING) {
                if (pieceMeshSet.has(pickInfo.pickedMesh)) {
                    let pos = uiHelper.pos3d2BoardPos(pickInfo.pickedPoint);
                    pickingInfo.pickedMesh = pickInfo.pickedMesh;
                    pickingInfo.x = pos.x, pickingInfo.y = pos.y;
                    uiHelper.highlightPiece(pickInfo.pickedMesh,
                        BABYLON.Color3.Green(), true);
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
    }

    return scene;
};






