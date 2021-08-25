import * as THREE from './libs/three/three.module.js';
import { GLTFLoader } from './libs/three/jsm/GLTFLoader.js';
import { FBXLoader } from './libs/three/jsm/FBXLoader.js';
import { RGBELoader } from './libs/three/jsm/RGBELoader.js';
import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
//import { LoadingBar } from './libs/LoadingBar.js';
import Stats from './libs/stats.js/src/Stats.js'

class App {

    constructor() {

        //######## prevent multiple tab ########
        window.onload = function () {
            if (document.cookie.indexOf("_instance=true") === -1) {
                document.cookie = "_instance=true";
                window.onunload = function () {
                    document.cookie = "_instance=true;expires=Thu, 01-Jan-1970 00:00:01 GMT";
                };
            }
            else {
                alert(" Security Alerts.You Are Opening Multiple Window. This window will now close.");
                const win = window.open("about:blank", "_self"); win.close();
            }
        };

        //############# test ############
        // this.text2 = document.createElement('div');
        // this.text2.style.position = 'absolute';
        // //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
        // this.text2.style.width = 100;
        // this.text2.style.height = 100;
        // this.text2.style.opacity = 0.5;
        // this.text2.style.color = 'white';
        // this.text2.innerHTML = "hi there!";
        // this.text2.style.top = window.innerHeight / 2 + 'px';
        // this.text2.style.left = window.innerWidth / 2 + 'px';
        // document.body.appendChild(this.text2);
        //##################################

        this.previousid = -1;

        this.clock = new THREE.Clock();
        this.previousTime = 0;
        this.last_stabbed_time = 0;
        this.die_time = 0;
        this.score_time = -1;
        this.timestamp = 0;

        this.all_player_data = [];
        this.receive_player_data = [];
        this.objectsToUpdate = [];

        this.ready_sw = 0;
        this.right_sw = 0;
        this.left_sw = 0;
        this.jump_sw = 0;
        this.emoji_button_sw = 0;
        this.emoji_sw = -1;
        this.emoji = -1;
        this.emoji_time = 0;

        this.die_sw = 0;

        this.fox_finalpositionx = 0;
        this.fox_finalpositiony = 0;

        this.mixer = [];

        this.fox_push_power = 0;
        this.fox_push_power2 = 0;

        this.fox_score = 0;
        this.fox_life = 1000;
        this.fox_previousPlane = null;
        this.fox_animation = 0;
        this.fox_plane_id = null;
        this.fox_plane_type = 0;
        this.fox_action = -1;
        this.spring_sound_play = 0;


        this.gltfloader = new GLTFLoader().setPath('./assets/model/');

        this.stabbed_audio = document.getElementById("stabbedMusic");
        this.plane_audio = document.getElementById("planeMusic");
        this.convey_audio = document.getElementById("conveyMusic");
        this.fake_audio = document.getElementById("fakeMusic");
        this.spring_audio = document.getElementById("springMusic");
        this.die_audio = document.getElementById("dieMusic");

        const container = document.createElement('div');
        document.body.appendChild(container);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 4, 45);

        this.scene = new THREE.Scene();
        //this.scene.background = new THREE.Color(0x000077);

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.8);
        this.scene.add(ambient);

        const light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
        // light.position.set(0, 22, -14)
        light.position.set(0.2, 1, 1);
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);



        container.appendChild(this.renderer.domElement);

        this.stats = new Stats()
        this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)
        this.leaderboard = document.querySelector('.leader-board-wrapper');
        this.own_score = document.querySelector('.own_score');

        this.gg_board = document.querySelector('.gg_board');
        this.restart = document.querySelector('.restart');

        this.send_name = document.querySelector('.send_name');
        this.modal = document.querySelector('.modal');
        this.box = document.querySelector('.box');
        this.initial_fox();

        window.addEventListener('resize', this.resize.bind(this));
        //######## disable enter ########### 
        const input = document.querySelector('.Name');
        input.addEventListener('keydown', function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
            }
        });

        this.restart.addEventListener('click', () => {
            window.location.reload();
        })
        this.send_name.addEventListener('click', () => {


            if (this.ready_sw === 1 && this.ready_for_load_model) {
                this.ready_sw = 0;
                //this.fox_name = document.querySelector('.Name').value
                this.setListerner();
                this.load_LifeBar();
                this.modal.classList.add('hidden');
                this.box.classList.remove('fadeOut');
                this.box.classList.add('bounceOut');
                this.leaderboard.classList.remove('hidden');
                this.fox = this.model.clone();
                this.fox.children[0].children[1].material = this.model.children[0].children[1].material.clone();
                this.fox.children[1].children[0].children[1].material = this.model.children[1].children[0].children[1].material.clone();
                this.fox.children[1].children[1].children[1].material = this.model.children[1].children[1].children[1].material.clone();
                this.fox.children[2].children[0].children[1].material = this.model.children[2].children[0].children[1].material.clone();
                this.fox.children[2].children[1].children[1].material = this.model.children[2].children[1].children[1].material.clone();
                this.fox.position.x = this.fox_positionx;
                this.fox.position.y = 20;
                this.fox.children[0].children[1].material.color = new THREE.Color(this.fox_r, this.fox_g, this.fox_b);
                this.fox.children[1].children[0].children[1].material.color = new THREE.Color(this.fox_r, this.fox_g, this.fox_b);
                this.fox.children[1].children[1].children[1].material.color = new THREE.Color(this.fox_r, this.fox_g, this.fox_b);
                this.fox.children[2].children[0].children[1].material.color = new THREE.Color(this.fox_r, this.fox_g, this.fox_b);
                this.fox.children[2].children[1].children[1].material.color = new THREE.Color(this.fox_r, this.fox_g, this.fox_b);
                this.scene.add(this.fox);
                let initdata = {
                    title: 'init',
                    positionx: this.fox_positionx,
                    positiony: 20,
                    r: this.fox_r,
                    g: this.fox_g,
                    b: this.fox_b,
                    name: document.querySelector('.Name').value
                }
                this.socket.send(JSON.stringify(initdata));
                this.fox_name = document.createElement('div');
                this.fox_name.style.position = 'absolute';
                this.fox_name.style.width = 100;
                this.fox_name.style.height = 100;
                this.fox_name.style.opacity = 0.5;
                this.fox_name.style.color = 'white';
                this.fox_name.innerHTML = document.querySelector('.Name').value;
                this.fox_name.style.top = window.innerHeight / 2 + 'px';
                this.fox_name.style.left = window.innerWidth / 2 + 'px';
                document.body.appendChild(this.fox_name);

                this.scene.remove(this.model);


            }
        })




        this.worker = new Worker('Worker.js', { type: 'module' });

        // this.setsocketListener();
        this.renderer.setAnimationLoop(this.render.bind(this));


        //########## texture ##############

        const textureLoader = new THREE.TextureLoader()

        const plane_texture = textureLoader.load('./assets/12.jpeg');
        const fake_plane_texture = textureLoader.load('./assets/13.jpeg');
        const background_texture = textureLoader.load('./assets/matcap/1.png');
        const ceiling_texture = textureLoader.load('./assets/matcap/4.png');
        const convey_belt_texture = textureLoader.load('./assets/matcap/4.png');
        const green_texture = textureLoader.load('./assets/matcap/8.png');
        this.green_texture2 = textureLoader.load('./assets/matcap/11.png');


        this.planegeometry = new THREE.BoxGeometry(12, 2, 1);
        this.planematerial0 = new THREE.MeshStandardMaterial({ map: plane_texture });
        this.planematerial1 = new THREE.MeshStandardMaterial({ map: plane_texture, color: 0xff0000 });
        this.planematerial2 = new THREE.MeshStandardMaterial({ map: fake_plane_texture });
        this.planematerial3 = new THREE.MeshMatcapMaterial({ matcap: ceiling_texture })
        this.planematerial4 = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.test_plane_size = null;


        let geometry = new THREE.PlaneGeometry(2700, 80);
        let material = new THREE.MeshMatcapMaterial({ color: 0x111188 })
        material.matcap = background_texture;
        const plane = new THREE.Mesh(geometry, material);
        plane.position.z -= 10
        this.scene.add(plane);

        geometry = new THREE.ConeGeometry(1.5, 3, 64);
        let metal_material = new THREE.MeshMatcapMaterial()
        metal_material.matcap = ceiling_texture;
        for (let i = -1400; i < 1400; i += 3) {
            const cone = new THREE.Mesh(geometry, metal_material);
            cone.rotation.x = Math.PI;
            cone.position.y = 27.5;
            cone.position.x = i;
            this.scene.add(cone);
        }
        geometry = new THREE.BoxGeometry(2700, 1, 3);
        const ceiling = new THREE.Mesh(geometry, metal_material);
        ceiling.position.y = 29;
        this.scene.add(ceiling);



        //####### sting plane ########
        this.sting_plane = new THREE.Group();
        const sting_body_geometry = new THREE.BoxBufferGeometry(11, 0.5, 1);
        const sting_body = new THREE.Mesh(sting_body_geometry, metal_material);
        sting_body.position.y += 0.1;
        this.sting_plane.add(sting_body);
        const sting_body2 = new THREE.Mesh(sting_body_geometry, metal_material);
        sting_body2.position.y += 0.73;
        this.sting_plane.add(sting_body2);
        const sting_geometry = new THREE.ConeGeometry(0.7, 2, 64);
        for (let i = -4.8; i < 5.6; i += 1.6) {
            const sting = new THREE.Mesh(sting_geometry, metal_material);
            sting.scale.z = 0.5;
            sting.position.set(i, 1.8, 0);
            this.sting_plane.add(sting);
        }

        //####### convey ############
        this.convey = new THREE.Group();
        const convey_body_geometry = new THREE.BoxBufferGeometry(11, 1.5, 1);
        //CylinderGeometry(1, 1, 10, 4);
        const convey_gear_geometry = new THREE.SphereGeometry(1.1, 32, 32);
        const convey_gear_spot_geometry = new THREE.CylinderGeometry(.1, .1, 2, 32);
        const convey_gear_back_geometry = new THREE.CylinderGeometry(1.1, 1.1, 1, 32);
        const convey_belt_geometry = new THREE.BoxBufferGeometry(0.9, 0.3, 1);

        let convey_belt_material = new THREE.MeshMatcapMaterial()
        convey_belt_material.matcap = convey_belt_texture;
        const gear_spot_material = new THREE.MeshBasicMaterial({ color: 0x333333 });

        const convey_body = new THREE.Mesh(convey_body_geometry, new THREE.MeshStandardMaterial({ color: 0x666666 }));
        //convey_body.rotation.z = Math.PI / 2
        const convey_gear = new THREE.Group();
        const convey_gear_front = new THREE.Mesh(convey_gear_geometry, convey_belt_material);
        const convey_gear_back = new THREE.Mesh(convey_gear_back_geometry, convey_belt_material);
        const convey_gear_spot = new THREE.Mesh(convey_gear_spot_geometry, gear_spot_material);

        for (let i = 0; i < 5; i++) {
            let temp_spot = convey_gear_spot.clone();
            temp_spot.position.set(Math.cos(i / Math.PI * 4) * 0.5, Math.sin(i / Math.PI * 4) * 0.5, -0.3);
            temp_spot.rotation.x = Math.PI / 2
            convey_gear.add(temp_spot);
        }

        convey_gear.add(convey_gear_front);
        convey_gear.add(convey_gear_back);
        convey_gear_back.rotation.x = Math.PI / 2
        convey_gear_front.scale.z = 0.5;
        convey_gear_front.position.z = 0.2;
        const convey_gear2 = convey_gear.clone();
        convey_gear.position.x = 5;
        convey_gear2.position.x = -5;



        const convey_sign_group = new THREE.Group();
        const convey_sign_geometry = new THREE.CylinderGeometry(.05, 0.5, 1, 32);
        const convey_sign = new THREE.Mesh(convey_sign_geometry, new THREE.MeshStandardMaterial({ color: 0xeeee55 }));
        convey_sign.rotation.z = Math.PI / 2;
        convey_sign.scale.z = 0.1;
        convey_sign.position.z = 0.5;
        const convey_sign2 = convey_sign.clone();
        convey_sign.position.x -= 0.6
        convey_sign2.position.x += 0.6
        convey_sign_group.add(convey_sign);
        convey_sign_group.add(convey_sign2);

        //convey_gear.add(mesh)


        const convey_belt = new THREE.Mesh(convey_belt_geometry, convey_belt_material);
        const roundDecimal = function (val, precision) {
            return Math.round(Math.round(val * Math.pow(10, (precision || 0) + 1)) / 10) / Math.pow(10, (precision || 0));
        }
        for (let i = -5; i <= 5; i += 1) {
            let temp_belt;
            let temp_belt2;
            temp_belt = convey_belt.clone();
            temp_belt2 = convey_belt.clone();

            temp_belt.position.set(roundDecimal(i, 2), .9, 0);

            temp_belt2.position.set(roundDecimal(i, 2), -.9, 0);
            this.convey.add(temp_belt);
            this.convey.add(temp_belt2);
        }

        this.convey.add(convey_sign_group);
        this.convey.add(convey_gear);
        this.convey.add(convey_gear2);
        this.convey.add(convey_body);




        //####### tramponline #########
        this.trampoline = new THREE.Group();
        this.trampoline_plane_geometry = new THREE.BoxBufferGeometry(12, .4, 1);
        this.green_material = new THREE.MeshMatcapMaterial({ color: 0xaaffaa });
        this.green_material.matcap = green_texture;
        const cube1 = new THREE.Mesh(this.trampoline_plane_geometry, this.green_material);
        const cube2 = new THREE.Mesh(this.trampoline_plane_geometry, this.green_material);
        const spring_geometry = new THREE.TorusGeometry(1, .08, 10, 10);

        const torus = new THREE.Mesh(spring_geometry, metal_material);
        torus.rotation.x = Math.PI / 2;
        torus.rotation.y = -0.15;
        torus.scale.y = 0.3;
        for (let i = -4.5; i < 6; i += 3) {
            for (let j = -0.6; j < 0.8; j += 0.2) {
                let temp_torus = torus.clone();
                temp_torus.position.set(i, j, 0);
                this.trampoline.add(temp_torus);
            }

        }
        cube1.position.set(0, 0.8, 0);
        cube2.position.set(0, -0.8, 0);


        this.trampoline.add(cube1);
        this.trampoline.add(cube2);
        //console.log(this.trampoline)



        //########## stabbed animation plane ############

        let stabbedPlane_geometry = new THREE.PlaneGeometry(100, 80);
        let stabbedPlane_material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
        this.stabbed_plane = new THREE.Mesh(stabbedPlane_geometry, stabbedPlane_material);
        this.stabbed_plane.position.z = 10;
        this.stabbed_plane.visible = false;
        this.scene.add(this.stabbed_plane);

        //######### pointer ############
        // const pointer_geometry = new THREE.CylinderGeometry(.05, 0.5, 1, 4);
        // this.pointer = new THREE.Mesh(pointer_geometry, new THREE.MeshStandardMaterial({ color: 0xff0000 }))
        // this.pointer.rotation.z = Math.PI;
        // this.pointer.scale.set(1, 1, 0.1);
        // this.pointer.position.y = 100;
        // this.pointer.position.z = 1;
        // this.scene.add(this.pointer);

        this.calculate_screenWidth();

    }
    calculate_screenWidth() {
        const vFOV = THREE.MathUtils.degToRad(this.camera.fov); // convert vertical fov to radians

        const height = 2 * Math.tan(vFOV / 2) * 40; // visible height

        const width = height * this.camera.aspect;
        this.screenWidth = width;
        //console.log(width);
    }
    toXYCoords(pos) {
        const screenPosition = pos.position.clone()
        screenPosition.x -= 2;
        screenPosition.y += 6;
        screenPosition.project(this.camera)
        const translateX = screenPosition.x * window.innerWidth * 0.5
        const translateY = - screenPosition.y * window.innerHeight * 0.5
        const vector = new THREE.Vector2();
        vector.x = translateX;
        vector.y = translateY;
        return vector;

    }
    load_LifeBar() {
        //####### life bar #########
        this.add_life_material = new THREE.MeshMatcapMaterial({ color: 0xaaffaa, transparent: true, opacity: 0.8 });
        this.add_life_material.matcap = this.green_texture2;
        this.subtract_life_material = new THREE.MeshStandardMaterial({ color: 0x666666, transparent: true, opacity: 0.8 })
        const life_bar_geometry = new THREE.CylinderGeometry(0.54, 0.54, 2.5, 10);
        this.life_bar = new THREE.Group();
        const life_bar_body = new THREE.Mesh(life_bar_geometry, new THREE.MeshStandardMaterial());

        const loader = new GLTFLoader().setPath('./assets/model/');
        const self = this;
        // Load a glTF resource
        loader.load(
            // resource URL
            'life_bar.glb',
            // called when the resource is loaded
            function (gltf) {
                // var headGeom = new THREE.CubeGeometry(16, 16, 16, 1);//
                //console.log(gltf.scene)
                gltf.scene.scale.set(1.5, 1.5, 1.5);
                gltf.scene.position.x += 5;
                gltf.scene.position.y -= 3;

                //gltf.scene.rotation.x = 0.5;
                self.life_bar.add(gltf.scene)
                //self.setsocketListener();
            },
            // called while loading is progressing
            function (xhr) {
            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');
                console.log(error);
            }
        );
        //life_bar_body.rotation.z = Math.PI / 2;
        life_bar_body.scale.z = 0.3;
        for (let i = 2.3; i <= 12.5; i += 1.1) {
            const temp_life_bar = life_bar_body.clone();
            temp_life_bar.material = this.add_life_material;
            temp_life_bar.position.x = i;
            temp_life_bar.position.z -= 1;
            this.life_bar.add(temp_life_bar);
        }
        this.life_bar.scale.set(0.9, 0.9, 0.3);
        this.scene.add(this.life_bar);
        //console.log(this.life_bar)
    }
    setsocketListener() {
        //######### socket #############
        this.socket = new WebSocket('wss://nssocketio-grateful-possum-hk.mybluemix.net/');
        //this.socket = new WebSocket('ws://0.0.0.0:8080');
        this.socket.onmessage = (e) => {
            let data = JSON.parse(e.data);
            if (data.title === 'connected') {
                this.ready_sw = 1;

            }
            else if (data.title === 'setId') {
                this.myID = data.id;
                //console.log(data.id, this.myID)
                this.ready_sw = 1;
            }
            else if (data.title === 'init_all_fox') {
                for (let i = 0; i < data.data.length; i++) {

                    if (data.data.id !== this.myID) {
                        this.loadPlayer(data.data[i].id, data.data[i].positionx, data.data[i].positiony, data.data[i].r, data.data[i].g, data.data[i].b, data.data[i].name);
                    }

                }
                this.ready_for_load_model = 1;
            }
            else if (data.title === 'player_join') {
                if (data.id !== this.myID) {

                    this.loadPlayer(data.id, data.positionx, data.positiony, data.r, data.g, data.b, data.name);
                }

            }
            //###### maybe should send deletePlayer by using interval ############
            else if (data.title === 'deletePlayer') {
                for (let i = 0; i < this.all_player_data.length; i++) {
                    if (this.all_player_data[i].id === data.id) {
                        this.scene.remove(this.all_player_data[i].mesh);
                        this.all_player_data[i].name_mesh.remove();
                        this.all_player_data.splice(i, 1);

                        break;
                    }
                }
            }
            else if (data.title === 'all_player_data_update') {
                this.receive_player_data = data.data;
                // for (let i = 0; i < data.data.length; i++) {
                //     if (data.data[i].id !== this.myID) {
                //         for (let j = 0; j < this.all_player_data.length; j++) {
                //             if (data.data[i].id === this.all_player_data[j].id) {
                //                 this.all_player_data[j].final_positionx[0] = this.all_player_data[j].final_positionx[1];
                //                 this.all_player_data[j].final_positionx[1] = data.data[i].positionx;
                //                 this.all_player_data[j].final_positiony[0] = this.all_player_data[j].final_positiony[1];
                //                 this.all_player_data[j].final_positiony[1] = data.data[i].positiony;
                //                 this.all_player_data[j].animation = data.data[i].animation;
                //                 this.all_player_data[j].plane_id = data.data[i].plane_id;
                //                 this.all_player_data[j].emoji = data.data[i].emoji;
                //                 this.all_player_data[j].rank = data.data[i].rank;
                //                 //this.all_player_data[j].action = data.data[i].action;
                //             }
                //         }
                //     }
                //     else if (data.data[i].id === this.myID) {
                //         this.fox_finalpositionx = data.data[i].positionx;
                //     }

                // }


            }
            else if (data.title === 'all_player_score_update') {
                for (let i = 0; i < data.data.length; i++) {
                    if (i < 10) {
                        document.querySelector(`.leaderboard-player${i + 1}`).innerHTML = '#' + (i + 1) + ' ' + data.data[i].name;
                        document.querySelector(`.score${i + 1}`).innerHTML = data.data[i].score;
                    }
                    if (data.data[i].id === this.myID) {
                        document.querySelector('.own_rank').innerHTML = (i + 1) + ' of ' + data.data.length;
                        this.fox_rank = i + 1;
                    }

                }
                if (data.data.length < 10) {
                    for (let i = data.data.length; i < 10; i++) {
                        document.querySelector(`.leaderboard-player${i + 1}`).innerHTML = '#' + (i + 1);
                        document.querySelector(`.score${i + 1}`).innerHTML = 0;
                    }
                }
            }
            else if (data.title === 'plane_data') {
                this.plane_data = data.data;

            }


        }
    }
    setListerner() {


        // window.addEventListener('mousemove', event => {

        //     // this.mouse.x = 
        //     // this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
        //     // console.log(- (event.clientY / window.innerHeight) * 2 + 1);
        //     // const pos = new THREE.Vector3(0, 0, 0);
        //     // const pMouse = new THREE.Vector3(-1, 0.1, 0);
        //     // pMouse.unproject(this.camera);

        //     // var cam = this.camera.position;
        //     // var m = pMouse.y / (pMouse.y - cam.y);

        //     // pos.x = pMouse.x + (cam.x - pMouse.x) * m;
        //     // pos.z = pMouse.z + (cam.z - pMouse.z) * m;
        //     //console.log(pos.x);

        //     // var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 + 1, 0.5);
        //     // vector.unproject(this.camera);
        //     // var dir = vector.sub(camera.position).normalize();
        //     // var distance = - camera.position.z / dir.z;
        //     // var pos = camera.position.clone().add(dir.multiplyScalar(distance));


        // });

        // window.addEventListener('blur', () => {
        //     window.location.reload();
        // })

        window.addEventListener('touchstart', (e) => {
            //alert(e.touches.length)
            if (e.touches[0].clientX < 100) {
                this.left_sw = 1;
            }
            else if (e.touches[0].clientX > 300) {
                this.right_sw = 1;
            }


        })
        window.addEventListener('touchend', () => {
            this.left_sw = 0;
            this.right_sw = 0;

        })


        window.addEventListener('keydown', (e) => {
            //console.log(e.keyCode)
            if (e.keyCode === 68 || e.key === 'ArrowRight') {
                this.right_sw = 1;
            }

            if (e.keyCode === 65 || e.key === 'ArrowLeft') {
                this.left_sw = 1;
            }
            if (e.keyCode === 81) {
                this.emoji_sw = 1;
                this.emoji_button_sw = 1;
            }
            if (e.keyCode === 87) {
                this.emoji_sw = 2;
                this.emoji_button_sw = 1;
            }
            if (e.keyCode === 69) {
                this.emoji_sw = 3;
                this.emoji_button_sw = 1;
            }

        });

        window.addEventListener('keyup', (e) => {

            if (e.keyCode === 68 || e.key === 'ArrowRight')
                this.right_sw = 0;
            if (e.keyCode === 65 || e.key === 'ArrowLeft')
                this.left_sw = 0;
            if (e.keyCode === 81) {
                this.emoji_sw = -1;
                this.emoji_button_sw = 0;
            }
            if (e.keyCode === 87) {
                this.emoji_sw = -1;
                this.emoji_button_sw = 0;
            }
            if (e.keyCode === 69) {
                this.emoji_sw = -1;
                this.emoji_button_sw = 0;
            }
        });
    }



    resize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.calculate_screenWidth();
    }
    initial_fox() {
        //######## initial fox attribute #######
        this.fox_positionx = Math.floor(Math.random() * 150 - 75);
        this.fox_r = Math.random();
        this.fox_g = Math.random();
        this.fox_b = Math.random();
        //this.loadFox(this.fox_positionx, this.fox_r, this.fox_g, this.fox_b);
        this.createModel();
    }
    createModel() {
        const loader = new GLTFLoader().setPath('./assets/model/');
        const self = this;

        // Load a glTF resource
        loader.load(
            // resource URL
            'body_ns.glb',
            // called when the resource is loaded
            function (gltf) {

                self.model = new THREE.Group();
                const body = gltf.scene;
                body.scale.set(20, 20, 20);
                body.position.y = -1;
                self.model.add(body);

                self.loadRhand();



            },
            // called while loading is progressing
            function (xhr) {


            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');
                console.log(error);
            }
        );


    }
    loadRhand() {
        const loader = new GLTFLoader().setPath('./assets/model/');
        const self = this;
        loader.load(
            'Rhand.glb',
            function (gltf) {
                self.Rhand = new THREE.Group();
                const handR = gltf.scene;
                handR.scale.set(15, 15, 15);
                handR.position.z = -7;
                //handR.position.y = -4;
                self.Rhand.add(handR)
                self.model.add(self.Rhand);
                self.loadRfist();
            },
            // called while loading is progressing
            function (xhr) {
            },
            // called when loading has errors
            function (error) {
                console.log('An error happened');
                console.log(error);
            }
        );
    }
    loadRfist() {
        const loader = new GLTFLoader().setPath('./assets/model/');
        const self = this;
        loader.load(
            'Rfist.glb',
            function (gltf) {
                const handR = gltf.scene;
                handR.scale.set(15, 15, 15);
                handR.position.z = -7;
                //handR.position.y = -4;
                self.Rhand.add(handR);
                self.Rhand.position.y = -5;
                self.model.add(self.Rhand);


                self.loadLhand();
            },
            // called while loading is progressing
            function (xhr) {
            },
            // called when loading has errors
            function (error) {
                console.log('An error happened');
                console.log(error);
            }
        );
    }
    loadLhand() {
        const loader = new GLTFLoader().setPath('./assets/model/');
        const self = this;
        loader.load(
            'Lhand.glb',
            function (gltf) {
                self.Lhand = new THREE.Group();
                const handL = gltf.scene;
                handL.scale.set(15, 15, 15);
                handL.position.z = 7;
                //handL.position.y = -4;
                self.Lhand.add(handL)
                self.model.add(self.Lhand);

                self.loadLfist();
            },
            // called while loading is progressing
            function (xhr) {
            },
            // called when loading has errors
            function (error) {
                console.log('An error happened');
                console.log(error);
            }
        );
    }
    loadLfist() {
        const loader = new GLTFLoader().setPath('./assets/model/');
        const self = this;
        loader.load(
            'Lfist.glb',
            function (gltf) {
                const handL = gltf.scene;
                handL.scale.set(15, 15, 15);
                handL.position.z = 7;
                //handL.position.y = -4;
                self.Lhand.add(handL)
                self.Lhand.position.y = -5;
                self.model.add(self.Lhand);

                self.loadhead();
            },
            // called while loading is progressing
            function (xhr) {
            },
            // called when loading has errors
            function (error) {
                console.log('An error happened');
                console.log(error);
            }
        );
    }
    loadhead() {
        const loader = new GLTFLoader().setPath('./assets/model/');
        const self = this;
        loader.load(
            'head_ns.glb',
            function (gltf) {
                const head = gltf.scene;
                head.scale.set(20, 20, 20);
                head.position.y = 0.2;
                head.position.x = 2;
                //head.rotation.y = Math.PI / 2
                self.model.add(head);

                self.loadleg();

            },
            // called while loading is progressing
            function (xhr) {
            },
            // called when loading has errors
            function (error) {
                console.log('An error happened');
                console.log(error);
            }
        );
    }
    loadleg() {
        const loader = new GLTFLoader().setPath('./assets/model/');
        const self = this;
        // Load a glTF resource
        loader.load(
            // resource URL
            'foot_ns.glb',
            // called when the resource is loaded
            function (gltf) {
                // var headGeom = new THREE.CubeGeometry(16, 16, 16, 1);//
                const legR = gltf.scene;
                legR.scale.set(18, 18, 18);
                //legR.rotation.y = Math.PI / 2;
                legR.position.x = 0;
                legR.position.z = 4;
                legR.position.y = 1;
                legR.castShadow = true;
                self.model.add(legR);

                const legL = legR.clone();
                legL.position.z = -legR.position.z;
                self.model.add(legL);
                self.model.scale.set(0.1, 0.1, 0.1);
                self.model.position.y = 20;

                self.loadAngry_symbol();

            },
            // called while loading is progressing
            function (xhr) {
            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');
                console.log(error);
            }
        );
    }
    loadAngry_symbol() {
        const loader = new GLTFLoader().setPath('./assets/model/');
        const self = this;
        // Load a glTF resource
        loader.load(
            // resource URL
            'angry_speech.glb',
            // called when the resource is loaded
            function (gltf) {
                // var headGeom = new THREE.CubeGeometry(16, 16, 16, 1);//
                //self.angry = gltf.scene;
                //self.scene.add(self.angry);

                const angry = gltf.scene;
                angry.scale.set(600, 600, 600);
                angry.position.x = 10;
                angry.position.y = 35;
                angry.position.z = -15;
                // self.angry.position.y = 100;
                self.model.add(angry);
                self.loadThumbup_symbol();

                // self.angry.scale.set(10, 40, 40);
                // self.angry.rotation.y = -Math.PI / 2;
                // self.angry.traverse(function (child) {
                //     if (child.isMesh) {
                //         child.material.transparent = true;
                //         child.material.opacity = 0.5;
                //     }
                // })
            },
            // called while loading is progressing
            function (xhr) {
            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');
                console.log(error);
            }
        );
    }
    loadThumbup_symbol() {
        const loader = new GLTFLoader().setPath('./assets/model/');
        const self = this;
        // Load a glTF resource
        loader.load(
            // resource URL
            'thumbup_speech.glb',
            // called when the resource is loaded
            function (gltf) {
                // var headGeom = new THREE.CubeGeometry(16, 16, 16, 1);//
                //self.thumbup = gltf.scene;
                //self.scene.add(self.thumbup);

                const thumbup = gltf.scene;
                thumbup.scale.set(600, 600, 600);
                thumbup.position.x = 10;
                thumbup.position.y = 35;
                thumbup.position.z = -15;
                // self.thumbup.position.y = 100;
                self.model.add(thumbup);
                self.loadheart_symbol();
                // self.thumbup.scale.set(10, 40, 40);
                // self.thumbup.rotation.y = -Math.PI / 2;
                // self.thumbup.traverse(function (child) {
                //     if (child.isMesh) {
                //         child.material.transparent = true;
                //         child.material.opacity = 0.2;
                //     }
                // })

            },
            // called while loading is progressing
            function (xhr) {
            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');
                console.log(error);
            }
        );
    }
    loadheart_symbol() {
        const loader = new GLTFLoader().setPath('./assets/model/');
        const self = this;
        // Load a glTF resource
        loader.load(
            // resource URL
            'heart_speech.glb',
            // called when the resource is loaded
            function (gltf) {
                // var headGeom = new THREE.CubeGeometry(16, 16, 16, 1);//
                //console.log(gltf.scene)
                //self.heart = gltf.scene;
                //self.scene.add(self.heart);

                const heart = gltf.scene;
                heart.scale.set(600, 600, 600);
                heart.position.x = 10;
                heart.position.y = 35;
                heart.position.z = -15;
                self.model.add(heart);

                self.scene.add(self.model);
                self.model.position.y = 0;
                // self.heart.scale.set(10, 40, 40);
                // self.heart.rotation.y = -Math.PI / 2;
                self.setsocketListener();
                //self.loademoji_board();
                // self.heart.traverse(function (child) {
                //     if (child.isMesh) {
                //         child.material.transparent = true;
                //         child.material.opacity = 0.2;
                //     }
                // })
                // self.heart.children[0].material.transparent = true;
                // self.heart.children[0].material
            },
            // called while loading is progressing
            function (xhr) {
            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');
                console.log(error);
            }
        );
    }

    loadPlayer(id, positionx, positiony, r, g, b, name) {




        const model = this.model.clone();
        model.position.x = positionx;
        model.position.y = positiony;
        //model.scale.set(0.02, 0.02, 0.02);



        const text2 = document.createElement('div');
        text2.style.position = 'absolute';
        text2.style.width = 100;
        text2.style.height = 100;
        text2.style.opacity = 0.5;
        text2.style.color = 'white';
        text2.innerHTML = name;
        text2.style.top = window.innerHeight / 2 + 'px';
        text2.style.left = window.innerWidth / 2 + 'px';
        document.body.appendChild(text2);
        model.children[0].children[1].material = this.model.children[0].children[1].material.clone();
        model.children[1].children[0].children[1].material = this.model.children[1].children[0].children[1].material.clone();
        model.children[1].children[1].children[1].material = this.model.children[1].children[1].children[1].material.clone();
        model.children[2].children[0].children[1].material = this.model.children[2].children[0].children[1].material.clone();
        model.children[2].children[1].children[1].material = this.model.children[2].children[1].children[1].material.clone();
        model.children[0].children[1].material.color = new THREE.Color(r, g, b);
        model.children[1].children[0].children[1].material.color = new THREE.Color(r, g, b);
        model.children[1].children[1].children[1].material.color = new THREE.Color(r, g, b);
        model.children[2].children[0].children[1].material.color = new THREE.Color(r, g, b);
        model.children[2].children[1].children[1].material.color = new THREE.Color(r, g, b);
        const final_positionx = [];
        final_positionx.push(positionx);
        final_positionx.push(positionx);
        const final_positiony = [];
        final_positiony.push(positiony);
        final_positiony.push(positiony);

        this.all_player_data.push({ mesh: model, id: id, onplane: null, plane_type: 0, onplane_time: 0, last_moving_time: 0, name_mesh: text2, animation: 3, final_positionx: final_positionx, final_positiony: final_positiony, name: name, object_id: -1 });

        this.scene.add(model);




    }
    Animate_Character(fox, icode, elapsedTime, emoji) {

        if (emoji === 1) {
            fox.children[6].visible = true;
            fox.children[7].visible = false;
            fox.children[8].visible = false;
        }
        else if (emoji === 2) {
            fox.children[6].visible = false;
            fox.children[7].visible = true;
            fox.children[8].visible = false;
        }
        else if (emoji === 3) {
            fox.children[6].visible = false;
            fox.children[7].visible = false;
            fox.children[8].visible = true;
        }
        else {
            fox.children[6].visible = false;
            fox.children[7].visible = false;
            fox.children[8].visible = false;
        }

        const PI = Math.PI;
        const amp = 5;
        let t = elapsedTime;
        t *= 20;
        t = t % (2 * PI);
        if (icode === 1 || icode === 2) {
            fox.children[4].position.x = Math.cos(t) * amp;
            fox.children[4].position.y = Math.max(fox.children[0].position.y - 6, fox.children[4].position.y);

            fox.children[5].position.x = Math.cos(t + PI) * amp;
            fox.children[5].position.y = Math.max(fox.children[0].position.y - 6, fox.children[5].position.y);



            fox.children[0].position.y = -1 - Math.cos(t * 2) * amp * .2;
            fox.children[0].rotation.y = -Math.cos(t + PI) * amp * .05;

            fox.children[1].children[0].visible = false;
            fox.children[1].children[1].visible = true;
            fox.children[1].position.x = Math.cos(t) * amp;
            fox.children[1].rotation.x = 0;
            fox.children[1].position.y = fox.children[0].position.y - 4;
            fox.children[1].position.z = fox.children[0].position.z - 1;

            fox.children[2].children[0].visible = false;
            fox.children[2].children[1].visible = true;
            fox.children[2].position.x = Math.cos(t + PI) * amp;
            fox.children[2].rotation.x = 0;
            fox.children[2].position.y = fox.children[0].position.y - 4;
            fox.children[2].position.z = fox.children[0].position.z + 1;

            fox.children[3].position.y = 1 - Math.cos(t * 2) * amp * .3;
            fox.children[3].rotation.x = Math.cos(t) * amp * .02;
            fox.children[3].rotation.z = 0;
            fox.children[3].position.x = fox.children[0].position.x + 3;
            //fox.children[3].rotation.y = Math.cos(t) * amp * .01 + Math.PI / 2;


            if (t > PI) {
                //this.fox.children[1].rotation.z = Math.cos(t * 2 + PI / 4) * PI / 8;
                fox.children[4].rotation.z = Math.cos(t * 2 + PI / 4) * PI / 8;
                fox.children[5].rotation.z = 0;
            } else {
                fox.children[4].rotation.z = 0;
                fox.children[5].rotation.z = Math.cos(t * 2 + PI / 4) * PI / 8;
                //this.fox.children[2].rotation.z = Math.cos(t * 2 + PI / 4) * PI / 8;
            }
            if (icode === 1) {
                fox.rotation.y = Math.PI + 0.2;
                fox.children[6].rotation.y = Math.PI / 2 - 0.2;
                fox.children[6].position.z = fox.children[0].position.z - 12;
                fox.children[6].position.x = fox.children[0].position.x - 10;
                fox.children[6].position.y = fox.children[0].position.y + 40;
                fox.children[7].rotation.y = Math.PI / 2 - 0.2;
                fox.children[7].position.z = fox.children[0].position.z - 12;
                fox.children[7].position.x = fox.children[0].position.x - 10;
                fox.children[7].position.y = fox.children[0].position.y + 40;
                fox.children[8].rotation.y = Math.PI / 2 - 0.2;
                fox.children[8].position.z = fox.children[0].position.z - 12;
                fox.children[8].position.x = fox.children[0].position.x - 10;
                fox.children[8].position.y = fox.children[0].position.y + 40;
            }

            else if (icode === 2) {
                fox.rotation.y = -0.2;
                fox.children[6].rotation.y = -Math.PI / 2 + 0.2;
                fox.children[6].position.z = fox.children[0].position.z + 12;
                fox.children[6].position.x = fox.children[0].position.x + 15;
                fox.children[6].position.y = fox.children[0].position.y + 40;
                fox.children[7].rotation.y = -Math.PI / 2 + 0.2;
                fox.children[7].position.z = fox.children[0].position.z + 12;
                fox.children[7].position.x = fox.children[0].position.x + 15;
                fox.children[7].position.y = fox.children[0].position.y + 40;
                fox.children[8].rotation.y = -Math.PI / 2 + 0.2;
                fox.children[8].position.z = fox.children[0].position.z + 12;
                fox.children[8].position.x = fox.children[0].position.x + 15;
                fox.children[8].position.y = fox.children[0].position.y + 40;
                //fox.position.x += 0.25;
            }
        }
        else {
            fox.children[6].rotation.y = 0;
            fox.children[6].position.x = fox.children[0].position.x + 10;
            fox.children[6].position.z = fox.children[0].position.z - 12;
            fox.children[6].position.y = fox.children[0].position.y + 40;
            fox.children[7].rotation.y = 0;
            fox.children[7].position.x = fox.children[0].position.x + 10;
            fox.children[7].position.z = fox.children[0].position.z - 12;
            fox.children[7].position.y = fox.children[0].position.y + 40;
            fox.children[8].rotation.y = 0;
            fox.children[8].position.x = fox.children[0].position.x + 10;
            fox.children[8].position.z = fox.children[0].position.z - 12;
            fox.children[8].position.y = fox.children[0].position.y + 40;
            if (icode == 0)
                fox.children[1].rotation.x = 0;
            fox.children[1].children[0].visible = false;
            fox.children[1].children[1].visible = true;
            fox.children[1].rotation.z = 0;
            fox.children[1].position.y = fox.children[0].position.y - 2.5;
            fox.children[1].position.x = fox.children[0].position.x + 0.5;
            fox.children[1].position.z = fox.children[0].position.z - 2;

            // this.fox.children[2].position.x = 0;
            if (icode == 0)
                fox.children[2].rotation.x = 0;
            fox.children[2].children[0].visible = false;
            fox.children[2].children[1].visible = true;
            fox.children[2].rotation.z = 0;
            fox.children[2].position.y = fox.children[0].position.y - 2.5;
            fox.children[2].position.x = fox.children[0].position.x + 0.5;
            fox.children[2].position.z = fox.children[0].position.z + 2;

            fox.children[3].rotation.z = Math.cos(elapsedTime) / 10;
            fox.children[3].rotation.x = 0;
            fox.children[3].position.y = fox.children[0].position.y + 1.2;
            fox.children[3].position.x = fox.children[0].position.x + 4;
            //fox.children[3].rotation.y = Math.cos(elapsedTime) / 10 + Math.PI / 2;

            fox.children[4].rotation.z = 0;
            fox.children[4].position.y = fox.children[0].position.y + 2;
            fox.children[4].position.x = fox.children[0].position.x;
            fox.children[4].position.z = fox.children[0].position.z - 4;

            fox.children[5].rotation.z = 0;
            fox.children[5].position.y = fox.children[0].position.y + 2;
            fox.children[5].position.x = fox.children[0].position.x;
            fox.children[5].position.z = fox.children[0].position.z + 4;

            fox.rotation.y = -Math.PI / 2;
            if (icode === 3) {

                fox.children[1].children[0].visible = true;
                fox.children[1].children[1].visible = false;
                fox.children[2].children[0].visible = true;
                fox.children[2].children[1].visible = false;
                //for (let i = 0; i < 1; i++) {
                if (Math.floor(fox.children[1].rotation.x * 100) % 13 === 0) {
                    fox.children[1].rotation.x += 0.13;
                }
                else {
                    fox.children[1].rotation.x -= 0.1;
                }

                if (fox.children[1].rotation.x < 0) {
                    fox.children[1].rotation.x = 0.13;
                }
                if (fox.children[1].rotation.x > 1) {
                    fox.children[1].rotation.x = 0.9;
                }
                fox.children[1].position.z = -2 + fox.children[0].position.z - (21 - (21 * (1 - fox.children[1].rotation.x)));
                fox.children[1].position.y = fox.children[0].position.y + 6 - (12 * (1 - fox.children[1].rotation.x));
                fox.children[1].position.x = fox.children[0].position.x - 1;

                if (Math.floor(fox.children[2].rotation.x * 100) % 13 === 0) {
                    fox.children[2].rotation.x -= 0.13;
                }
                else {
                    fox.children[2].rotation.x += 0.1;
                }
                if (fox.children[2].rotation.x < -1) {
                    fox.children[2].rotation.x = -0.9;
                }
                if (fox.children[2].rotation.x > 0) {
                    fox.children[2].rotation.x = -0.13;
                }
                fox.children[2].position.z = 2 + fox.children[0].position.z + (21 - (21 * (fox.children[2].rotation.x + 1)));
                fox.children[2].position.y = fox.children[0].position.y + 6 - (12 * (fox.children[2].rotation.x + 1));
                fox.children[2].position.x = fox.children[0].position.x - 1;
                //}



                // fox.children[4].position.x = Math.cos(t) * amp * 2;
                // fox.children[4].position.y = Math.max(fox.children[0].position.y - 6, fox.children[4].position.y);

                // fox.children[5].position.x = Math.cos(t) * amp * 2;
                // fox.children[5].position.y = Math.max(fox.children[0].position.y - 6, fox.children[5].position.y);



                // fox.children[4].position.z = fox.children[0].position.z - 2;
                // fox.children[5].position.z = fox.children[0].position.z + 2;
                // fox.children[4].rotation.z = -0.3;
                // fox.children[5].rotation.z = -0.3;

            }
        }

    }
    calculate_life(life) {
        //this.life_bar.children[10].material = this.add_life_material;

        for (let i = 0; i < this.life_bar.children.length - 1; i++) {
            if (i <= life - 1) {
                this.life_bar.children[i].material = this.add_life_material;
            }
            else if (i > life - 1) {
                this.life_bar.children[i].material = this.subtract_life_material;
            }

        }
    }
    myLerp(a, b, x) {
        return a + (b - a) * x;
    }
    myBezier(a, b, c, x) {
        return ((1 - x) * (1 - x) * a) + (2 * (1 - x) * x * b) + (x * x * c);
    }

    render() {

        this.stats.begin()
        this.right_block = 0;
        this.left_block = 0;
        const elapsedTime = this.clock.getElapsedTime();
        const deltaTime = elapsedTime - this.previousTime
        this.previousTime = elapsedTime;

        if (this.fox) {
            if (this.score_time === -1) {
                this.score_time = elapsedTime;
                console.log(this.fox.position.x)
            }
            if (elapsedTime - this.score_time > 3 && this.die_sw === 0) {
                // this.fox_score++;
                // this.own_score.innerHTML = this.fox_score;
                //this.score_time = elapsedTime;
                //if (this.all_player_data.length >= 1)
                //console.log('tt', this.fox.position.x);
                // let data = {
                //     title: 'score_update',
                //     id: this.myID,
                //     score: this.fox_score
                // }
                // this.socket.send(JSON.stringify(data));
                // if (this.all_player_data.length > 0) {
                //     console.log('position', this.all_player_data[0].mesh.position.x, this.all_player_data[0].mesh.position.y)
                //     console.log('final_position', this.all_player_data[0].final_positionx, this.all_player_data[0].final_positiony)
                // }
                // if (this.fox && elapsedTime < 10)
                //     console.log(this.fox.position.x, this.fox.position.y)
                // this.score_time = elapsedTime;

            }
        }
        // if (this.all_player_data.length > 0) {
        //     if (this.all_player_data[0].onplane !== this.previousid) {
        //         //console.log(this.all_player_data[0].plane_type);
        //         if (this.all_player_data[0].onplane) {
        //             console.log(this.all_player_data[0].plane_type, this.all_player_data[0].onplane.position.y, this.all_player_data[0].final_positiony);
        //         }
        //         console.log(this.all_player_data[0].plane_type, 'null', this.all_player_data[0].final_positiony);
        //         this.previousid = this.all_player_data[0].onplane;
        //     }
        // }
        if (this.die_sw === 1) {
            if (elapsedTime - this.die_time > 1.5 && this.fox.position.y < -27) {
                // for (let i = 0; i < this.all_player_data.length; i++) {
                //     this.all_player_data[i].name_mesh.remove();
                // }
                this.scene.remove(this.fox);
                this.gg_board.classList.add('fadeOut');
                //window.location.reload();
                this.die_time = elapsedTime;
            }

            else {
                this.fox.position.y -= 0.35;
            }
        }
        //########### update player data ########
        for (let i = 0; i < this.receive_player_data.length; i++) {
            if (this.receive_player_data[i].id !== this.myID) {
                for (let j = 0; j < this.all_player_data.length; j++) {
                    if (this.receive_player_data[i].id === this.all_player_data[j].id) {
                        this.all_player_data[j].final_positionx[0] = this.all_player_data[j].final_positionx[1];
                        this.all_player_data[j].final_positionx[1] = this.receive_player_data[i].positionx;
                        this.all_player_data[j].final_positiony[0] = this.all_player_data[j].final_positiony[1];
                        this.all_player_data[j].final_positiony[1] = this.receive_player_data[i].positiony;
                        this.all_player_data[j].animation = this.receive_player_data[i].animation;
                        this.all_player_data[j].plane_id = this.receive_player_data[i].plane_id;
                        this.all_player_data[j].emoji = this.receive_player_data[i].emoji;
                        this.all_player_data[j].rank = this.receive_player_data[i].rank;
                        //this.all_player_data[j].action = data.data[i].action;
                    }
                }
            }
            else if (this.receive_player_data[i].id === this.myID) {
                this.fox_finalpositionx = this.receive_player_data[i].positionx;
                this.fox_finalpositiony = this.receive_player_data[i].positiony;
            }
        }

        //########## draw plane #############
        if (this.plane_data) {
            for (let i = 0; i < this.plane_data.length; i++) {

                // const material = new THREE.MeshMatcapMaterial({ color: 0x1111cc })
                // material.matcap = this.plane_texture;
                let cube;
                let plane_type;
                let test = Math.abs(this.plane_data[i].id.substring(this.plane_data[i].id.length - 4, this.plane_data[i].id.length));

                if (test % 6 === 1) {
                    cube = this.trampoline.clone();
                    plane_type = 1;
                }

                else if (test % 6 === 2) {
                    cube = new THREE.Mesh(this.planegeometry, this.planematerial2);
                    plane_type = 2;
                }

                else if (test % 6 === 3) {
                    cube = this.convey.clone();
                    plane_type = 3;
                }

                else if (test % 6 === 4) {
                    cube = this.convey.clone();
                    cube.rotation.z = Math.PI;
                    plane_type = 4;
                }
                else if (test % 6 === 5) {
                    cube = this.sting_plane.clone();
                    plane_type = 5;
                }

                else {
                    cube = new THREE.Mesh(this.planegeometry, this.planematerial0);
                    plane_type = 0;
                }

                cube.position.y = -22.5;
                cube.position.x = this.plane_data[i].positionx;
                this.scene.add(cube);
                if (this.test_plane_size === null) {
                    const box = new THREE.Box3().setFromObject(cube);
                    this.test_plane_size = new THREE.Vector3();
                    box.getSize(this.test_plane_size);
                }

                this.objectsToUpdate.push({
                    id: this.plane_data[i].id,
                    mesh: cube,
                    start_time: elapsedTime,
                    plane_type: plane_type
                });

            }
            this.plane_data = null;
        }



        //if (this.fox) {
        if (elapsedTime - this.last_stabbed_time > 0.05)
            this.stabbed_plane.visible = false;
        else
            this.stabbed_plane.visible = true;
        //console.log(this.all_player_data.length)
        // if (this.worker && this.test_plane_size) {
        //     const worker_plane_data = [];
        //     const worker_remote_data = [];
        //     const plane_width = this.test_plane_size.x;
        //     for (let i = 0; i < this.objectsToUpdate.length; i++) {
        //         worker_plane_data.push({
        //             positiony: this.objectsToUpdate[i].mesh.position.y,
        //             positionx: this.objectsToUpdate[i].mesh.position.x,
        //             id: this.objectsToUpdate[i].id,
        //             start_time: this.objectsToUpdate[i].start_time
        //         })
        //     }
        //     for (let i = 0; i < this.all_player_data.length; i++) {
        //         worker_remote_data.push({
        //             positiony: this.all_player_data[i].mesh.position.y,
        //             positionx: this.all_player_data[i].mesh.position.x,
        //             final_positiony: this.all_player_data[i].final_positiony[1],
        //             plane_id: this.all_player_data[i].plane_id
        //         })
        //     }
        //     let data = {
        //         type: 'assign_plane',
        //         objectsToUpdate: worker_plane_data,
        //         all_player_data: worker_remote_data,
        //         elapsedTime: elapsedTime,
        //         test_plane_size: plane_width
        //     }
        //     this.worker.postMessage(data)

        // }

        for (let i = 0; i < this.objectsToUpdate.length; i++) {


            this.objectsToUpdate[i].mesh.position.y += 0.15;
            this.objectsToUpdate[i].mesh.position.y = Math.ceil(this.objectsToUpdate[i].mesh.position.y * 100) / 100;
            if (this.objectsToUpdate[i].mesh.position.y <= 21) {
                if (this.fox && this.die_sw === 0) {
                    if (Math.abs(this.fox.position.y - this.objectsToUpdate[i].mesh.position.y - 1) < 0.4) {
                        if (this.fox.position.x < this.objectsToUpdate[i].mesh.position.x + this.test_plane_size.x / 1.8
                            && this.fox.position.x > this.objectsToUpdate[i].mesh.position.x - this.test_plane_size.x / 1.8) {

                            if (this.fox_plane !== this.objectsToUpdate[i].mesh) {
                                this.fox_score++;
                                this.own_score.innerHTML = this.fox_score;
                                this.fox_onplane_time = elapsedTime;
                                this.fox_plane_id = this.objectsToUpdate[i].id;
                                this.fox_plane_type = this.objectsToUpdate[i].plane_type;
                                this.fox_plane = this.objectsToUpdate[i].mesh;
                            }
                        }
                    }
                }

                for (let j = 0; j < this.all_player_data.length; j++) {

                    if (Math.abs(this.all_player_data[j].mesh.position.y - this.objectsToUpdate[i].mesh.position.y - 1) < 0.4) {
                        if (this.all_player_data[j].mesh.position.x < this.objectsToUpdate[i].mesh.position.x + this.test_plane_size.x / 1.8
                            && this.all_player_data[j].mesh.position.x > this.objectsToUpdate[i].mesh.position.x - this.test_plane_size.x / 1.8) {

                            // if (this.all_player_data[j].onplane !== this.objectsToUpdate[i].mesh)
                            //     this.all_player_data[j].onplane_time = elapsedTime;
                            // this.all_player_data[j].onplane = this.objectsToUpdate[i].mesh;
                            // this.all_player_data[j].plane_type = this.objectsToUpdate[i].plane_type;
                            // this.all_player_data[j].object_id = this.objectsToUpdate[i].id;
                            // // if (this.objectsToUpdate[i].plane_type !== 2)
                            // //     this.all_player_data[j].mesh.position.y = this.objectsToUpdate[i].mesh.position.y + 1;

                            if (this.all_player_data[j].onplane !== null) {
                                if (this.objectsToUpdate[i].mesh.position.y <= this.all_player_data[j].onplane.position.y) {

                                    if (this.all_player_data[j].onplane !== this.objectsToUpdate[i].mesh)
                                        this.all_player_data[j].onplane_time = elapsedTime;
                                    this.all_player_data[j].onplane = this.objectsToUpdate[i].mesh;
                                    this.all_player_data[j].plane_type = this.objectsToUpdate[i].plane_type;
                                    if (this.all_player_data[j].mesh.position.y <= this.all_player_data[j].onplane.position.y + 1.4
                                        && this.all_player_data[j].plane_type !== 2) {
                                        this.all_player_data[j].mesh.position.y = this.all_player_data[j].onplane.position.y + 1
                                    }
                                }

                            }
                            else {
                                //if (this.objectsToUpdate[i].mesh.position.y - this.all_player_data[j].final_positiony[1] < 3) {
                                this.all_player_data[j].onplane_time = elapsedTime;
                                this.all_player_data[j].onplane = this.objectsToUpdate[i].mesh;
                                this.all_player_data[j].plane_type = this.objectsToUpdate[i].plane_type;
                                if (this.all_player_data[j].mesh.position.y <= this.all_player_data[j].onplane.position.y + 1.4
                                    && this.all_player_data[j].plane_type !== 2) {
                                    this.all_player_data[j].mesh.position.y = this.all_player_data[j].onplane.position.y + 1
                                }
                                //}
                            }

                        }
                    }
                    if (this.all_player_data[j].plane_id === this.objectsToUpdate[i].id) {
                        //&& Math.abs(this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony) > 1.5) {
                        // if (this.all_player_data[j].onplane) {
                        //     if (this.objectsToUpdate[i].mesh !== this.all_player_data[j].onplane
                        //         && this.objectsToUpdate[i].mesh.position.y <= this.all_player_data[j].onplane.position.y) {
                        //         //if (this.all_player_data[j].onplane !== this.objectsToUpdate[i].mesh)
                        //         this.all_player_data[j].onplane_time = elapsedTime;
                        //         this.all_player_data[j].onplane = this.objectsToUpdate[i].mesh;
                        //         this.all_player_data[j].plane_type = this.objectsToUpdate[i].plane_type;
                        //         this.all_player_data[j].object_id = this.objectsToUpdate[i].id;
                        //     }
                        // }
                        // else {
                        //     // if (this.all_player_data[j].mesh.position.y >= this.objectsToUpdate[i].mesh.position.y + 1) {
                        //     this.all_player_data[j].onplane_time = elapsedTime;
                        //     this.all_player_data[j].onplane = this.objectsToUpdate[i].mesh;
                        //     this.all_player_data[j].plane_type = this.objectsToUpdate[i].plane_type;
                        //     this.all_player_data[j].object_id = this.objectsToUpdate[i].id;
                        //     //}


                        // }
                        if (this.all_player_data[j].onplane !== null) {
                            if (this.objectsToUpdate[i].mesh.position.y <= this.all_player_data[j].onplane.position.y) {

                                if (this.all_player_data[j].onplane !== this.objectsToUpdate[i].mesh)
                                    this.all_player_data[j].onplane_time = elapsedTime;
                                this.all_player_data[j].onplane = this.objectsToUpdate[i].mesh;
                                this.all_player_data[j].plane_type = this.objectsToUpdate[i].plane_type;
                                if (this.all_player_data[j].mesh.position.y <= this.all_player_data[j].onplane.position.y + 1.4
                                    && this.all_player_data[j].plane_type !== 2) {
                                    this.all_player_data[j].mesh.position.y = this.all_player_data[j].onplane.position.y + 1
                                }
                            }

                        }
                        else {
                            //if (this.objectsToUpdate[i].mesh.position.y - this.all_player_data[j].final_positiony[1] < 3) {
                            this.all_player_data[j].onplane_time = elapsedTime;
                            this.all_player_data[j].onplane = this.objectsToUpdate[i].mesh;
                            this.all_player_data[j].plane_type = this.objectsToUpdate[i].plane_type;
                            if (this.all_player_data[j].mesh.position.y <= this.all_player_data[j].onplane.position.y + 1.4
                                && this.all_player_data[j].plane_type !== 2) {
                                this.all_player_data[j].mesh.position.y = this.all_player_data[j].onplane.position.y + 1
                            }
                            //}
                        }


                    }

                }
                //########## deal with left convey ############
                if (this.objectsToUpdate[i].plane_type === 3) {
                    this.objectsToUpdate[i].mesh.children[this.objectsToUpdate[i].mesh.children.length - 2].rotation.z = elapsedTime * 2;
                    this.objectsToUpdate[i].mesh.children[this.objectsToUpdate[i].mesh.children.length - 3].rotation.z = elapsedTime * 2;
                    for (let j = 0; j < this.objectsToUpdate[i].mesh.children.length - 4; j++) {
                        if (this.objectsToUpdate[i].mesh.children[j].position.y >= this.objectsToUpdate[i].mesh.children[this.objectsToUpdate[i].mesh.children.length - 1].position.y + .9) {
                            this.objectsToUpdate[i].mesh.children[j].position.x -= 1 / 20;
                            if (this.objectsToUpdate[i].mesh.children[j].position.x < this.objectsToUpdate[i].mesh.children[this.objectsToUpdate[i].mesh.children.length - 1].position.x - 5) {
                                this.objectsToUpdate[i].mesh.children[j].position.y -= 1.8;
                            }
                        }
                        else if (this.objectsToUpdate[i].mesh.children[j].position.y <= this.objectsToUpdate[i].mesh.children[this.objectsToUpdate[i].mesh.children.length - 1].position.y - .9) {
                            this.objectsToUpdate[i].mesh.children[j].position.x += 1 / 20;
                            if (this.objectsToUpdate[i].mesh.children[j].position.x > this.objectsToUpdate[i].mesh.children[this.objectsToUpdate[i].mesh.children.length - 1].position.x + 5) {
                                this.objectsToUpdate[i].mesh.children[j].position.y += 1.8;
                            }
                        }
                    }
                }
                //########### deal with right convey ############
                if (this.objectsToUpdate[i].plane_type === 4) {
                    this.objectsToUpdate[i].mesh.children[this.objectsToUpdate[i].mesh.children.length - 2].rotation.z = - elapsedTime * 2;
                    this.objectsToUpdate[i].mesh.children[this.objectsToUpdate[i].mesh.children.length - 3].rotation.z = -elapsedTime * 2;
                    for (let j = 0; j < this.objectsToUpdate[i].mesh.children.length - 4; j++) {
                        if (this.objectsToUpdate[i].mesh.children[j].position.y >= this.objectsToUpdate[i].mesh.children[this.objectsToUpdate[i].mesh.children.length - 1].position.y + .9) {
                            this.objectsToUpdate[i].mesh.children[j].position.x += 1 / 20;
                            if (this.objectsToUpdate[i].mesh.children[j].position.x > this.objectsToUpdate[i].mesh.children[this.objectsToUpdate[i].mesh.children.length - 1].position.x + 5) {
                                this.objectsToUpdate[i].mesh.children[j].position.y -= 1.8;
                            }
                        }
                        else if (this.objectsToUpdate[i].mesh.children[j].position.y <= this.objectsToUpdate[i].mesh.children[this.objectsToUpdate[i].mesh.children.length - 1].position.y - .9) {
                            this.objectsToUpdate[i].mesh.children[j].position.x -= 1 / 20;
                            if (this.objectsToUpdate[i].mesh.children[j].position.x < this.objectsToUpdate[i].mesh.children[this.objectsToUpdate[i].mesh.children.length - 1].position.x - 5) {
                                this.objectsToUpdate[i].mesh.children[j].position.y += 1.8;
                            }
                        }
                    }
                }
                //######### deal with remain rotation of fake plane  ###########
                if (this.objectsToUpdate[i].mesh.rotation.x !== 0) {
                    if (this.objectsToUpdate[i].mesh.rotation.x < Math.PI * 2)
                        this.objectsToUpdate[i].mesh.rotation.x += Math.PI / 10;
                    if (this.objectsToUpdate[i].mesh.rotation.x >= Math.PI * 2)
                        this.objectsToUpdate[i].mesh.rotation.x = 0
                }


            }
            else if (this.objectsToUpdate[i].mesh.position.y > 23) {
                // if (this.objectsToUpdate[i].mesh === this.fox_plane) {
                //     this.fox_plane_id = null;
                //     this.fox_plane = null
                // }
                // for (let j = 0; j < this.all_player_data.length; j++) {
                //     if (this.objectsToUpdate[i].mesh === this.all_player_data[j].onplane) {
                //         this.all_player_data[j].onplane = null;
                //         this.all_player_data[j].plane_type = -1;
                //     }
                // }

                this.scene.remove(this.objectsToUpdate[i].mesh);
                this.objectsToUpdate.splice(i, 1);
            }



        }
        if (this.ready_for_load_model) {

            // this.worker.onmessage = (e) => {

            //     if (e.data.type === 'assign_plane') {

            //         for (let j = 0; j < e.data.data.length; j++) {
            //             //console.log(e.data.type)
            //             //console.log(e.data.data[j].player, e.data.data[j].plane)
            //             if (this.all_player_data[e.data.data[j].player].onplane !== null) {
            //                 if (this.objectsToUpdate[e.data.data[j].plane].mesh.position.y <= this.all_player_data[e.data.data[j].player].onplane.position.y) {

            //                     if (this.all_player_data[e.data.data[j].player].onplane !== this.objectsToUpdate[e.data.data[j].plane].mesh)
            //                         this.all_player_data[e.data.data[j].player].onplane_time = elapsedTime;
            //                     this.all_player_data[e.data.data[j].player].onplane = this.objectsToUpdate[e.data.data[j].plane].mesh;
            //                     this.all_player_data[e.data.data[j].player].plane_type = this.objectsToUpdate[e.data.data[j].plane].plane_type;

            //                 }

            //             }
            //             else {
            //                 if (this.objectsToUpdate[e.data.data[j].plane].mesh.position.y - this.all_player_data[e.data.data[j].player].final_positiony[1] < 3) {
            //                     this.all_player_data[e.data.data[j].player].onplane_time = elapsedTime;
            //                     this.all_player_data[e.data.data[j].player].onplane = this.objectsToUpdate[e.data.data[j].plane].mesh;
            //                     this.all_player_data[e.data.data[j].player].plane_type = this.objectsToUpdate[e.data.data[j].plane].plane_type;
            //                     if (this.all_player_data[e.data.data[j].player].mesh.position.y < this.all_player_data[e.data.data[j].player].onplane.position.y + 1) {
            //                         this.all_player_data[e.data.data[j].player].mesh.position.y = this.all_player_data[e.data.data[j].player].onplane.position.y + 1
            //                     }
            //                 }
            //                 //&& (this.all_player_data[e.data.data[j].player].mesh.position.y - this.objectsToUpdate[e.data.data[j].plane].mesh.position.y - 1) < 0.4) {
            //                 //this.all_player_data[e.data.data[j].player].mesh.position.y = this.objectsToUpdate[e.data.data[j].plane].mesh.position.y + 1;


            //                 //}
            //                 //if (this.all_player_data[e.data.data[j].player].mesh.position.y >= this.objectsToUpdate[e.data.data[j].plane].mesh.position.y - 0.4) {

            //                 //}

            //             }




            //             // if (Math.abs(all_player_data[all_player_data[e.data.data[j].player].mesh.position.y - e.data.data[j].player].onplane.position.y - 1) < 0.8
            //             //     && this.all_player_data[e.data.data[j].player].plane_type !== 2) {
            //             //     this.all_player_data[e.data.data[j].player].mesh.position.y = this.all_player_data[e.data.data[j].player].onplane.position.y + 1;
            //             // }
            //         }
            //     }
            // }
            //########### handel remote player ##############
            for (let j = 0; j < this.all_player_data.length; j++) {


                if (this.all_player_data[j].onplane) {
                    if (this.all_player_data[j].onplane.position.y > 21) {
                        this.all_player_data[j].onplane = null;
                        this.all_player_data[j].plane_type = -1;
                    }

                }
                // if (this.all_player_data[j].onplane) {
                //     if (this.all_player_data[j].onplane.position.y - this.all_player_data[j].final_positiony[1] >= 3
                //         && this.all_player_data[j].object_id === this.all_player_data[j].plane_id) {
                //         this.all_player_data[j].onplane = null;
                //         this.all_player_data[j].plane_type = -1;
                //     }
                // }


                if (this.all_player_data[j].mesh.position.x > this.camera.position.x - this.screenWidth
                    && this.all_player_data[j].mesh.position.x < this.camera.position.x + this.screenWidth) {


                    if (this.all_player_data[j].plane_type !== 3 && this.all_player_data[j].plane_type !== 4) {


                        let test = Math.abs(this.all_player_data[j].final_positionx[1] - this.all_player_data[j].mesh.position.x);
                        let test1 = Math.abs(this.all_player_data[j].final_positionx[0] - this.all_player_data[j].mesh.position.x);
                        // if (test > 0.25 && test1 > 0.25) {
                        //     this.all_player_data[j].mesh.position.x = this.myBezier(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[0], this.all_player_data[j].final_positionx[1], 0.25 / test);
                        // }
                        // else
                        if (test >= 0.25) {
                            this.all_player_data[j].mesh.position.x = this.myLerp(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[1], 0.25 / test);
                        }
                        else if (test < 0.25) {
                            this.all_player_data[j].mesh.position.x = this.all_player_data[j].final_positionx[1];
                        }
                        // else {
                        //     if (this.all_player_data[j].final_positionx[1] > this.all_player_data[j].mesh.position.x)
                        //         this.all_player_data[j].mesh.position.x += 0.25;
                        //     else
                        //         this.all_player_data[j].mesh.position.x -= 0.25;
                        // }



                    }
                    else if (this.all_player_data[j].onplane && this.all_player_data[j].plane_type === 3) {
                        let test = Math.abs(this.all_player_data[j].final_positionx[1] - this.all_player_data[j].mesh.position.x);
                        if (this.all_player_data[j].final_positionx[1] - this.all_player_data[j].mesh.position.x >= 0.1) {
                            // this.all_player_data[j].mesh.position.lerp(new THREE.Vector3(this.all_player_data[j].final_positionx, this.all_player_data[j].mesh.position.y, 0), 0.1 / test)
                            this.all_player_data[j].mesh.position.x = this.myLerp(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[1], 0.1 / test);
                            // this.all_player_data[j].mesh.position.x = this.myBezier(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[0], this.all_player_data[j].final_positionx[1], 0.1 / test);
                        }
                        else if (this.all_player_data[j].mesh.position.x - this.all_player_data[j].final_positionx[1] >= 0.8) {
                            // this.all_player_data[j].mesh.position.lerp(new THREE.Vector3(this.all_player_data[j].final_positionx, this.all_player_data[j].mesh.position.y, 0), 0.4 / test)
                            this.all_player_data[j].mesh.position.x = this.myLerp(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[1], 0.4 / test);
                            //this.all_player_data[j].mesh.position.x = this.myBezier(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[0], this.all_player_data[j].final_positionx[1], 0.4 / test);
                        }
                        else if (this.all_player_data[j].mesh.position.x - this.all_player_data[j].final_positionx[1] >= 0.15) {
                            // this.all_player_data[j].mesh.position.lerp(new THREE.Vector3(this.all_player_data[j].final_positionx, this.all_player_data[j].mesh.position.y, 0), 0.15 / test)
                            this.all_player_data[j].mesh.position.x = this.myLerp(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[1], 0.15 / test);
                            //this.all_player_data[j].mesh.position.x = this.myBezier(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[0], this.all_player_data[j].final_positionx[1], 0.15 / test);
                        }
                        // if (this.all_player_data[j].mesh.position.y - this.all_player_data[j].onplane.position.y - 1 < 0.4
                        //     && this.all_player_data[j].mesh.position.x < this.all_player_data[j].onplane.position.x + this.test_plane_size.x / 1.8
                        //     && this.all_player_data[j].mesh.position.x > this.all_player_data[j].onplane.position.x - this.test_plane_size.x / 1.8) {
                        //     if (this.all_player_data[j].animation == 1) {
                        //         this.all_player_data[j].mesh.position.x -= 0.4;
                        //     }
                        //     else if (this.all_player_data[j].animation == 2) {
                        //         this.all_player_data[j].mesh.position.x += 0.1;
                        //     }
                        //     else if (this.all_player_data[j].animation == 0) {
                        //         this.all_player_data[j].mesh.position.x -= 0.15;
                        //     }
                        // }

                    }
                    else if (this.all_player_data[j].onplane && this.all_player_data[j].plane_type === 4) {
                        let test = Math.abs(this.all_player_data[j].final_positionx[1] - this.all_player_data[j].mesh.position.x);
                        if (this.all_player_data[j].mesh.position.x - this.all_player_data[j].final_positionx[1] >= 0.1) {
                            // this.all_player_data[j].mesh.position.lerp(new THREE.Vector3(this.all_player_data[j].final_positionx, this.all_player_data[j].mesh.position.y, 0), 0.1 / test)
                            this.all_player_data[j].mesh.position.x = this.myLerp(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[1], 0.1 / test);
                            //this.all_player_data[j].mesh.position.x = this.myBezier(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[0], this.all_player_data[j].final_positionx[1], 0.1 / test);
                        }
                        else if (this.all_player_data[j].final_positionx[1] - this.all_player_data[j].mesh.position.x >= 0.8) {
                            // this.all_player_data[j].mesh.position.lerp(new THREE.Vector3(this.all_player_data[j].final_positionx, this.all_player_data[j].mesh.position.y, 0), 0.4 / test)
                            this.all_player_data[j].mesh.position.x = this.myLerp(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[1], 0.4 / test);
                            //this.all_player_data[j].mesh.position.x = this.myBezier(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[0], this.all_player_data[j].final_positionx[1], 0.4 / test);
                        }
                        else if (this.all_player_data[j].final_positionx[1] - this.all_player_data[j].mesh.position.x >= 0.15) {
                            // this.all_player_data[j].mesh.position.lerp(new THREE.Vector3(this.all_player_data[j].final_positionx, this.all_player_data[j].mesh.position.y, 0), 0.15 / test)
                            this.all_player_data[j].mesh.position.x = this.myLerp(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[1], 0.15 / test);
                            //this.all_player_data[j].mesh.position.x = this.myBezier(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positionx[0], this.all_player_data[j].final_positionx[1], 0.15 / test);
                        }
                        // if (this.all_player_data[j].mesh.position.y - this.all_player_data[j].onplane.position.y - 1 < 0.4
                        //     && this.all_player_data[j].mesh.position.x < this.all_player_data[j].onplane.position.x + this.test_plane_size.x / 1.8
                        //     && this.all_player_data[j].mesh.position.x > this.all_player_data[j].onplane.position.x - this.test_plane_size.x / 1.8) {
                        //     if (this.all_player_data[j].animation == 1) {
                        //         this.all_player_data[j].mesh.position.x -= 0.1;
                        //     }
                        //     else if (this.all_player_data[j].animation == 2) {
                        //         this.all_player_data[j].mesh.position.x += 0.4;
                        //     }
                        //     else if (this.all_player_data[j].animation == 0) {
                        //         this.all_player_data[j].mesh.position.x += 0.15;
                        //     }
                        // }

                    }
                    if (this.all_player_data[j].onplane) {
                        if (this.all_player_data[j].onplane.position.y - this.all_player_data[j].final_positiony[1] >= 3) {
                            if (this.all_player_data[j].onplane !== this.previousid) {
                                console.log('>3', this.all_player_data[j].plane_type, this.all_player_data[j].onplane.position.y, this.all_player_data[j].final_positiony[1]);
                                this.previousid = this.all_player_data[j].onplane;
                            }
                        }
                        if (this.all_player_data[j].mesh.position.x >= this.all_player_data[j].onplane.position.x + this.test_plane_size.x / 1.8
                            || this.all_player_data[j].mesh.position.x <= this.all_player_data[j].onplane.position.x - this.test_plane_size.x / 1.8) {

                            if (this.all_player_data[j].onplane !== this.previousid) {
                                console.log('bc 1.8', this.all_player_data[j].plane_type, this.all_player_data[j].onplane.position.x, this.all_player_data[j].mesh.position.x);
                                this.previousid = this.all_player_data[j].onplane;
                            }
                        }
                    }


                    if (this.all_player_data[j].onplane === null) {

                        let test = Math.abs(this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony[1]);
                        let test1 = (this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony[0]);
                        // if (test > 0.15 && test1 > 0.15) {
                        //     this.all_player_data[j].mesh.position.y = this.myBezier(this.all_player_data[j].mesh.position.y, this.all_player_data[j].final_positiony[0], this.all_player_data[j].final_positiony[1], 0.15 / test);
                        // }
                        // else 
                        if (test >= 3) {
                            this.all_player_data[j].mesh.position.y = this.myLerp(this.all_player_data[j].mesh.position.y, this.all_player_data[j].final_positiony[1], 0.15 / test);
                        }
                        else {
                            //this.all_player_data[j].mesh.position.y = this.all_player_data[j].final_positiony[1];
                            this.all_player_data[j].mesh.position.y -= 0.15;
                        }




                        // this.all_player_data[j].onplane = null;
                        // this.all_player_data[j].plane_type = -1;

                    }
                    else if (this.all_player_data[j].onplane) {


                        if (this.all_player_data[j].mesh.position.x < this.all_player_data[j].onplane.position.x + this.test_plane_size.x / 1.8
                            && this.all_player_data[j].mesh.position.x > this.all_player_data[j].onplane.position.x - this.test_plane_size.x / 1.8
                            && this.all_player_data[j].onplane.position.y - this.all_player_data[j].final_positiony[1] < 3) {
                            if (this.all_player_data[j].plane_type === 1) {

                                this.all_player_data[j].onplane.children[this.all_player_data[j].onplane.children.length - 1].position.y = -.8 + (Math.cos(Math.PI * ((elapsedTime - this.all_player_data[j].onplane_time) * 22)) * 0.04) * 1.5;
                                this.all_player_data[j].onplane.children[this.all_player_data[j].onplane.children.length - 2].position.y = .8 + (Math.cos(Math.PI * ((elapsedTime - this.all_player_data[j].onplane_time) * 22)) * 0.1) * 1.5;
                                this.all_player_data[j].mesh.position.y = this.all_player_data[j].onplane.position.y + Math.sin(Math.PI * ((elapsedTime - this.all_player_data[j].onplane_time) * 2.8)) * 2;
                                this.all_player_data[j].mesh.position.y += 3;

                            }
                            else if (this.all_player_data[j].plane_type === 2) {
                                let test = Math.abs(this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony[1]);
                                let test1 = (this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony[0]);
                                // if (test > 0.15 && test1 > 0.15) {
                                //     this.all_player_data[j].mesh.position.y = this.myBezier(this.all_player_data[j].mesh.position.y, this.all_player_data[j].final_positiony[0], this.all_player_data[j].final_positiony[1], 0.15 / test);
                                // }
                                // else 
                                if (test >= 3) {
                                    this.all_player_data[j].mesh.position.y = this.myLerp(this.all_player_data[j].mesh.position.y, this.all_player_data[j].final_positiony[1], 0.15 / test);
                                }
                                else {
                                    //this.all_player_data[j].mesh.position.y = this.all_player_data[j].final_positiony[1];
                                    this.all_player_data[j].mesh.position.y -= 0.15;

                                }
                                if (this.all_player_data[j].mesh.position.y < this.all_player_data[j].onplane.position.y + 1) {
                                    if (this.all_player_data[j].onplane.rotation.x === 0)
                                        this.all_player_data[j].onplane.rotation.x += Math.PI / 10;
                                    this.all_player_data[j].onplane = null;
                                    this.all_player_data[j].plane_type = -1;

                                }

                                else {
                                    // if (this.all_player_data[j].onplane.position.y + 1 - this.all_player_data[j].final_positiony[1] >= 0.4) {
                                    //     let test = Math.abs(this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony[1]);
                                    //     let test1 = (this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony[0]);
                                    //     // if (test > 0.15 && test1 > 0.15) {
                                    //     //     this.all_player_data[j].mesh.position.y = this.myBezier(this.all_player_data[j].mesh.position.y, this.all_player_data[j].final_positiony[0], this.all_player_data[j].final_positiony[1], 0.15 / test);
                                    //     // }
                                    //     // else 
                                    //     if (test > 0.15) {
                                    //         this.all_player_data[j].mesh.position.y = this.myLerp(this.all_player_data[j].mesh.position.y, this.all_player_data[j].final_positiony[1], 0.15 / test);
                                    //     }
                                    //     else {
                                    //         //this.all_player_data[j].mesh.position.y = this.all_player_data[j].final_positiony[1];
                                    //         this.all_player_data[j].mesh.position.y -= 0.15;
                                    //     }

                                    //     //this.all_player_data[j].mesh.position.y -= 0.15;
                                    //     // this.all_player_data[j].mesh.position.lerp(new THREE.Vector3(this.all_player_data[j].mesh.position.x, this.all_player_data[j].final_positiony, 0), 0.15 / test)

                                    //     this.all_player_data[j].onplane.rotation.x += Math.PI / 10;
                                    //     this.all_player_data[j].onplane = null;
                                    //     this.all_player_data[j].plane_type = -1;

                                    // }
                                    // if (elapsedTime - this.all_player_data[j].onplane_time > 0.1) {
                                    //     this.all_player_data[j].onplane.rotation.x += Math.PI / 10;
                                    //     this.all_player_data[j].onplane = null;
                                    //     this.all_player_data[j].plane_type = -1;
                                    // }
                                    // else {
                                    // this.all_player_data[j].mesh.position.y = this.all_player_data[j].onplane.position.y + 1;
                                    // }
                                }
                            }

                            else {

                                if (this.all_player_data[j].mesh.position.y > this.all_player_data[j].onplane.position.y + 1.4) {
                                    let test = Math.abs(this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony[1]);
                                    let test1 = (this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony[0]);
                                    // if (test > 0.15 && test1 > 0.15) {
                                    //     this.all_player_data[j].mesh.position.y = this.myBezier(this.all_player_data[j].mesh.position.y, this.all_player_data[j].final_positiony[0], this.all_player_data[j].final_positiony[1], 0.15 / test);
                                    // }
                                    // else 
                                    if (test >= 3) {
                                        this.all_player_data[j].mesh.position.y = this.myLerp(this.all_player_data[j].mesh.position.y, this.all_player_data[j].final_positiony[1], 0.15 / test);
                                    }
                                    else {
                                        //this.all_player_data[j].mesh.position.y = this.all_player_data[j].final_positiony[1];
                                        this.all_player_data[j].mesh.position.y -= 0.15;
                                    }



                                    // this.all_player_data[j].onplane = null;
                                    // this.all_player_data[j].plane_type = -1;


                                }
                                else {

                                    this.all_player_data[j].mesh.position.y = this.all_player_data[j].onplane.position.y + 1;

                                }
                            }
                        }
                        else {

                            let test = Math.abs(this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony[1]);
                            let test1 = (this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony[0]);
                            // if (test > 0.15 && test1 > 0.15) {
                            //     this.all_player_data[j].mesh.position.y = this.myBezier(this.all_player_data[j].mesh.position.y, this.all_player_data[j].final_positiony[0], this.all_player_data[j].final_positiony[1], 0.15 / test);
                            // }
                            // else
                            if (test >= 3) {
                                this.all_player_data[j].mesh.position.y = this.myLerp(this.all_player_data[j].mesh.position.y, this.all_player_data[j].final_positiony[1], 0.15 / test);
                            }
                            else {
                                //this.all_player_data[j].mesh.position.y = this.all_player_data[j].final_positiony[1];
                                this.all_player_data[j].mesh.position.y -= 0.15;
                            }



                            this.all_player_data[j].onplane = null;
                            this.all_player_data[j].plane_type = -1;

                        }
                        // if (this.all_player_data[j].mesh.position.y > 23.5) {
                        //     this.all_player_data[j].mesh.position.y -= 6.3;
                        //     //this.all_player_data[j].mesh.position.y = this.all_player_data[j].final_positiony[1];
                        //     this.all_player_data[j].onplane = null;
                        //     this.all_player_data[j].plane_type = -1;
                        // }
                        // if (this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony[1] >= 6.3) {
                        //     //this.all_player_data[j].mesh.position.y -= 6.3;
                        //     // let test = (this.all_player_data[j].mesh.position.y - this.all_player_data[j].final_positiony[1]);
                        //     // this.all_player_data[j].mesh.position.y = this.myLerp(this.all_player_data[j].mesh.position.y, this.all_player_data[j].final_positiony[1], 6.3 / test);
                        //     this.all_player_data[j].mesh.position.y = this.all_player_data[j].final_positiony[1];
                        //     this.all_player_data[j].onplane = null;
                        //     this.all_player_data[j].plane_type = -1;
                        // }
                        // let modify = new THREE.Vector3(this.all_player_data[j].final_positionx[1], this.all_player_data[j].final_positiony[1], 0);
                        // if (modify.distanceTo(this.all_player_data[j].mesh.position) > 10) {
                        //     this.all_player_data[j].mesh.position.y = this.all_player_data[j].final_positiony[1];
                        //     this.all_player_data[j].mesh.position.x = this.all_player_data[j].final_positionx[1];
                        //     this.all_player_data[j].onplane = null;
                        //     this.all_player_data[j].plane_type = -1;
                        //     console.log('moder');
                        // }




                        // if (this.all_player_data[j].plane_type === 3) {
                        //     this.all_player_data[j].mesh.position.x -= 0.15;
                        // }
                        // if (this.all_player_data[j].plane_type === 4) {
                        //     this.all_player_data[j].mesh.position.x += 0.15;
                        // }
                    }
                    // if (this.all_player_data[j].mesh.position.y > this.all_player_data[j].final_positiony + 0.5) {
                    //     //this.all_player_data[j].mesh.position.y -= 0.15
                    //     //this.all_player_data[j].onplane = null;
                    //     this.all_player_data[j].mesh.position.y = this.all_player_data[j].final_positiony;
                    // }
                    // if (this.all_player_data[j].mesh.position.y < this.all_player_data[j].final_positiony - 0.15) {
                    //     //this.all_player_data[j].mesh.position.y += 0.15
                    //     if (!this.all_player_data[j].onplane)
                    //         this.all_player_data[j].mesh.position.y = this.all_player_data[j].final_positiony;

                    // }
                    // if (this.all_player_data[j].mesh.position.distanceTo(this.fox.position) <= 3.95
                    // ) {
                    //     if (this.all_player_data[j].mixer[this.all_player_data[j].animation])
                    //         this.all_player_data[j].mixer[this.all_player_data[j].animation].update(deltaTime);
                    //     if (this.all_player_data[j].action === 0) {
                    //         this.all_player_data[j].mesh.rotation.y = -Math.PI / 2;
                    //     }
                    //     else if (this.all_player_data[j].action === 1) {
                    //         this.all_player_data[j].mesh.rotation.y = Math.PI / 2;
                    //     }
                    //     else {
                    //         this.all_player_data[j].mesh.rotation.y = 0;
                    //     }
                    // }

                    if (this.fox
                        && new THREE.Vector3(this.all_player_data[j].mesh.position.x, this.all_player_data[j].mesh.position.y, 0).distanceTo(new THREE.Vector3(this.fox.position.x, this.fox.position.y, 0)) <= 3.7
                        && this.all_player_data[j].onplane
                        && this.fox_plane) {

                        if (this.all_player_data[j].final_positionx[1] > this.fox_finalpositionx) {
                            //this.all_player_data[j].mesh.position.x += 0.25;
                            // if (this.all_player_data[j].animation === 1)
                            //     this.fox.position.x -= 0.5;
                            // else
                            this.right_block = 1;
                            this.fox.position.x -= 0.25
                        }
                        else {
                            //this.all_player_data[j].mesh.position.x -= 0.25;
                            // if (this.all_player_data[j].animation === 2)
                            //     this.fox.position.x += 0.5;
                            // else
                            this.left_block = 1;
                            this.fox.position.x += 0.25
                        }

                    }



                    this.Animate_Character(this.all_player_data[j].mesh, this.all_player_data[j].animation, elapsedTime, this.all_player_data[j].emoji);


                    // if (this.all_player_data[j].mixer[this.all_player_data[j].animation]) {
                    //     this.all_player_data[j].mixer[this.all_player_data[j].animation].update(deltaTime)
                    //     if (this.all_player_data[j].animation !== 1) {
                    //         this.all_player_data[j].mesh.rotation.y = 0;
                    //     }
                    // }

                    let test_pos = this.toXYCoords(this.all_player_data[j].mesh);
                    this.all_player_data[j].name_mesh.style.transform = `translateX(${test_pos.x}px) translateY(${test_pos.y}px)`
                    this.all_player_data[j].name_mesh.style.top = window.innerHeight / 2 + 'px';
                    this.all_player_data[j].name_mesh.style.left = window.innerWidth / 2 + 'px';
                    if (this.all_player_data[j].rank === 1) {
                        //console.log(this.all_player_data[j].name_mesh.style.color)
                        this.all_player_data[j].name_mesh.style.color = 'gold';
                        this.all_player_data[j].name_mesh.innerHTML = '<font size="6vmin">👑</font>' + this.all_player_data[j].name;
                    }
                    else {
                        this.all_player_data[j].name_mesh.style.color = 'white';
                        this.all_player_data[j].name_mesh.innerHTML = this.all_player_data[j].name;
                    }
                }
                else {
                    this.all_player_data[j].mesh.position.x = this.all_player_data[j].final_positionx[1];
                    this.all_player_data[j].mesh.position.y = this.all_player_data[j].final_positiony[1];
                    this.all_player_data[j].name_mesh.style.transform = `translateX(10000px) translateY(10000px)`
                }



                if (Math.abs(this.all_player_data[j].final_positionx[1] - this.all_player_data[j].mesh.position.x) >= 9) {
                    this.all_player_data[j].mesh.position.x = this.all_player_data[j].final_positionx[1];
                    console.log('moderx');
                }
                if (Math.abs(this.all_player_data[j].final_positiony[1] - this.all_player_data[j].mesh.position.y) >= 9) {
                    this.all_player_data[j].mesh.position.y = this.all_player_data[j].final_positiony[1];
                    console.log('modery');
                }
                this.all_player_data[j].mesh.position.y = Math.ceil(this.all_player_data[j].mesh.position.y * 100) / 100;
                this.all_player_data[j].mesh.position.x = Math.ceil(this.all_player_data[j].mesh.position.x * 100) / 100;


            }
            // if (this.all_player_data[j].onplane && this.all_player_data[j].onplane.position.y > 22.5) {
            //     this.all_player_data[j].onplane = null;
            //     this.all_player_data[j].plane_type = -1;
            // }

        }



        //############### handel fox ###############
        //if (this.fox_plane && this.fox_plane.position.y > 22.5) {
        // this.fox_plane_id = null;
        // this.fox_plane = null
        //}
        if (this.fox && this.die_sw === 0) {
            this.camera.position.x = this.fox.position.x;



            //###### handel emoji ########
            if (this.emoji_button_sw) {
                if (elapsedTime - this.emoji_time > 3 && this.emoji_sw !== -1) {
                    this.emoji_time = elapsedTime;
                    this.emoji = this.emoji_sw;
                }
                else {
                    this.emoji_sw = -1;
                }
            }
            else {
                if (elapsedTime - this.emoji_time > 3) {
                    this.emoji = -1;
                }
            }


            // this.pointer.position.x = this.fox.position.x;
            // this.pointer.position.y = this.fox.position.y + 5;
            if (this.left_sw) {

                this.fox_animation = 1;
                // this.fox.rotation.y = -Math.PI / 2
                if (this.left_block === 0)
                    this.fox.position.x -= 0.25;
                this.Animate_Character(this.fox, 1, elapsedTime, this.emoji);
            }
            else if (this.right_sw) {

                this.fox_animation = 2;
                //this.fox.rotation.y = Math.PI / 2
                if (this.right_block === 0)
                    this.fox.position.x += 0.25;
                this.Animate_Character(this.fox, 2, elapsedTime, this.emoji);
            }
            else {

                if (!this.fox_plane) {
                    if (!this.left_sw && !this.right_sw) {
                        this.fox_animation = 3;
                        this.Animate_Character(this.fox, 3, elapsedTime, this.emoji);
                    }
                }
                // else {
                //     this.fox_animation = 3;
                //     this.Animate_Character(this.fox, 3, elapsedTime);
                // }

            }
            if (this.fox_plane) {


                if (this.fox.position.x < this.fox_plane.position.x - this.test_plane_size.x / 1.8
                    || this.fox.position.x > this.fox_plane.position.x + this.test_plane_size.x / 1.8) {
                    this.fox_plane = null;
                    this.fox_plane_id = null;
                    if (!this.left_sw && !this.right_sw) {
                        this.fox_animation = 3;
                        this.Animate_Character(this.fox, 3, elapsedTime, this.emoji);
                    }

                }
            }
            if (this.fox_plane) {

                if (this.fox_plane_type === 1) {

                    //this.spring_audio.pause();
                    if (this.fox.position.y - this.fox_plane.position.y - 1 < 0.4 && this.spring_sound_play === 0) {
                        this.spring_sound_play = 1;

                        if (this.fox_life < 10) {
                            this.fox_life++;
                        }
                        if (this.fox_onplane_time !== elapsedTime)
                            this.fox_score++;
                        this.own_score.innerHTML = this.fox_score;
                    }
                    else if (this.fox.position.y - this.fox_plane.position.y - 1 >= 0.4 && this.spring_sound_play === 1) {
                        this.spring_sound_play = 0;
                    }
                    if (this.spring_sound_play === 1) {
                        this.spring_audio.play();
                    }
                    this.fox_plane.children[this.fox_plane.children.length - 1].position.y = -.8 + (Math.cos(Math.PI * ((elapsedTime - this.fox_onplane_time) * 22)) * 0.04) * 1.5;
                    this.fox_plane.children[this.fox_plane.children.length - 2].position.y = .8 + (Math.cos(Math.PI * ((elapsedTime - this.fox_onplane_time) * 22)) * 0.1) * 1.5;
                    this.fox.position.y = this.fox_plane.position.y + Math.sin(Math.PI * ((elapsedTime - this.fox_onplane_time) * 2.8)) * 2;
                    this.fox.position.y += 3;

                    //if (!this.right_sw && !this.left_sw) {
                    if (!this.left_sw && !this.right_sw) {
                        this.fox_animation = 3;
                        this.Animate_Character(this.fox, 3, elapsedTime, this.emoji);
                    }
                    //}
                    // if (this.fox.position.y > 22) {
                    //     this.fox_plane = null;
                    //     //this.fox.position.lerp(new THREE.Vector3(this.fox.position.x, this.fox.position.y - 5, 0), 0.15);
                    //     this.fox.position.y -= 5;
                    //     if (this.fox_life > 0) {
                    //         this.fox_life -= 2;
                    //     }
                    // }



                }
                else if (this.fox_plane_type === 2) {
                    if (elapsedTime - this.fox_onplane_time > 0.1) {

                        this.fox.position.y -= 0.15;
                        this.fox_plane.rotation.x += Math.PI / 10;
                        this.fox_plane = null;
                        if (!this.left_sw && !this.right_sw) {
                            this.fox_animation = 3;
                            this.Animate_Character(this.fox, 3, elapsedTime, this.emoji);
                        }
                    }
                    else {
                        this.fox_previousPlane = this.fox_plane;
                        this.fox.position.y = this.fox_plane.position.y + 1;
                        if (!this.left_sw && !this.right_sw) {
                            this.fox_animation = 0;
                            this.Animate_Character(this.fox, 0, elapsedTime, this.emoji);
                        }
                    }

                }

                else {
                    this.fox.position.y = this.fox_plane.position.y + 1;
                    if (!this.left_sw && !this.right_sw) {
                        this.fox_animation = 0;
                        this.Animate_Character(this.fox, 0, elapsedTime, this.emoji);
                    }
                }

                if (this.fox_plane_type === 0) {
                    if (this.fox_previousPlane !== this.fox_plane) {
                        this.plane_audio.play();
                        if (this.fox_life < 10)
                            this.fox_life++;
                    }

                }

                if (this.fox_plane_type === 2) {
                    if (this.fox_previousPlane !== this.fox_plane) {
                        this.fake_audio.play();
                        if (this.fox_life < 10)
                            this.fox_life++;
                    }
                }
                if (this.fox_plane_type === 3) {
                    this.fox.position.x -= 0.15;
                    if (this.fox_previousPlane !== this.fox_plane) {
                        this.convey_audio.play();
                        if (this.fox_life < 10)
                            this.fox_life++;
                    }

                }
                if (this.fox_plane_type === 4) {
                    this.fox.position.x += 0.15;
                    if (this.fox_previousPlane !== this.fox_plane) {
                        this.convey_audio.play();
                        if (this.fox_life < 10)
                            this.fox_life++;
                    }

                }
                if (this.fox_plane_type === 5) {

                    if (this.fox_life > 0 && this.fox_previousPlane !== this.fox_plane) {
                        this.fox_life -= 3;
                        this.stabbed_audio.play();
                        // this.stabbed_plane.visible = true;
                        this.last_stabbed_time = elapsedTime;
                    }


                }
            }
            else {

                this.fox.position.y -= 0.15
            }

            // if (this.fox.position.y > 23.5) {
            //     this.stabbed_audio.play();
            //     //this.fox.position.y -= 6.3;
            //     this.fox_plane = null;
            //     if (this.fox_life > 0) {
            //         this.fox_life -= 3;
            //     }
            //     // this.stabbed_plane.visible = true;
            //     this.last_stabbed_time = elapsedTime;
            // }
            if (this.fox_plane) {
                if (this.fox_plane.position.y > 21) {
                    this.stabbed_audio.play();
                    this.fox_plane = null;
                    if (this.fox_life > 0) {
                        this.fox_life -= 3;
                    }
                    // this.stabbed_plane.visible = true;
                    this.last_stabbed_time = elapsedTime;
                }
            }
            if (this.fox.position.y < -23 && this.die_sw === 0) {
                this.die_audio.play();
                this.die_sw = 1;
                this.fox_name.remove();
                document.querySelector(`.final_score`).innerHTML += this.fox_score;
                this.die_time = elapsedTime;
            }
            if (this.fox_life <= 0 && this.die_sw === 0) {
                this.die_audio.play();
                this.die_sw = 1;
                this.fox_name.remove();
                document.querySelector(`.final_score`).innerHTML += this.fox_score;
                this.die_time = elapsedTime;
            }


            this.fox.position.y = Math.ceil(this.fox.position.y * 100) / 100;
            this.fox.position.x = Math.ceil(this.fox.position.x * 100) / 100;

            // if (this.fox_plane === null) {
            //     this.fox_plane_id = -1;
            // }
            this.calculate_life(this.fox_life);
            let data = {
                title: 'player_position_update',
                id: this.myID,
                positionx: this.fox.position.x,
                positiony: this.fox.position.y,
                animation: this.fox_animation,
                plane_id: this.fox_plane_id,
                //plane_type: this.fox_plane_type,
                //onplane_time: this.fox_onplane_time,
                // action: this.fox_action,
                score: this.fox_score,
                emoji: this.emoji,
                rank: this.fox_rank,
                timestamp: this.timestamp
            }
            this.socket.send(JSON.stringify(data));

            let test_pos = this.toXYCoords(this.fox);
            this.fox_name.style.transform = `translateX(${test_pos.x}px) translateY(${test_pos.y}px)`;
            this.fox_name.style.top = window.innerHeight / 2 + 'px';
            this.fox_name.style.left = window.innerWidth / 2 + 'px';

            if (this.fox_rank === 1) {
                this.fox_name.style.color = 'gold';
                this.fox_name.innerHTML = '<font size="6vmin">👑</font>' + document.querySelector('.Name').value;
            }
            else {
                this.fox_name.style.color = 'white';
                this.fox_name.innerHTML = document.querySelector('.Name').value;
            }


        }


        // if (this.fox) {
        //     let test_pos = this.toXYCoords(this.fox);
        //     this.text2.style.transform = `translateX(${test_pos.x}px) translateY(${test_pos.y}px)`
        //     //this.text2.style.left = test_pos.x + 'px';
        // }


        //}
        if (this.fox_plane !== null)
            this.fox_previousPlane = this.fox_plane;


        if (this.screenWidth) {
            if (this.life_bar)
                this.life_bar.position.set(this.camera.position.x - this.screenWidth / 2 * 0.75, 18, 10);
        }

        this.stabbed_plane.position.set(this.camera.position.x, 0, 10);
        this.renderer.render(this.scene, this.camera);


        this.stats.end()
    }
}

export { App };