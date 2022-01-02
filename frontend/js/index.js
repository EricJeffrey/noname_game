import * as THREE from "./three.js/build/three.module.js";

function basicAnimateTest() {
    const scene = new THREE.Scene();
    scene.background = 0xffffff;
    const geometryBackground = new THREE.PlaneGeometry(300, 300);
    const materialBackground = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const background = new THREE.Mesh(geometryBackground, materialBackground);
    // background.receiveShadow = true;
    background.position.set(0, 0, -20);
    scene.add(background);

    // 板子
    const geometryBoard = new THREE.BoxGeometry(30, 2, 60);
    const materialBoard = new THREE.MeshPhongMaterial({ color: 0x339922 });
    const board = new THREE.Mesh(geometryBoard, materialBoard);
    board.receiveShadow = true;
    board.position.set(0, -4, -20);
    scene.add(board);

    // 一个锥体
    const geometryCone = new THREE.ConeGeometry(1, 2, 3);
    const materialCone = new THREE.MeshPhongMaterial({ color: 0x337777 });
    const cone = new THREE.Mesh(geometryCone, materialCone);
    cone.position.set(-3, 0, -1);
    cone.castShadow = true;
    cone.receiveShadow = true;
    scene.add(cone);

    // 一个立方体
    const geometryCube = new THREE.BoxGeometry(2, 2, 2);
    const materialCube = new THREE.MeshPhongMaterial({ color: 0x0056dd });
    const cube = new THREE.Mesh(geometryCube, materialCube);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    scene.add(new THREE.AmbientLight(0xffffff));

    const light = new THREE.DirectionalLight();
    light.position.set(3, 4, 2);
    light.castShadow = true;
    light.shadow.camera.zoom = 1;
    scene.add(light);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.y += 0.01;
        cone.rotation.z += 0.01;
        // board.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

function mouseClickTest() {

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
        light.position.set(3, 3, 3);
        light.castShadow = true;
        scene.add(light);
    }

    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 20);

    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // mouse move
    function onPointerMove(event) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
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
                if (intersected)
                    intersected.material.emissive.setHex(intersected.currentHex);
                intersected = intersects[0].object;
                intersected.currentHex = intersected.material.emissive.getHex();
                intersected.material.emissive.setHex(0xff0000);
            }
            cube.position.x = intersects[0].point.x;
        } else {
            if (intersected)
                intersected.material.emissive.setHex(intersected.currentHex);
            intersected = null;
        }

        renderer.render(scene, camera);
    }
    animate();
}

// basicAnimateTest();
mouseClickTest();
