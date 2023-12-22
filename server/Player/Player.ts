import Entity from "../../shared/Entity/Entity";
import Client from "../Client/Client";
import Room from "../Room/Room";
import Server from "../main";
import PlayerInterface from "./PlayerInterface";

export default class Player implements PlayerInterface {
    id: number;
    client: null | Client;
    username: string;
    currentRoom: Room | null;
    entity: Entity | null;

    constructor(data: PlayerInterface) {
        this.id = data.id;
        this.username = data.username;
        this.client = data.client;
        this.currentRoom = null;
        this.entity = null;
    }

    sendMsg(key: string, value: any):void {
        this.client?.sendMsg(key, value);
    }

    destroy(): void {
        if(this.currentRoom != null)
            this.currentRoom.removePlayer(this);

        this.client = null;
        Server.logger.sendLog("INFO", `${this.username} just logged out.`);
    }
}