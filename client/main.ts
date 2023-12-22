import Logger from "../shared/Logger/Logger";
import Config from "./Config/Config";
import KeyManager from "./Key/KeyManager";
import Room from "./Room/Room";
import SettingsManager from "./Settings/SettingsManager";
import User from "./User/User";
import WebsocketManager from "./WebSockets/WebSocketsManager";

let Application: App;

class App {
    logger: Logger;
    keyManager: KeyManager;
    webSocketManager: WebsocketManager;
    settingsManager: SettingsManager;
    currentUser: User | null;
    currentRoom: Room | null;
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    game: HTMLElement | null;
    loginForm: HTMLFormElement | null;
    
    constructor() {
        this.logger = new Logger();
        this.keyManager = new KeyManager();
        this.webSocketManager = new WebsocketManager();
        this.settingsManager = new SettingsManager();
        this.currentUser = null;
        this.currentRoom = null;
        this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
        this.game = document.getElementById("game") as HTMLElement;
        this.loginForm = document.getElementById("login") as HTMLFormElement;
    }

    async init(): Promise<any> {
        this.initEvents();
        await this.webSocketManager.init();
    }

    initEvents(): void {
        window.addEventListener("resize", this.resizeCanvas.bind(this));

        if(this.loginForm != null)
            this.loginForm.addEventListener("submit", this.tryLogin.bind(this));
    }

    resizeCanvas(): void {
        if(this.canvas == null)
            return;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    tryLogin(e: any): void {
        e.preventDefault();

        if(this.currentUser != null)
            return;

        const username = document.getElementById("login_username") as HTMLInputElement;
        if(username == null)
            return;

        this.webSocketManager.sendMsg("login", username.value);
    }
}

Application = new App();
export default Application;
Application.init().catch((e) => Application.logger.sendCriticalError(e.toString()))