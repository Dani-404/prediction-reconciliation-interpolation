import KeyInterface from "./KeyInterface";

export default class KeyManager implements KeyInterface {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;

    constructor() {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;

        this.initEvents();
    }

    initEvents() {
        window.addEventListener("keyup", this.keyUp.bind(this));
        window.addEventListener("keydown", this.keyDown.bind(this));
    }

    keyUp(e: any): void {
        switch(e.code) {
            case "ArrowUp":
                this.up = false;
                break;

            case "ArrowDown":
                this.down = false;
                break;

            case "ArrowLeft":
                this.left = false;
                break;

            case "ArrowRight":
                this.right = false;
                break;
        }
    }

    keyDown(e: any): void {
        switch(e.code) {
            case "ArrowUp":
                this.up = true;
                break;

            case "ArrowDown":
                this.down = true;
                break;

            case "ArrowLeft":
                this.left = true;
                break;

            case "ArrowRight":
                this.right = true;
                break;
        }
    }

    getInputs(): KeyInterface {
        return {up: this.up, down: this.down, left: this.left, right: this.right}
    }
}