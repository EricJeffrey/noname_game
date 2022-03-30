import * as THREE from "./three.js/build/three.module.js";


function rayCasterTest() {

    let intersected;
    let pointer = new THREE.Vector2();

    let cube;

    let scene = new THREE.Scene();

    // add objects to scene
    {
        const geometryCube = new THREE.BoxGeometry(3, 1, 3);
        const materialCube = new THREE.MeshLambertMaterial({ color: 0x9988dd })
        cube = new THREE.Mesh(geometryCube, materialCube);
        cube.position.set(0, 2, 2);
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.add(cube);
    }
    {
        const geometryCube = new THREE.BoxGeometry(30, 1, 30);
        const materialCube = new THREE.MeshLambertMaterial({ color: 0x22dddd })
        const cube = new THREE.Mesh(geometryCube, materialCube);
        cube.position.set(0, 0, 0);
        cube.receiveShadow = true;
        scene.add(cube);

    }
    {
        const light = new THREE.DirectionalLight();
        light.position.set(-3, 5, 10);
        light.castShadow = true;
        scene.add(light);
    }

    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 8, 26);

    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // mouse move
    function onPointerMove(event) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = 1 - (event.clientY / window.innerHeight) * 2;
    }
    document.addEventListener("click", onPointerMove);

    let rayCaster = new THREE.Raycaster();

    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.y += 0.01;

        rayCaster.setFromCamera(pointer, camera);
        const intersects = rayCaster.intersectObjects(scene.children, false);
        // console.log(intersects);
        if (intersects.length > 0) {
            if (intersected != intersects[0].object) {
                // if (intersected)
                //     intersected.material.emissive.setHex(intersected.currentHex);
                intersected = intersects[0].object;
                intersected.currentHex = intersected.material.emissive.getHex();
                // intersected.material.emissive.setHex(0xff0000);
                cube.position.x = intersects[0].point.x;
                cube.position.y = intersects[0].point.y;
                cube.position.z = intersects[0].point.z + 2;
            }
        } else {
            // if (intersected)
            //     intersected.material.emissive.setHex(intersected.currentHex);
            intersected = null;
        }

        renderer.render(scene, camera);
    }
    animate();
}
rayCasterTest();