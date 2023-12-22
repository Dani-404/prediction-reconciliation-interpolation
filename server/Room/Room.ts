import Entity from "../../shared/Entity/Entity";
import { InputMessage } from "../../shared/InputMessage/InputMessage";
import Vector2 from "../../shared/Vector2/Vector2";
import Config from "../Config/Config";
import Player from "../Player/Player";
import Server from "../main";
import RoomInterface from "./RoomInterface";

type pendingInputs = {
    [key: string]: InputMessage
}

export default class Room implements RoomInterface {
    id: number;
    currentPlayers: Player[];
    pendingInputs: pendingInputs;
    lastProcessedInput: number[];

    constructor(data: RoomInterface) {
        this.id = data.id;
        this.currentPlayers = [];
        this.pendingInputs = {};
        this.lastProcessedInput = [];
    }

    broadcast(key: string, value: any): void {
        this.currentPlayers.forEach((player) => {
            player.sendMsg(key, value);
        });
    }

    addPlayer(player: Player): void {
        if(player.currentRoom != null)
            player.currentRoom.removePlayer(player);

        Server.logger.sendLog("INFO", `${player.username} joined the room [${this.id}].`);
        this.currentPlayers.push(player);
        player.currentRoom = this;

        // Init entity
        const colors: Array<string> = ["red", "blue", "green"];
        player.entity = new Entity({
            width: Math.floor(Math.random() * (150 - 20 + 1) + 20),
            height: Math.floor(Math.random() * (150 - 20 + 1) + 20),
            color: colors[Math.floor(Math.random()*colors.length)],
            position: new Vector2(Math.floor(Math.random() * (150 - 20 + 1) + 20), Math.floor(Math.random() * (150 - 20 + 1) + 20))
        })

        const playersList: Array<any> = [];
        this.currentPlayers.forEach((playerData) => {
            playersList.push({
                id: playerData.id, 
                username: playerData.username, 
                entity: playerData.entity ? {width: playerData.entity.width, height: playerData.entity.height, color: playerData.entity.color, position: playerData.entity.position} : null
            })
        })
        
        player.sendMsg("initRoom", {
            id: this.id,
            currentPlayers: playersList
        });

        this.broadcast("playerJoin", {
            id: player.id,
            username: player.username,
            entity: player.entity ? {width: player.entity.width, height: player.entity.height, color: player.entity.color, position: player.entity.position} : null
        });
    }

    removePlayer(player: Player): void {
        player.currentRoom = null;

        this.currentPlayers.forEach((playerData, index, object) => {
            if(playerData.id == player.id)
                object.splice(index, 1);
        });

        Server.logger.sendLog("INFO", `${player.username} left the room [${this.id}].`);
        this.broadcast("playerLeft", player.id);

        if(this.currentPlayers.length == 0)
            Server.roomManager.destroyRoom(this.id);
    }

    initEntity(player: Player): void {
        if(player.entity)
            return;

        const colors: Array<string> = ["red", "blue", "green"];
        player.entity = new Entity({
            width: Math.floor(Math.random() * (150 - 20 + 1) + 20),
            height: Math.floor(Math.random() * (150 - 20 + 1) + 20),
            color: colors[Math.floor(Math.random()*colors.length)],
            position: new Vector2(Math.floor(Math.random() * (150 - 20 + 1) + 20), Math.floor(Math.random() * (150 - 20 + 1) + 20))
        });

        this.broadcast("initEntity", {
            id: player.id,
            entity: player.entity ? {width: player.entity.width, height: player.entity.height, color: player.entity.color, position: player.entity.position} : null
        });

        Server.logger.sendLog("VERBOSE", `Entity of player ${player.username} initialized.`);
    }

    destroyEntity(player: Player): void {
        if(player.entity == null)
            return;

        player.entity = null;
        delete this.lastProcessedInput[player.id];
        this.broadcast("destroyEntity", player.id);
        Server.logger.sendLog("VERBOSE", `Entity of player ${player.username} destroyed.`);
    }

    newInput(inputsData: any): void {
        if(inputsData instanceof InputMessage)
            return;

        const player = this.getPlayerById(inputsData.playerId);
        if(player == null || player.entity == null)
            return;

        this.pendingInputs[`${player.id}-${inputsData.inputSequenceNumber}`] = inputsData;
    }

    update(): void {
        this.processInputs();
        this.sendWorldState();
    }

    getPlayerById(playerId: number | null): Player | null {
        for(let i = 0; i < this.currentPlayers.length; i++) {
            const player = this.currentPlayers[i];
            if(player.id == playerId)
                return player;
        }
        
        return null;
    }

    processInputs(): void {
        for (let i in this.pendingInputs) {
            const input = this.pendingInputs[i];

            const player = this.getPlayerById(input.playerId);
            if(player == null || player.entity == null)
            {
                delete this.pendingInputs[i];
                continue;
            }

            if(!this.validateInput(input)) {
                delete this.pendingInputs[i];
                continue;
            }

            this.lastProcessedInput[player.id] = input.inputSequenceNumber;
            player.entity.applyInput(input);
            delete this.pendingInputs[i];
        }
    }

    validateInput(input: InputMessage) {
        if(Math.abs(input.pressedTime * 1000) > Config.MAX_PRESS_TIME) {
            Server.logger.sendLog("WARNING", `The maximum accepted pressed key time was ${Config.MAX_PRESS_TIME * 1000}ms, and therefore was discarded by the server. Try to increase the maximum accepted press time in configuration.`);
            return false;
        }
        return true;
    }

    sendWorldState(): void {
        const playersList: Array<any> = [];
        this.currentPlayers.forEach((playerData) => {
            playersList.push({
                id: playerData.id, 
                username: playerData.username, 
                entity: playerData.entity ? {width: playerData.entity.width, height: playerData.entity.height, color: playerData.entity.color, position: playerData.entity.position} : null,
                lastProcessedInput: this.lastProcessedInput[playerData.id]
            })
        })

        this.broadcast("worldState", playersList);
    }
}