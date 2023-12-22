import Config from "../Config/Config";
import Room from "../Room/Room";
import User from "../User/User";
import Application from "../main";

export default class WebsocketManager {
    ws: null | WebSocket;

    constructor() {
        this.ws = null;
    }

    init(): Promise<string> {
        return new Promise((resolve, reject) => {
            const instance = this;
            
            this.ws = new WebSocket(`ws://${Config.SERVER_HOST}:${Config.SERVER_PORT}`);
    
            this.ws.onclose = () => {
                Application.currentUser = null;
                Application.game ? Application.game.style.display = "none" : null
                Application.loginForm ? Application.loginForm.style.display = "block" : null
                Application.logger.sendLog("ERROR", "Connection to server losted.");
            }
    
            this.ws.onopen = () => {
                Application.logger.sendLog("SUCCESS", "Connected to server.");
                Application.loginForm ? Application.loginForm.style.display = "block" : null
            }

            this.ws.onmessage = (msg: any) => {
                if(msg == null || msg.data == null)
                    return;

                const message = JSON.parse(msg.data.toString());
                switch(message.key) {
                    case "logged": {
                        Application.currentUser = new User(message.value.id, message.value.username);
                        Application.loginForm ? Application.loginForm.style.display = "none" : null
                        Application.resizeCanvas();
                        Application.game ? Application.game.style.display = "block" : null
                        Application.logger.sendLog("INFO", `Logged as [${Application.currentUser.id}] ${Application.currentUser.username}.`);

                        // Join room ID 5ab81
                        instance.sendMsg("joinRoom", "5ab81")
                        break;
                    }

                    case "initRoom": {
                        Application.currentRoom = new Room(message.value);
                        Application.logger.sendLog("INFO", `Initializing room [${Application.currentRoom.id}].`);
                        const roomId = document.getElementById("room_id") as HTMLInputElement;
                        if(roomId != null)
                            roomId.value = Application.currentRoom.id.toString();
                        Application.currentRoom.initAllPlayers(message.value.currentPlayers);
                        break;
                    }

                    case "playerJoin": {
                        if(Application.currentRoom == null)
                            return;

                        Application.currentRoom.initPlayer(message.value);
                        break;
                    }

                    case "playerLeft": {
                        if(Application.currentRoom == null)
                            return;

                        Application.currentRoom.removePlayer(message.value);
                        break;
                    }

                    case "worldState": {
                        if(Application.currentRoom == null)
                            return;

                        Application.currentRoom.updateWorldState(message.value);
                        break;
                    }

                    case "initEntity": {
                        if(Application.currentRoom == null)
                            return;

                        Application.currentRoom.initPlayerEntity(message.value);
                        break;
                    }

                    case "destroyEntity": {
                        if(Application.currentRoom == null)
                            return;

                        Application.currentRoom.destroyPlayerEntity(message.value);
                        break;
                    }
                }
            }
        });
    }

    sendMsg(key: string, value: any = null): void {
        if(this.ws == null || this.ws.readyState !== WebSocket.OPEN)
            return Application.logger.sendLog("ERROR", "Impossible to send message to server, websockets are disconnect.");

        const message = JSON.stringify({key: key, value: value});
        this.ws.send(message);
    }
}