import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

const loader = new GLTFLoader();


const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('../models/cat_tex.png');


let mixer;
const cat_ = new URL('../models/cat.glb', import.meta.url);
const assetLoader = new GLTFLoader();

loader.load(cat_.href, function(gltf) {
    //console.log("01");
    scene.add(gltf.scene);
    //console.log("11");
    mixer = new THREE.AnimationMixer(gltf.scene);
    gltf.animations.forEach((clip) => {
        console.log('Loaded animation clip:', clip.name);
        if (clip.name === 'jump') {
            jumpAction = mixer.clipAction(clip);
        } else if (clip.name === 'wave') {
            waveAction = mixer.clipAction(clip);
        }
    });

    // Optionally play all animations
    if (jumpAction) jumpAction.play();
    if (waveAction) waveAction.play();
    waveAction.paused = true;
    jumpAction.paused = true;
    

    // const waveHandAction = mixer.clipAction(gltf.animations.find(clip => clip.name === 'wave'));
    // const jumpAction = mixer.clipAction(gltf.animations.find(clip => clip.name === 'jump'));
    // //console.log("2");

    // waveHandAction.play();
    // jumpAction.play();

    // waveHandAction.paused = true;
    // jumpAction.paused = true;

    gltf.scene.userData.actions = { waveAction, jumpAction };
    //console.log("3");

    const skinnedMesh = gltf.scene.getObjectByProperty('type', 'SkinnedMesh');
    gltf.scene.userData.skinnedMesh = skinnedMesh;
}, undefined, function(error) {
    console.error(error);
});

camera.position.z = 5;


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Find intersections
    const intersects = raycaster.intersectObjects(scene.children, true);

    console.log("Intersects:", intersects);


    if (intersects.length > 0) {
        const intersect = intersects[0];
        console.log(intersect);
        const boneName = findBoneInfluencing(intersect);

        if (boneName.includes('hand')) {
            console.log('Waving hand');
            if (waveAction) {
                waveAction.reset(); // Reset animation to start
                waveAction.setLoop(THREE.LoopOnce);
                waveAction.play();
                waveAction.paused = false;
            } else {
                console.error('Wave action not found');
            }
        } else if (boneName.includes('spine')) {
            
            if (jumpAction) {
                console.log('Jumping!');
                jumpAction.reset(); // Reset animation to start
                jumpAction.setLoop(THREE.LoopOnce);
                jumpAction.play();
                jumpAction.paused = false;
            } else {
                console.error('Jump action not found');
            }
        }
    }
}
// renderer.setClearColor(0xffffff);
window.addEventListener('click', onMouseClick, false);

function findBoneInfluencing(intersect) {
    const skinnedMesh = intersect.object;
    const skinIndices = skinnedMesh.geometry.attributes.skinIndex.array;
    const skinWeights = skinnedMesh.geometry.attributes.skinWeight.array;
    const skeleton = skinnedMesh.skeleton;

    const vertexIndex = intersect.face.a; // First vertex's index of the intersected face

    const boneIndices = skinIndices.slice(vertexIndex * 4, vertexIndex * 4 + 4);
    const boneWeights = skinWeights.slice(vertexIndex * 4, vertexIndex * 4 + 4);

    let maxWeight = -Infinity;
    let boneIndex = -1;

    for (let i = 0; i < 4; i++) {
        if (boneWeights[i] > maxWeight) {
            maxWeight = boneWeights[i];
            boneIndex = boneIndices[i];
        }
    }

    const bone = skeleton.bones[boneIndex];
    return bone.name;
}

function animate() {
    requestAnimationFrame(animate);

    if (mixer) {
        mixer.update(clock.getDelta());
    }

    renderer.render(scene, camera);
}

const clock = new THREE.Clock();
animate();