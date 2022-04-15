var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 50, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    var pl = new BABYLON.PointLight("", new BABYLON.Vector3(10, 100, -80), scene);
    pl.intensity = 0.8;
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 60, height: 60 }, scene);


    const PIECE_TYPE_CAR = "CAR";
    const PIECE_TYPE_HORSE = "HORSE";
    const PIECE_TYPE_ELEPHANT = "ELEPHANT";
    const PIECE_TYPE_GUARD = "GUARD";
    const PIECE_TYPE_KING = "KING";
    const PIECE_TYPE_CANNON = "CANNON";
    const PIECE_TYPE_SOLDIER = "SOLDIER";

    const PIECE_BELONG_RED = "RED";
    const PIECE_BELONG_BLUE = "BLUE";

    for (let i = 0; i < 10; i++) {
        var box = BABYLON.MeshBuilder.CreateBox("", {size: 0.1, height: 0.1, width: 8}, scene);
        box.position = new BABYLON.Vector3(0 + 4, 2, i);
        var mat = new BABYLON.StandardMaterial("", scene);
        mat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 1.0);
        mat.emissiveColor = mat.diffuseColor;
        box.material = mat;
    }
    for (let i = 0; i < 9; i++) {
        var box = BABYLON.MeshBuilder.CreateBox("", {size: 9, height: 0.1, width: 0.1}, scene);
        box.position = new BABYLON.Vector3(i, 2, 4.5);
        var mat = new BABYLON.StandardMaterial("", scene);
        mat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 1.0);
        mat.emissiveColor = mat.diffuseColor;
        box.material = mat;
    }
    
	// river
	var riverTexture = new BABYLON.Texture("textures/sand.jpg", scene);
	riverTexture.vScale = riverTexture.uScale = 4.0;
	var riverMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
	riverMaterial.diffuseTexture = riverTexture;
	var river = BABYLON.MeshBuilder.CreateGround("ground", {width: 8, height: 1}, scene);
	river.position = new BABYLON.Vector3(4, 2, 4.5);
	river.material = riverMaterial;
	// Water
	var waterMesh = BABYLON.MeshBuilder.CreateGround("waterMesh", {width: 8, height: 1}, scene);
    waterMesh.position = river.position.clone();
	var water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(1024, 1024));
	water.backFaceCulling = true;
	water.bumpTexture = new BABYLON.Texture("textures/waterbump.png", scene);
	water.windForce = -5;
	water.waveHeight = 0.5;
	water.bumpHeight = 0.1;
	water.waveLength = 0.1;
	water.colorBlendFactor = 0;
	// water.addToRenderList(skybox);
	water.addToRenderList(river);
	waterMesh.material = water;

    // [x=9][y=10]
    var board = new Array(9);
    for (let i = 0; i < board.length; i++) {
        board[i] = new Array(10);
        for (let j = 0; j < board[i].length; j++) {
            board[i][j] = { belong: "", type: "" };
        }
    }
    board[0][0] = board[8][0] = { belong: PIECE_BELONG_BLUE, type: PIECE_TYPE_CAR };
    board[0][9] = board[8][9] = { belong: PIECE_BELONG_RED, type: PIECE_TYPE_CAR };
    board[1][2] = board[7][2] = { belong: PIECE_BELONG_BLUE, type: PIECE_TYPE_CANNON };
    board[1][7] = board[7][7] = { belong: PIECE_BELONG_RED, type: PIECE_TYPE_CANNON };

    // ... todo

    function putBoxAt(pos3d, scene) {
        var box = BABYLON.MeshBuilder.CreateBox("name", { size: 0.5, height: 0.5, width: 0.5 }, scene);
        var mat = new BABYLON.StandardMaterial("mat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.3, 0.4, 0.6);
        box.material = mat;
        box.position = pos3d;
        return box;
    }
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[x].length; y++) {
            switch (board[x][y].type) {
                case PIECE_TYPE_CAR:
                    putBoxAt(new BABYLON.Vector3(x, 2, y), scene);
                    break;
                case PIECE_TYPE_CANNON:
                    putBoxAt(new BABYLON.Vector3(x, 2, y), scene);
                default:
                    break;
            }
        }
    }


    return scene;
};

