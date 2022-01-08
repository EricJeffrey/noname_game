import {
    BoxGeometry, BufferGeometry, Color, Line,
    LineBasicMaterial, MathUtils, Mesh, MeshBasicMaterial,
    MeshLambertMaterial, MeshPhongMaterial,
    PerspectiveCamera, PlaneGeometry, PointLight,
    Raycaster, Scene, Vector2, Vector3, WebGLRenderer,
    DoubleSide, SphereGeometry, DodecahedronGeometry,
    CylinderGeometry, IcosahedronGeometry, ConeGeometry, OctahedronGeometry, TorusGeometry,
} from "./three.js/build/three.module.js";
import { OrbitControls } from "./three.js/examples/jsm/controls/OrbitControls.js"

function boardMultiBoxTest() {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);


    const camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1500);
    camera.position.set(0, 400, 360);
    camera.lookAt(0, 0, 60);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    const scene = new Scene();
    scene.background = new Color(0xdddddd);

    const pointLight = new PointLight(0xffffff);
    pointLight.position.set(-100, 300, 100);
    pointLight.castShadow = true;
    scene.add(pointLight);

    const rollOverCube = new Mesh(new PlaneGeometry(30, 30),
        new MeshPhongMaterial({ color: 0x3399dd, opacity: 0.5, transparent: true }));
    rollOverCube.rotateX(MathUtils.degToRad(-90));
    rollOverCube.castShadow = true;
    scene.add(rollOverCube);

    const rayCaster = new Raycaster();
    const pointer = new Vector2(0, 0);
    const rayCasterObjects = [];

    const plane = new Mesh(new PlaneGeometry(1000, 1000), new MeshBasicMaterial({ color: 0x999999 }));
    plane.rotateX(MathUtils.degToRad(-90));
    plane.visible = false;
    scene.add(plane);
    rayCasterObjects.push(plane);

    const boardInfo = addBoard(scene);

    {
        console.log(boardInfo);
        const tmpObjects = {
            ju: new Mesh(new SphereGeometry(15, 32, 16), new MeshPhongMaterial({ color: 0xff0000 })),
            ma: new Mesh(new DodecahedronGeometry(10, 0), new MeshPhongMaterial({ color: 0x00ff00 })),
            xiang: new Mesh(new CylinderGeometry(5, 5, 20, 32), new MeshPhongMaterial({ color: 0x0000ff })),
            shi: new Mesh(new IcosahedronGeometry(10, 1), new MeshPhongMaterial({ color: 0xffff00 })),
            jiang: new Mesh(new ConeGeometry(10, 20, 6), new MeshPhongMaterial({ color: 0x333333 })),
            pao: new Mesh(new OctahedronGeometry(10, 0), new MeshPhongMaterial({ color: 0xff00ff })),
            bing: new Mesh(new TorusGeometry(10, 3, 5, 3, Math.PI * 2), new MeshPhongMaterial({ color: 0x00ffff })),
        };
        for (const key in boardInfo.posOfPiece) {
            let points = boardInfo.posOfPiece[key].flat(2);
            points.forEach((point) => {
                let v = tmpObjects[key];
                v.castShadow = true;
                v.position.copy(point);
                v.position.setY(15);
                scene.add(v.clone());
            });
        }
    }

    document.body.appendChild(renderer.domElement);
    window.addEventListener("resize", onWindowResize);
    window.addEventListener("mousemove", onPointerMove);

    animate();

    function animate() {
        requestAnimationFrame(animate);
        render();
    }
    function render() {
        controls.update();
        renderer.render(scene, camera);
    }
    function onWindowResize() {
        // windowHalfX = window.innerWidth / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        // camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function onPointerMove(event) {
        pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
        rayCaster.setFromCamera(pointer, camera);
        const intersects = rayCaster.intersectObjects(rayCasterObjects);
        if (intersects.length > 0) {
            const intersect = intersects[0];
            boardInfo.allPoints.flat(1).forEach((point, i) => {
                let insideBox = (target, boxCenter) => {
                    return target.x >= boxCenter.x - 20 && target.x <= boxCenter.x + 20 &&
                        target.z >= boxCenter.z - 20 && target.z <= boxCenter.z + 20;
                };
                if (insideBox(intersect.point, point)) {
                    rollOverCube.position.copy(point);
                }
            });
        }
    }
}

function addBoard(scene) {
    const HORIZONTAL_SPACE = 40;
    const VERTICAL_SPACE = 40;
    const CHUHE_HANJIE_SPACE = 60;

    const LINE_WIDTH = 1; // 线宽实际上总是1

    const BOARD_WIDTH = HORIZONTAL_SPACE * 8 + LINE_WIDTH * 9;
    const BOARD_HEIGHT = 2;
    const BOARD_DEPTH = VERTICAL_SPACE * 4 * 2 + CHUHE_HANJIE_SPACE + LINE_WIDTH * 5 * 2;

    const BOARD_LINE_Y = 2;

    const BING_PAO_SEG_LENGTH = 5;
    const BING_PAO_SEG_SPACE = 2;

    const LINE_COLOR = 0x0033ff;

    const boardInfo = {
        posOfPiece: {}, allPoints: [],
        HORIZONTAL_SPACE, VERTICAL_SPACE, CHUHE_HANJIE_SPACE,
    };

    function drawBoard() {
        let board = new Mesh(
            new BoxGeometry(BOARD_WIDTH, BOARD_HEIGHT, BOARD_DEPTH),
            new MeshLambertMaterial({ color: 0xffff22 })
        );
        board.castShadow = true;
        board.receiveShadow = true;
        scene.add(board);
    }
    function drawSegments(segments) {
        let makeLine = (points, colorInHex) => {
            let buffer = new BufferGeometry();
            buffer.setFromPoints(points);
            return new Line(buffer, new LineBasicMaterial({ color: colorInHex }));
        };
        for (let i = 0; i < segments.length; i++) {
            const points = segments[i];
            const line = makeLine(points, LINE_COLOR);
            scene.add(line);
        }
    }
    function makeSegments() {
        let posOfBing = [];
        { // posOfBing
            for (let i = 0; i < 5; i += 1) {
                let z = CHUHE_HANJIE_SPACE / 2 + LINE_WIDTH + VERTICAL_SPACE;
                posOfBing.push(new Vector3(-BOARD_WIDTH / 2 + (LINE_WIDTH + HORIZONTAL_SPACE) * i * 2, BOARD_LINE_Y, z));
                posOfBing.push(new Vector3(-BOARD_WIDTH / 2 + (LINE_WIDTH + HORIZONTAL_SPACE) * i * 2, BOARD_LINE_Y, -z));
            }
        }
        let posOfPao = [];
        { // posOfPao
            let z = CHUHE_HANJIE_SPACE / 2 + (LINE_WIDTH + VERTICAL_SPACE) * 2;
            posOfPao = [
                new Vector3(-BOARD_WIDTH / 2 + LINE_WIDTH + HORIZONTAL_SPACE, BOARD_LINE_Y, z),
                new Vector3(BOARD_WIDTH / 2 - LINE_WIDTH * 2 - HORIZONTAL_SPACE, BOARD_LINE_Y, z),
                new Vector3(-BOARD_WIDTH / 2 + LINE_WIDTH + HORIZONTAL_SPACE, BOARD_LINE_Y, -z),
                new Vector3(BOARD_WIDTH / 2 - LINE_WIDTH * 2 - HORIZONTAL_SPACE, BOARD_LINE_Y, -z),
            ];
        }

        let makePart = (startPoint, zIncrease = true) => {
            let segments = [];
            for (let i = 0; i < 5; i++) {
                let z = startPoint.z + (LINE_WIDTH + VERTICAL_SPACE) * i * (zIncrease ? 1 : -1);
                segments.push([
                    new Vector3(startPoint.x, startPoint.y, z),
                    new Vector3(startPoint.x + (LINE_WIDTH + HORIZONTAL_SPACE) * 8, startPoint.y, z)
                ]);
            }
            for (let i = 0; i < 9; i++) {
                let x = startPoint.x + (LINE_WIDTH + HORIZONTAL_SPACE) * i;
                segments.push([
                    new Vector3(x, startPoint.y, startPoint.z),
                    new Vector3(x, startPoint.y, startPoint.z + (LINE_WIDTH + VERTICAL_SPACE) * 4 * (zIncrease ? 1 : -1))]
                );
            }
            return segments;
        };

        let makeBingOrPaoSeg = (point) => {
            let xLeft = point.x - BING_PAO_SEG_SPACE;
            let xRight = point.x + BING_PAO_SEG_SPACE;
            let zUp = point.z - BING_PAO_SEG_SPACE;
            let zDown = point.z + BING_PAO_SEG_SPACE;
            return [
                [
                    new Vector3(xLeft, BOARD_LINE_Y, zUp - BING_PAO_SEG_LENGTH),
                    new Vector3(xLeft, BOARD_LINE_Y, zUp),
                    new Vector3(xLeft - BING_PAO_SEG_LENGTH, BOARD_LINE_Y, zUp)
                ],
                [
                    new Vector3(xLeft, BOARD_LINE_Y, zDown + BING_PAO_SEG_LENGTH),
                    new Vector3(xLeft, BOARD_LINE_Y, zDown),
                    new Vector3(xLeft - BING_PAO_SEG_LENGTH, BOARD_LINE_Y, zDown)
                ],
                [
                    new Vector3(xRight, BOARD_LINE_Y, zUp - BING_PAO_SEG_LENGTH),
                    new Vector3(xRight, BOARD_LINE_Y, zUp),
                    new Vector3(xRight + BING_PAO_SEG_LENGTH, BOARD_LINE_Y, zUp)
                ],
                [
                    new Vector3(xRight, BOARD_LINE_Y, zDown + BING_PAO_SEG_LENGTH),
                    new Vector3(xRight, BOARD_LINE_Y, zDown),
                    new Vector3(xRight + BING_PAO_SEG_LENGTH, BOARD_LINE_Y, zDown)
                ],
            ];
        };
        let makeBingPaoSegs = () => [].concat(posOfPao, posOfBing).map((point, i) => makeBingOrPaoSeg(point)).flat();

        let resSegments = [].concat(
            makePart(new Vector3(-BOARD_WIDTH / 2, BOARD_LINE_Y, CHUHE_HANJIE_SPACE / 2), true),
            makePart(new Vector3(-BOARD_WIDTH / 2, BOARD_LINE_Y, -CHUHE_HANJIE_SPACE / 2), false),
            makeBingPaoSegs(),
        );
        return resSegments;
    }
    function generateBoardInfo() {
        let playerPoints = [];
        let opponentPoints = [];
        for (let i = 0; i < 5; i++) {
            playerPoints.push([]);
            opponentPoints.push([]);
            for (let j = 0; j < 9; j++) {
                let point = new Vector3(
                    -BOARD_WIDTH / 2 + (LINE_WIDTH + HORIZONTAL_SPACE) * j,
                    BOARD_LINE_Y,
                    CHUHE_HANJIE_SPACE / 2 + (LINE_WIDTH + VERTICAL_SPACE) * i
                );
                playerPoints[i].push(point.clone());
                opponentPoints[i].push(point.setZ(-point.z));
            }
        }
        let posOfPiece = {
            // 我方 对手方, 左 -> 右
            ju: [
                [playerPoints[4][0], playerPoints[4][8]],
                [opponentPoints[4][0], opponentPoints[4][8]]
            ],
            ma: [
                [playerPoints[4][1], playerPoints[4][7]],
                [opponentPoints[4][1], opponentPoints[4][7]]
            ],
            xiang: [
                [playerPoints[4][2], playerPoints[4][6]],
                [opponentPoints[4][2], opponentPoints[4][6]]
            ],
            shi: [
                [playerPoints[4][3], playerPoints[4][5]],
                [opponentPoints[4][3], opponentPoints[4][5]]
            ],
            jiang: [
                [playerPoints[4][4]], [opponentPoints[4][4]]
            ],
            pao: [
                [playerPoints[2][1], playerPoints[2][7]],
                [opponentPoints[2][1], opponentPoints[2][7]]
            ],
            bing: [
                [playerPoints[1][0], playerPoints[1][2], playerPoints[1][4], playerPoints[1][6], playerPoints[1][8],],
                [opponentPoints[1][0], opponentPoints[1][2], opponentPoints[1][4], opponentPoints[1][6], opponentPoints[1][8]]
            ],
        };
        boardInfo.posOfPiece = posOfPiece;
        boardInfo.allPoints = [].concat(playerPoints, opponentPoints);
    }

    drawSegments(makeSegments());
    drawBoard();
    generateBoardInfo();

    return boardInfo;
}

boardMultiBoxTest();
