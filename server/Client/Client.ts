import { WebSocket, WebSocketServer } from "ws";
import ClientInterface from "./ClientInterface";
import Player from "../Player/Player";
import Server from "../main";

export default class Client implements ClientInterface {
    id: number;
    socket: WebSocket;
    player: null | Player;

    constructor(data: ClientInterface) {
        this.id = data.id;
        this.socket = data.socket;
        this.player = null;
    }

    initEvents(): void {
        const instance = this;

        this.socket.on('message', function message(data: any) {
            if(data == null)
                return;

            const message = JSON.parse(data.toString());

            switch(message.key) {
                case "login": {
                    instance.login(message.value.toString());
                    break;
                }

                case "joinRoom": {
                    if(instance.player == null)
                        return;

                    Server.roomManager.initRoom(message.value, instance.player);
                    break;
                }

                case "inputsData": {
                    if(instance.player == null || instance.player.currentRoom == null)
                        return;

                    instance.player.currentRoom.newInput(message.value);
                    break;
                }

                case "initEntity": {
                    if(instance.player == null || instance.player.currentRoom == null)
                        return;

                    instance.player.currentRoom.initEntity(instance.player);
                    break;
                }

                case "destroyEntity": {
                    if(instance.player == null || instance.player.currentRoom == null)
                        return;

                    instance.player.currentRoom.destroyEntity(instance.player);
                    break;
                }
            }
        });

        this.socket.on('close', function close() {
            Server.clientManager.destroyClient(instance.id);
        });
    }

    login(username: string): void {
        if(this.player != null)
            return;

        Server.playerManager.newPlayer(this, username);
    }

    sendMsg(key: string, value: any): void {
        const message = JSON.stringify({key: key, value: value});
        this.socket.send(message);
    }

    destroy(): void {
        if(this.player != null)
            this.player.destroy();
    }
}