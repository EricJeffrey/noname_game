var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera(
        "camera", -Math.PI / 2, Math.PI / 5, 60, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Our built-in 'ground' shape.
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 600, height: 600 }, scene);
    var gridMat = new BABYLON.GridMaterial("gridMat", scene);
    ground.material = gridMat;

    const BOOM_OPTION = {
        gravity: -0.05, radius: 1, speed: 0.55,
        minY: -10, numOfParticle: 30, disposeTimeout: 800,
    };
    function buildBoomSPS(model, scene) {
        const gravity = BOOM_OPTION.gravity;
        const radius = BOOM_OPTION.radius;
        const speed = BOOM_OPTION.speed;
        const minY = BOOM_OPTION.minY;
        const numOfParticle = BOOM_OPTION.numOfParticle;
        const disposeTimeout = BOOM_OPTION.disposeTimeout;

        // initialize SPS
        var sps = new BABYLON.SolidParticleSystem("sps", scene, { isPickable: true });
        sps.digest(model, { number: numOfParticle });
        model.dispose();
        var digestedMesh = sps.buildMesh();
        digestedMesh.material = model.material;
        digestedMesh.position = model.position;
        digestedMesh.scaling = model.scaling;
        sps.setParticles();
        sps.refreshVisibleSize();
        sps.vars = {
            target: BABYLON.Vector3.Zero(),
            tmp: BABYLON.Vector3.Zero(),
            justClicked: false,
            radius: radius,
            minY: minY,
            boom: false,
        };
        var beforeRender = () => sps.setParticles();
        // set update function of each particles
        sps.updateParticle = function (p) {
            if (sps.vars.justClicked) {
                p.position.subtractToRef(sps.vars.target, sps.vars.tmp);
                var len = sps.vars.tmp.length();
                var scl = (len < 0.001) ? 1.0 : sps.vars.radius / len;
                sps.vars.tmp.normalize();
                p.velocity.x += sps.vars.tmp.x * scl * speed * (1 + Math.random() * 0.3);
                p.velocity.y += sps.vars.tmp.y * scl * speed * (1 + Math.random() * 0.3);
                p.velocity.z += sps.vars.tmp.z * scl * speed * (1 + Math.random() * 0.3);
                p.rand = Math.random() / 100;
                if (p.idx == sps.nbParticles - 1)
                    sps.vars.justClicked = false;
            }
            if (sps.vars.boom && !sps.vars.justClicked) {
                if (p.position.y < sps.vars.minY) {
                    p.position.y = sps.vars.minY;
                    p.velocity.setAll(0);
                } else {
                    p.velocity.y += gravity;
                    p.position.addInPlace(p.velocity);
                    p.rotation.x += (p.velocity.z) * p.rand;
                    p.rotation.y += (p.velocity.x) * p.rand;
                    p.rotation.z += (p.velocity.y) * p.rand;
                }
            }
        };
        function boomFrom(center) {
            scene.registerBeforeRender(beforeRender);
            setTimeout(() => {
                digestedMesh.dispose();
            }, disposeTimeout);
            sps.vars.boom = true;
            sps.vars.target = center;
            sps.vars.justClicked = true;
        }
        return { sps, digestedMesh, boomFrom };
    }

    let names = ["car.glb", "horse.glb", "elephant.glb",
        "knight.glb", "king.glb", "cannon.glb", "zombie.glb"];
    let scales = [
        new BABYLON.Vector3(200, 200, 200),
        new BABYLON.Vector3(0.1, 0.05, 0.05),
        new BABYLON.Vector3(0.01, 0.01, 0.005),
        new BABYLON.Vector3(0.03, 0.03, 0.03),
        new BABYLON.Vector3(4, 4, 4),
        new BABYLON.Vector3(0.003, 0.003, 0.003),
        new BABYLON.Vector3(5,5,5),
    ];
    let which = 0;
    BABYLON.SceneLoader.ImportMeshAsync("", "models/", names[which], scene).then((res) => {
        console.log(res);
        let mesh = res.meshes[1];
        if (res.meshes.length > 2) {
            res.meshes.shift();
            mesh = BABYLON.Mesh.MergeMeshes(res.meshes)
        }
        mesh.updateFacetData();
        const scale = scales[which];
        mesh.scaling = scale;
        let boundInfo = mesh.getBoundingInfo();
        let sizeBelowZero = (0 - boundInfo.minimum.y) * scale.y;
        console.log(sizeBelowZero)
        mesh.position = new BABYLON.Vector3(0, sizeBelowZero, 0);
        let sps = buildBoomSPS(mesh, scene);
        // setTimeout(() => {
        //     sps.boomFrom(BABYLON.Vector3.Zero())
        // }, 1000);
    });

    return scene;
};