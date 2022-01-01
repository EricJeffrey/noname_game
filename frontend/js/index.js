import * as THREE from "./three.js/build/three.module.js";


const scene = new THREE.Scene();
scene.background = 0xffffff;

const geometryBackground = new THREE.PlaneGeometry(100, 100);
const materialBackground = new THREE.MeshPhongMaterial({ color: 0x8822aa });
const background = new THREE.Mesh(geometryBackground, materialBackground);
background.receiveShadow = true;
background.position.set(0, 0, -3);
scene.add(background);

// 板子一号
const geometryBoard = new THREE.BoxGeometry(30, 2, 30);
const materialBoard = new THREE.MeshPhongMaterial({ color: 0x339922 });
const board = new THREE.Mesh(geometryBoard, materialBoard);
board.position.set(0, -5, 0);
scene.add(board);

// 一个锥体
const geometryCone = new THREE.ConeGeometry(2, 2, 3);
const materialCone = new THREE.MeshPhongMaterial({ color: 0x337777 });
const cone = new THREE.Mesh(geometryCone, materialCone);
cone.position.set(-3, 2, -1);
cone.castShadow = true;
cone.receiveShadow = true;
scene.add(cone);

// 一个立方体
const geometryCube = new THREE.BoxGeometry(3, 3, 3);
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
camera.position.set(0, 4, 40);
// camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.y += 0.01;
    cone.rotation.z += 0.01;
    board.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

