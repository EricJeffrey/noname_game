
var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    // var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 20, BABYLON.Vector3.Zero(), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 60, height: 60 }, scene);
    var gridMat = new BABYLON.GridMaterial("gridMat", scene);
    ground.material = gridMat;

    var box = BABYLON.MeshBuilder.CreateBox("box", { size: 1, height: 1 });

    setTimeout(() => {
        BABYLON.Animation.CreateAndStartAnimation(
            "test", box, "position",
            60, 40,
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(4, 0, 4),
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
            new BABYLON.PowerEase(4), null, scene
        )
    }, 1000);

    return scene;
};