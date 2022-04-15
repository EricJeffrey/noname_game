var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    // var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -40), scene);
    var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 30, BABYLON.Vector3.Zero(), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Our built-in 'sphere' shape.
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1, segments: 32 }, scene);
    sphere.position = new BABYLON.Vector3(10, 0, 0);
    var mat = new BABYLON.StandardMaterial("mat", scene);
    mat.diffuseColor = BABYLON.Color3.Blue();
    sphere.material = mat;
    // Move the sphere upward 1/2 its height
    sphere.position.y = 0.5;

    // Our built-in 'ground' shape.
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 60, height: 60 }, scene);
    ground.position.y = 0;
    var gridMat = new BABYLON.GridMaterial("grid", scene);
    ground.material = gridMat;

    var hintBox = BABYLON.MeshBuilder.CreateBox("hint", { size: 1, width: 1, height: 1 });
    var hintMat = new BABYLON.StandardMaterial("hintmat", scene);
    hintMat.diffuseColor = new BABYLON.Color4(0.3, 0.4, 0.8, 0.5);
    hintBox.material = hintMat;

    function onPointerMove() {
        var pickOnGround = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh == ground);
        if (pickOnGround.hit) {
            var curPoint = pickOnGround.pickedPoint.clone();
            curPoint.x = Math.round(curPoint.x);
            curPoint.z = Math.round(curPoint.z);
            if (curPoint.x % 3 == 0 && curPoint.z % 2 == 0)
                hintBox.position = curPoint;
        }
        var pickOnSphere = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh == sphere);
        if (pickOnSphere.hit) {
            sphere.material.diffuseColor = BABYLON.Color3.Green();
        } else {
            mat.diffuseColor = BABYLON.Color3.Blue();
        }
    }
    scene.onPointerObservable.add((pointerInfo, evt) => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERMOVE:
                onPointerMove();
                break;
        }
    })

    return scene;
};