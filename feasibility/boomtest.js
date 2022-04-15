const PIECE_TYPE_CAR = "CAR";
const PIECE_TYPE_HORSE = "HORSE";
const PIECE_TYPE_ELEPHANT = "ELEPHANT";
const PIECE_TYPE_GUARD = "GUARD";
const PIECE_TYPE_KING = "KING";
const PIECE_TYPE_CANNON = "CANNON";
const PIECE_TYPE_SOLDIER = "SOLDIER";

const PIECETYPE_2_MODEL_PATH = {
    "CAR": { rootUrl: "https://www.babylonjs.com/Assets/DamagedHelmet/glTF/", name: "DamagedHelmet.gltf" },
    "HORSE": { rootUrl: "https://www.babylonjs.com/Assets/DamagedHelmet/glTF/", name: "DamagedHelmet.gltf" },
    "ELEPHANT": { rootUrl: "https://www.babylonjs.com/Assets/DamagedHelmet/glTF/", name: "DamagedHelmet.gltf" },
    "GUARD": { rootUrl: "https://www.babylonjs.com/Assets/DamagedHelmet/glTF/", name: "DamagedHelmet.gltf" },
    "KING": { rootUrl: "https://www.babylonjs.com/Assets/DamagedHelmet/glTF/", name: "DamagedHelmet.gltf" },
    "CANNON": { rootUrl: "https://www.babylonjs.com/Assets/DamagedHelmet/glTF/", name: "DamagedHelmet.gltf" },
    "SOLDIER": { rootUrl: "https://www.babylonjs.com/Assets/DamagedHelmet/glTF/", name: "DamagedHelmet.gltf" },
};


function buildBoomSPS(model, scene) {
    const gravity = -0.05;                // gravity
    const radius = 2;                     // explosion radius
    const speed = 0.1;           // particle max speed
    const minY = -10;
    const numOfParticle = 30;

    // initialize SPS
    var sps = new BABYLON.SolidParticleSystem("sps", scene, { isPickable: true });
    sps.digest(model, { number: numOfParticle });
    model.dispose();
    var digestedMesh = sps.buildMesh();
    digestedMesh.material = model.material;
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


class PieceObj {
    constructor(scene, pieceType) {
        this.pieceType = pieceType;
        this.scene = scene;
        this.sps = null;
    }
    initAt(pos3d) {
        var model_path = PIECETYPE_2_MODEL_PATH[this.pieceType];
        BABYLON.SceneLoader.ImportMesh("", model_path.rootUrl, model_path.name, this.scene, (newMeshes) => {
            var model = newMeshes[1];
            var sps = buildBoomSPS(model, this.scene);
            sps.digestedMesh.position = pos3d;
            this.sps = sps;
        });
    }
    explode() {
        if (this.sps != null)
            this.sps.boomFrom(BABYLON.Vector3.Zero());
    }
    // move along axis by dis, axis: 0 x, 1 y, 2 z
    moveBy(dis, axis, onEnd) {
        var targetProp = "position.x";
        const tmpPos = this.sps.digestedMesh.position;
        var targetPropValueStart = tmpPos.x;
        switch (axis) {
            case 0: break;
            case 1:
                targetProp = "position.y";
                targetPropValueStart = tmpPos.y;
                break;
            case 2:
                targetProp = "position.z";
                targetPropValueStart = tmpPos.z;
                break;
            default:
                break;
        }
        BABYLON.Animation.CreateAndStartAnimation(
            "tmp", this.sps.digestedMesh, targetProp, 60,
            20, targetPropValueStart, targetPropValueStart + dis,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
            new BABYLON.PowerEase(4), onEnd, this.scene
        );
    }
};

var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("camera1", 0, Math.PI / 3, 15, BABYLON.Vector3.Zero(), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Our built-in 'ground' shape.
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 60, height: 60 }, scene);
    ground.position.y = -4;

    var pieceCar = new PieceObj(scene, PIECE_TYPE_CAR);
    pieceCar.initAt(new BABYLON.Vector3(0, 1, 0));
    var pieceCar2 = new PieceObj(scene, PIECE_TYPE_CANNON);
    pieceCar2.initAt(new BABYLON.Vector3(-10, 1, 0));

    setTimeout(() => {
        pieceCar.moveBy(-10, 0, () => {
            pieceCar2.explode();
            setTimeout(() => {
                pieceCar2.sps.digestedMesh.dispose();
            }, 500);
        });
    }, 4000);

    return scene;
};

