import * as B from "babylonjs";
import RK4 from "./RK4";

export default class Simulator {
    private canvas: HTMLCanvasElement;
    private engine: B.Engine;
    private scene: B.Scene;
    private camera: B.FreeCamera;
    private light: B.Light;
    private bullet: B.Mesh;
    private cameraMode: string;

    private isFiring: boolean;
    private mass: number;
    private radius: number;
    private drag: number;
    private area: number;
    private volume: number;
    private density: number;
    private v: B.Vector3;
    private v0: B.Vector3;
    private vw: B.Vector3;
    private va: B.Vector3;
    private vaDir: B.Vector3;
    private omega: number;
    private t: number;

    private G = -9.81;

    constructor(canvasElement: HTMLCanvasElement) {
        this.canvas = canvasElement;
        this.engine = new B.Engine(this.canvas, true);
        this.isFiring = false;
    }

    init() {
        this.scene = new B.Scene(this.engine);
        this.scene.clearColor = B.Color4.FromInts(100, 149, 237, 255);

        this.camera = new B.FreeCamera('camera', new B.Vector3(-2, 4, -10), this.scene);
        this.camera.setTarget(B.Vector3.Zero());
        // this.setCameraControl(true);

        this.light = new B.HemisphericLight('light', new B.Vector3(0, 1, 0), this.scene);

        this.bullet = B.MeshBuilder.CreateSphere('bullet',
                        { diameter: 1 }, this.scene);
        this.bullet.position.y += this.bullet.getBoundingInfo().boundingSphere.radius;

        let ground = B.MeshBuilder.CreateBox('ground', { 
            width: 100, height: 1, depth: 100,
            faceColors: [
                new B.Color4(0.57, 0.44, 0.18, 1),
                new B.Color4(0.57, 0.44, 0.18, 1),
                new B.Color4(0.57, 0.44, 0.18, 1),
                new B.Color4(0.57, 0.44, 0.18, 1),
                new B.Color4(0.57, 0.44, 0.18, 1),
                new B.Color4(0.57, 0.44, 0.18, 1)
            ]
        }, this.scene);
        ground.position.y = -1;                

        this.engine.stopRenderLoop();
        this.engine.runRenderLoop(() => {
            this.update(this.engine.getDeltaTime() * 0.001);
            this.scene.render();
        });
    }

    update(dt: number) {
        if (this.isFiring) {
            this.t += dt;

            let startPos = new B.Vector3(0, this.radius, 0);
            
            let tmp = RK4.solveForMotion(startPos, this.v0, this.t,
                (s: B.Vector3, v: B.Vector3, dt: number) => {
                    let vMag = v.length() + 1.0e-8;
                    let vTot = v.subtract(this.vw);
                    let vTotMag = vTot.length() + 1.0e-8;
                    
                    let fdmag = -0.5 * this.density * vTotMag * vTotMag * this.area * this.drag;
                    let fd = new B.Vector3(
                        fdmag * vTot.x / vTotMag,
                        fdmag * vTot.y / vTotMag,
                        fdmag * vTot.z / vTotMag,
                    );

                    let cl = this.radius * this.omega /vMag;
                    let fmMag = 0.5 * this.density * this.area * cl * vMag * vMag;
                    let fm = new B.Vector3(
                        (v.y * this.vaDir.z - this.vaDir.y * v.z) * fmMag / vMag,
                        (v.x * this.vaDir.z - this.vaDir.x * v.z) * fmMag / vMag,
                        (v.x * this.vaDir.y - this.vaDir.x * v.y) * fmMag / vMag 
                    );

                    return new B.Vector3(
                        (fd.x + fm.x) / this.mass, 
                        (fd.y + fm.y) / this.mass + this.G, 
                        (fd.z + fm.z) / this.mass
                    );
                });            

            this.bullet.position.set(tmp[0].x, tmp[0].y, tmp[0].z)
            this.v.set(tmp[1].x, tmp[1].y, tmp[1].z);
            this.bullet.rotate(this.vaDir, this.omega * dt);

            if (this.bullet.position.y < this.radius) {
                this.isFiring = false;
                this.bullet.position.y = this.radius;

                setTimeout(() => {
                    if (!this.isFiring) {
                        this.bullet.position = B.Vector3.Zero();
                        this.bullet.position.y += this.radius;
                    }
                }, 1000);
            }
        }

        if (this.cameraMode == "bullet") {
            //this.camera.position.set(this.bullet.position.x, this.bullet.position.y + 1, this.bullet.position.z - 4);
            this.camera.setTarget(this.bullet.position);
        }
    }

    fire(mass: number, radius: number, density: number, drag: number,
            v0x: number, v0y: number, v0z: number,
            vwx: number, vwy: number, vwz: number,
            vax: number, vay: number, vaz: number) {

        this.mass = mass;
        this.radius = radius;
        this.drag = drag;
        this.density = density;
        this.area = Math.PI * this.radius * this.radius;
        
        this.bullet.position = B.Vector3.Zero();
        this.bullet.position.y += this.radius;

        this.v0 = new B.Vector3(v0x, v0y, v0z);
        this.v = new B.Vector3(v0x, v0y, v0z);
        this.vw = new B.Vector3(vwx, vwy, vwz);
        this.va = new B.Vector3(vax, vay, vaz);
        this.omega = this.va.length();
        this.vaDir = this.va.normalize();
        this.t = 0.0;

        this.isFiring = true;
    }

    resize() {
        this.engine.resize();
    }

    setCameraMode(mode: string) {
        this.cameraMode = mode;

        if (mode == "free") {
            this.camera.attachControl(this.canvas, false);
        } else {
            this.camera.detachControl(this.canvas);

            if (this.cameraMode == "fixed") {
                this.camera.position.set(-2, 4, -10);
                this.camera.setTarget(B.Vector3.Zero());
            } else if (this.cameraMode == "bullet") {
                this.camera.position.set(-2, 4, -10);
                // this.camera.position.set(
                //     this.bullet.position.x,
                //     this.bullet.position.y + 1,
                //     this.bullet.position.z - 4,
                // )
                this.camera.setTarget(this.bullet.position);
            }
        }
    }

    setSphereSize(radius: number) {
        this.radius = radius;
        this.bullet.scaling.set(2 * radius, 2 * radius, 2 * radius);
        
        if (!this.isFiring) {
            this.bullet.position.y = radius;
        }
    }
}