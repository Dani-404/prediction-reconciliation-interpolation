import Logger from "../shared/Logger/Logger";
import ClientManager from "./Client/ClientManager";
import Config from "./Config/Config";
import RoomManager from "./Room/RoomManager";
import WebSocketManager from "./WebSockets/WebSocketsManager";
import PlayerManager from "./Player/PlayerManager";
import express from 'express';
import path from 'path';

let Server: App;

class App {
    logger: Logger;
    webSocketManager: WebSocketManager;
    roomManager: RoomManager;
    clientManager: ClientManager;
    playerManager: PlayerManager;

    constructor() {
        this.logger = new Logger();
        this.webSocketManager = new WebSocketManager();
        this.roomManager = new RoomManager();
        this.clientManager = new ClientManager();
        this.playerManager = new PlayerManager();
    }

    async init(): Promise<any> {
        await this.webSocketManager.init();

        const app = express();
        app.use('/', express.static(path.join(__dirname, '..', 'public')));
        app.listen(Config.HTTP_PORT);
    }
}

Server = new App();
export default Server;
Server.init()
    .then(() => Server.logger.sendLog("SUCCESS", `Server started on port ${Config.PORT}, HTTP server: http://127.0.0.1:${Config.HTTP_PORT}.`))
    .catch((e) => Server.logger.sendCriticalError(e.toString()))