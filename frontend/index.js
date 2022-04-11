var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(.4, .6, .8);
    var camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
    camera.setPosition(new BABYLON.Vector3(0, 0, -100));
    camera.attachControl(canvas, true);
    // Lights
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    light.intensity = 0.2;
    var pl = new BABYLON.PointLight("pl", new BABYLON.Vector3(-80, 80, -80), scene);
    pl.diffuse = new BABYLON.Color3(1, 1, 1);
    pl.specular = BABYLON.Color3.Black();
    pl.intensity = 0.7;

    var ground = BABYLON.MeshBuilder.CreateGround("gr", { width: 2000, height: 4000 })
    ground.position.y = -50;

    function buildBoomSPS(model, mat, options) {
        const gravity = -0.05;                // gravity
        const radius = 10;                     // explosion radius
        const speed = 2;           // particle max speed
        const minY = -50;

        // initialize SPS
        var sps = new BABYLON.SolidParticleSystem("sps", scene, { isPickable: true });
        sps.digest(model, { facetNb: 4, delta: 160 });
        model.dispose();
        var digestedMesh = sps.buildMesh();
        digestedMesh.material = mat;
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
                if (p.idx == sps.nbParticles - 1) {
                    sps.vars.justClicked = false;
                }
            }
            if (sps.vars.boom && !sps.vars.justClicked) {
                if (p.position.y < sps.vars.minY) {
                    p.position.y = sps.vars.minY;
                    p.velocity.setAll(0);
                } else {
                    p.velocity.y += gravity;
                    p.position.x += p.velocity.x;
                    p.position.y += p.velocity.y;
                    p.position.z += p.velocity.z;

                    p.rotation.x += (p.velocity.z) * p.rand;
                    p.rotation.y += (p.velocity.x) * p.rand;
                    p.rotation.z += (p.velocity.y) * p.rand;
                }
            }
        };
        function boomFrom(center) {
            sps.vars.boom = true;
            sps.vars.target = center;
            sps.vars.justClicked = true;
        }
        scene.registerBeforeRender(() => sps.setParticles());
        return { sps, digestedMesh, boomFrom };
    }

    // var model = BABYLON.MeshBuilder.CreateTorusKnot("knot", { radius: 12, tube: 3,  tubularSegments: 64, radialSegments: 128});
    // model.rotation.y = -2;
    var mat = new BABYLON.StandardMaterial("mat", scene);
    mat.diffuseColor = new BABYLON.Color3.Green();
    BABYLON.SceneLoader.ImportMeshAsync("", "https://playground.babylonjs.com/scenes/Dude/", "Dude.babylon").then((result) => {
        // var model = BABYLON.Mesh.MergeMeshes(result.meshes);
        // var model = result.meshes[5];
        console.log(result);
        var model = BABYLON.Mesh.MergeMeshes([
            result.meshes[1], result.meshes[2], result.meshes[3], result.meshes[4], result.meshes[5],
        ], true)
        // model.updateFacetData();

        var boomSps = buildBoomSPS(model, mat);
        // boomSps.digestedMesh.position.setAll(0);
        // boomSps.digestedMesh.scaling = new BABYLON.Vector3(50, 50, 50);

        scene.onPointerDown = function (evt, pickResult) {

            var faceId = pickResult.faceId;
            if (pickResult.pickedMesh != boomSps.digestedMesh || faceId == -1) return;
            var idx = boomSps.sps.pickedParticles[faceId].idx;
            var p = boomSps.sps.particles[idx];
            console.log(idx);
            console.log(p);
            var center = new BABYLON.Vector3(0, 0, 0);
            camera.position.subtractToRef(p.position, center);
            center.normalize();
            center.scaleInPlace(boomSps.sps.vars.radius);
            center.addInPlace(p.position);
            boomSps.boomFrom(center);
        }

    });

    return scene;
}