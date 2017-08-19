import "./scss/main.scss";
import Simulator from "./Simulator";
import UIController from "./UIController";

window.addEventListener("DOMContentLoaded", function () {
	let canvas = document.getElementById("simulator") as HTMLCanvasElement;

	let simulator = new Simulator(canvas);
	simulator.init();

	let ui = new UIController(simulator);
	ui.init();
});
