import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from "dat.gui";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import bear from '../img/bear.jpg';
import capi from '../img/capi.jpg';


var model;
var modelId;
const note = new URL('../models/note.glb', import.meta.url);


const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled=true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000

);
const orbit = new OrbitControls(camera, renderer.domElement);


camera.position.set(-10, 30,5);
orbit.update();
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

const boxGeometry = new THREE.IcosahedronGeometry();
const boxMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("rgb(255, 198, 252)"),
    });
const box = new THREE.Mesh(boxGeometry, boxMaterial); 
box.position.set(0, 0,2);
box.castShadow = true;
scene.add(box);
const boxId = box.id;


const assetLoader = new GLTFLoader();
assetLoader.load(note.href, function(gltf){
    model = gltf.scene;
    scene.add(model);
    model.position.set(-1, 4, 1);
    
    model.name ="my_note";
    modelId = model.id;


}, undefined, function(error){
    console.error("error :((((")
});

const planeG = new THREE.PlaneGeometry(10,10);
const plMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
side: THREE.DoubleSide});
const plane = new THREE.Mesh(planeG, plMat);
plane.receiveShadow = true;
scene.add(plane);

capiLoad = new THREE.CubeTextureLoader();
const boxG = new THREE.BoxGeometry(1, 1, 1);
const boxM = new THREE.MeshBasicMaterial({
    
    map: capiLoad.load(capi)
    });


const box2 = new THREE.Mesh(boxG, boxM); 
scene.add(box2);
box2.position.set(0, 2, 2);


const light = new THREE.DirectionalLight( 0xffffff, 2); 
light.position.set(0, 0, 5);
console.log(light.position);
scene.add(light);
light.castShadow = true;

const lHelper = new THREE.DirectionalLightHelper(light);
scene.add(lHelper);

// const texture = new THREE.TextureLoader();
// scene.background = texture.load(bear);


// const texture = new THREE.CubeTextureLoader();
// scene.background = texture.load(bear);


const myGui = new dat.GUI();
const options = {
    boxColor: '#ffea00',
    lightPosition: (0,0,0)
};
myGui.addColor(options, 'boxColor').onChange(function(e){
    box.material.color.set(e);
});
myGui.add(options, 'lightPosition', 0 ).onChange(function(e){
    light.position.set(0, 0, e);
});


const mousePoint = new THREE.Vector2();


window.addEventListener('mousemove', function(e){
    mousePoint.x=(e.clientX/window.innerWidth)*2-1;
    mousePoint.y=-(e.clientY/window.innerHeight)*2+1;

});


const rayCaster = new THREE.Raycaster();
function animate(){
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;
    box.rotation.z += 0.01;
    if (model){
        
        model.rotation.y += 0.01;
        model.rotation.x += 0.01;
        model.rotation.z += 0.01;

    }
    
    

    rayCaster.setFromCamera(mousePoint, camera);
    const inters = rayCaster.intersectObjects(scene.children);
    //console.log(inters);
    for(let i=0; i< inters.length; i++){
        // if (inters[i].object.id===boxId)
        //     // console.log("AAAAAAAAAAAAAAAAAAAA");
        //     inters[i].object.material.color.set(0xFF0000);
        if (model){
            console.log(model.id);
            if (inters[i].object.id==="21"){
                console.log("LLLLLLL");
                inters[i].object.rotation.x += 0.01;
                inters[i].object.rotation.y += 0.01;
                inters[i].object.rotation.z += 0.01;
            }
        }
        

        // else {
        //     var my = scene.getObjectById(boxId);
        //     my.material.color.set(new THREE.Color("rgb(255, 198, 252)"));
        // }

    };
    
    renderer.render(scene, camera);

}


renderer.setAnimationLoop(animate);

window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})