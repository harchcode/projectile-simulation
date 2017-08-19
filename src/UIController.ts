import Simulator from "./Simulator";

export default class UIController {
    private simulator: Simulator;
    private massTextBox: HTMLInputElement;
    private radTextBox: HTMLInputElement;
    private densityTextBox: HTMLInputElement;
    private dragTextBox: HTMLInputElement;
    private vXTextBox: HTMLInputElement;
    private vYTextBox: HTMLInputElement;
    private vZTextBox: HTMLInputElement;
    private wXTextBox: HTMLInputElement;
    private wYTextBox: HTMLInputElement;
    private wZTextBox: HTMLInputElement;
    private aXTextBox: HTMLInputElement;
    private aYTextBox: HTMLInputElement;
    private aZTextBox: HTMLInputElement;
    private fixedRadio: HTMLInputElement;
    private bulletRadio: HTMLInputElement;
    private freeRadio: HTMLInputElement;
    private fireButton: HTMLButtonElement;
    private randomButton: HTMLButtonElement;
    
    constructor(simulator: Simulator) {
        this.simulator = simulator;
        this.massTextBox = document.getElementById("mass") as HTMLInputElement;
        this.radTextBox = document.getElementById("radius") as HTMLInputElement;
        this.densityTextBox = document.getElementById("density") as HTMLInputElement;
        this.dragTextBox = document.getElementById("drag") as HTMLInputElement;
        this.vXTextBox = document.getElementById("vx") as HTMLInputElement;
        this.vYTextBox = document.getElementById("vy") as HTMLInputElement;
        this.vZTextBox = document.getElementById("vz") as HTMLInputElement;
        this.wXTextBox = document.getElementById("wx") as HTMLInputElement;
        this.wYTextBox = document.getElementById("wy") as HTMLInputElement;
        this.wZTextBox = document.getElementById("wz") as HTMLInputElement;
        this.aXTextBox = document.getElementById("ax") as HTMLInputElement;
        this.aYTextBox = document.getElementById("ay") as HTMLInputElement;
        this.aZTextBox = document.getElementById("az") as HTMLInputElement;
        this.fixedRadio = document.getElementById("fixed") as HTMLInputElement;
        this.bulletRadio = document.getElementById("bullet") as HTMLInputElement;
        this.freeRadio = document.getElementById("free") as HTMLInputElement;
        this.fireButton = document.getElementById("fire") as HTMLButtonElement;
        this.randomButton = document.getElementById("random") as HTMLButtonElement;
    }

    init() {
        this.simulator.setCameraMode("free");
        this.simulator.setSphereSize(0.1143);

        this.radTextBox.addEventListener("change", () => {
            let radius = parseFloat(this.radTextBox.value);

            this.simulator.setSphereSize(radius);
        });

        this.fireButton.addEventListener("click", () => {
            let mass = parseFloat(this.massTextBox.value);
            let radius = parseFloat(this.radTextBox.value);
            let density = parseFloat(this.densityTextBox.value);     
            let drag = parseFloat(this.dragTextBox.value);        
            let v0x = parseFloat(this.vXTextBox.value);
            let v0y = parseFloat(this.vYTextBox.value);
            let v0z = parseFloat(this.vZTextBox.value);
            let vwx = parseFloat(this.wXTextBox.value);
            let vwy = parseFloat(this.wYTextBox.value);
            let vwz = parseFloat(this.wZTextBox.value);
            let vax = parseFloat(this.aXTextBox.value);
            let vay = parseFloat(this.aYTextBox.value);
            let vaz = parseFloat(this.aZTextBox.value);

            this.simulator.fire(mass, radius, density, drag,
                v0x, v0y, v0z,
                vwx, vwy, vwz,
                vax, vay, vaz);
        });

        this.fixedRadio.addEventListener("click", () => {
            this.simulator.setCameraMode("fixed");
        });

        this.bulletRadio.addEventListener("click", () => {
            this.simulator.setCameraMode("bullet");
        });

        this.freeRadio.addEventListener("click", () => {
            this.simulator.setCameraMode("free");
        });

        this.randomButton.addEventListener("click", () => {
            let sphere = [
                { mass: 0.625, radius: 0.1143 }, // basketball
                { mass: 0.28, radius: 0.103505 }, // volleyball
                { mass: 0.43, radius: 0.11 }, // football
            ]

            let ball = sphere[this.randInt(sphere.length)];

            this.massTextBox.value = ball.mass.toString();
            this.radTextBox.value = ball.radius.toString();
            this.vXTextBox.value = this.rand2Dec(-10, 10).toString();
            this.vYTextBox.value = this.rand2Dec(5, 12).toString();
            this.vZTextBox.value = this.rand2Dec(0, 15).toString();
            this.wXTextBox.value = this.rand2Dec(-10, 10).toString();
            this.wYTextBox.value = this.rand2Dec(-5, 5).toString();
            this.wZTextBox.value = this.rand2Dec(-10, 10).toString();
            this.aXTextBox.value = this.rand2Dec(-20, 20).toString();
            this.aYTextBox.value = this.rand2Dec(-100, 100).toString();
            this.aZTextBox.value = this.rand2Dec(-20, 20).toString();

            this.simulator.setSphereSize(ball.radius);
        });
        
        window.addEventListener("resize", () => {
            this.simulator.resize();
        });
    }
    
    rand2Dec(min: number, max: number) {
        return Math.floor((min + (Math.random() * (max - min))) * 100) / 100;
    }

    randInt(limit: number) {
        return Math.floor(Math.random() * limit);
    }
}