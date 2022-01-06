import {
    BufferGeometry, Color, Line, LineBasicMaterial, MathUtils, Mesh, MeshBasicMaterial, MeshPhongMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Raycaster, Scene, Vector2, Vector3, WebGLRenderer
} from "./three.js/build/three.module.js";

function boardMultiBoxTest() {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    const camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1500);
    camera.position.set(0, 400, 320);
    camera.lookAt(0, 0, 20);

    const scene = new Scene();
    scene.background = new Color(0xdddddd);

    const pointLight = new PointLight(0xffffff);
    pointLight.position.set(-100, 300, 100);
    scene.add(pointLight);

    const rollOverCube = new Mesh(new PlaneGeometry(30, 30),
        new MeshPhongMaterial({ color: 0x3399dd, opacity: 0.5, transparent: true }));
    rollOverCube.rotateX(MathUtils.degToRad(-90));
    scene.add(rollOverCube);


    const rayCaster = new Raycaster();
    const pointer = new Vector2(0, 0);
    const objects = [];

    const plane = new Mesh(new PlaneGeometry(1000, 1000), new MeshBasicMaterial({ color: 0x999999 }));
    plane.rotateX(MathUtils.degToRad(-90));
    plane.visible = false;
    scene.add(plane);
    objects.push(plane);

    const boardInfo = drawBoard(scene);

    {
        // boardInfo.allPoints.forEach(point => {
        //     let plane = new Mesh(new PlaneGeometry(20, 20), new MeshPhongMaterial({ color: 0xdd5500, side: DoubleSide }));
        //     plane.position.copy(point.setZ(point.z));
        //     plane.rotation.x = MathUtils.degToRad(90);
        //     scene.add(plane);
        // });
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
        renderer.render(scene, camera);
    }
    function onWindowResize() {
        // windowHalfX = window.innerWidth / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function onPointerMove(event) {
        pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
        rayCaster.setFromCamera(pointer, camera);
        const intersects = rayCaster.intersectObjects(objects);
        if (intersects.length > 0) {
            const intersect = intersects[0];
            boardInfo.allPoints.forEach((point, i) => {
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

function drawBoard(scene) {
    const HORIZONTAL_SPACE = 40;
    const VERTICAL_SPACE = 40;
    const CHUHE_HANJIE_SPACE = 60;

    const LINE_WIDTH = 1; // 线宽实际上总是1

    const BOARD_WIDTH = HORIZONTAL_SPACE * 8 + LINE_WIDTH * 9;
    const BOARD_DEPTH = VERTICAL_SPACE * 4 * 2 + CHUHE_HANJIE_SPACE + LINE_WIDTH * 5 * 2;

    const BOARD_Y = 0;

    const BING_PAO_SEG_LENGTH = 5;
    const BING_PAO_SEG_SPACE = 2;

    const LINE_COLOR = 0x3333dd;

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
                posOfBing.push(new Vector3(-BOARD_WIDTH / 2 + (LINE_WIDTH + HORIZONTAL_SPACE) * i * 2, BOARD_Y, z));
                posOfBing.push(new Vector3(-BOARD_WIDTH / 2 + (LINE_WIDTH + HORIZONTAL_SPACE) * i * 2, BOARD_Y, -z));
            }
        }
        let posOfPao = [];
        { // posOfPao
            let z = CHUHE_HANJIE_SPACE / 2 + (LINE_WIDTH + VERTICAL_SPACE) * 2;
            posOfPao = [
                new Vector3(-BOARD_WIDTH / 2 + LINE_WIDTH + HORIZONTAL_SPACE, BOARD_Y, z),
                new Vector3(BOARD_WIDTH / 2 - LINE_WIDTH * 2 - HORIZONTAL_SPACE, BOARD_Y, z),
                new Vector3(-BOARD_WIDTH / 2 + LINE_WIDTH + HORIZONTAL_SPACE, BOARD_Y, -z),
                new Vector3(BOARD_WIDTH / 2 - LINE_WIDTH * 2 - HORIZONTAL_SPACE, BOARD_Y, -z),
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
                    new Vector3(xLeft, BOARD_Y, zUp - BING_PAO_SEG_LENGTH),
                    new Vector3(xLeft, BOARD_Y, zUp),
                    new Vector3(xLeft - BING_PAO_SEG_LENGTH, BOARD_Y, zUp)
                ],
                [
                    new Vector3(xLeft, BOARD_Y, zDown + BING_PAO_SEG_LENGTH),
                    new Vector3(xLeft, BOARD_Y, zDown),
                    new Vector3(xLeft - BING_PAO_SEG_LENGTH, BOARD_Y, zDown)
                ],
                [
                    new Vector3(xRight, BOARD_Y, zUp - BING_PAO_SEG_LENGTH),
                    new Vector3(xRight, BOARD_Y, zUp),
                    new Vector3(xRight + BING_PAO_SEG_LENGTH, BOARD_Y, zUp)
                ],
                [
                    new Vector3(xRight, BOARD_Y, zDown + BING_PAO_SEG_LENGTH),
                    new Vector3(xRight, BOARD_Y, zDown),
                    new Vector3(xRight + BING_PAO_SEG_LENGTH, BOARD_Y, zDown)
                ],
            ];
        };
        let makeBingPaoSegs = () => [].concat(posOfPao, posOfBing).map((point, i) => makeBingOrPaoSeg(point)).flat();

        let resSegments = [].concat(
            makePart(new Vector3(-BOARD_WIDTH / 2, BOARD_Y, CHUHE_HANJIE_SPACE / 2), true),
            makePart(new Vector3(-BOARD_WIDTH / 2, BOARD_Y, -CHUHE_HANJIE_SPACE / 2), false),
            makeBingPaoSegs(),
        );
        return resSegments;
    }
    function generateBoardInfo() {
        // 棋子的位置
        // 左 -> 右
        //   [ 車 马 相 士 将 士 相 马 車 ]
        //   [ 炮 炮 ]
        //   [ 兵 兵 兵 兵 兵 ]
        const postionOfPiece = {
            player: [],
            opponent: []
        };
        let allPoints = [];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 9; j++) {
                let point = new Vector3(
                    -BOARD_WIDTH / 2 + (LINE_WIDTH + HORIZONTAL_SPACE) * j,
                    BOARD_Y,
                    CHUHE_HANJIE_SPACE / 2 + (LINE_WIDTH + VERTICAL_SPACE) * i
                );
                allPoints.push(point.clone());
                allPoints.push(point.setZ(-point.z));
            }
        }
        return {
            postionOfPiece, allPoints,
            HORIZONTAL_SPACE, VERTICAL_SPACE, CHUHE_HANJIE_SPACE,
        }
    }
    drawSegments(makeSegments(), scene);
    const boardInfo = generateBoardInfo();
    return boardInfo;
}

boardMultiBoxTest();
