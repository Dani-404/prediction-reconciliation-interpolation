import { Command } from "../../shared/Command/Command";
import Entity from "../../shared/Entity/Entity";
import { InputMessage } from "../../shared/InputMessage/InputMessage";
import ShareableData from "../../shared/ShareableData/ShareableData";
import Vector2 from "../../shared/Vector2/Vector2";
import Config from "../Config/Config";
import Player from "../Player/Player";
import Application from "../main";
import RoomInterface from "./RoomInterface";

export default class Room implements RoomInterface {
    id: number;
    currentPlayers: Player[];
    worldStates: any[];
    lastTs: number;
    inputSequenceNumber: number;
    pendingInputs: InputMessage[];

    constructor(data: RoomInterface) {
        this.id = data.id;
        this.currentPlayers = [];
        this.worldStates = [];
        this.lastTs = 0;
        this.inputSequenceNumber = 0;
        this.pendingInputs = [];
        window.requestAnimationFrame(this.update.bind(this));
    }

    initAllPlayers(playersList: Array<any>) {
        playersList.forEach((player) => {
            this.initPlayer(player);
        })
    }

    initPlayer(player: any): void {
        if(this.currentPlayers.filter((playerData) => playerData.id == player.id)[0] != null)
            return;

        const playerData = new Player({
            id: player.id,
            username: player.username,
            entity: new Entity({
                width: player.entity.width,
                height: player.entity.height,
                color: player.entity.color,
                position: new Vector2(player.entity.position.x, player.entity.position.y)
            })
        });

        this.currentPlayers.push(playerData);
        Application.logger.sendLog("VERBOSE", `Player ${player.username} initialized.`);
    }

    removePlayer(playerId: number):void {
        this.currentPlayers.forEach(function(player, index, object) {
            if (player.id == playerId) {
                Application.logger.sendLog("VERBOSE", `Player ${player.username} left the room.`);
                object.splice(index, 1);
            }
        });
    }

    initPlayerEntity(playerData: any) {
        const player = this.getPlayerById(playerData.id);
        if(player == null)
            return;

        player.entity = new Entity({
            width: playerData.entity.width,
            height: playerData.entity.height,
            color: playerData.entity.color,
            position: new Vector2(playerData.entity.position.x, playerData.entity.position.y)
        })

        Application.logger.sendLog("VERBOSE", `Entity of [${player.username}] initialized.`);
    }

    destroyPlayerEntity(playerId: number) {
        const player = this.getPlayerById(playerId);
        if(player == null || player.entity == null)
            return;

        player.entity = null;
        player.id == Application.currentUser?.id ? this.pendingInputs = [] : null;
        Application.logger.sendLog("VERBOSE", `Entity of [${player.username}] destroyed.`);
    }

    updateWorldState(playersData: any[]): void {
        playersData.forEach((playerData) => {
            const player = this.getPlayerById(playerData.id);
            if(player == null || player.entity == null)
                return;

            if(player.id == Application.currentUser?.id) {
                player.entity.position = new Vector2(playerData.entity.position.x, playerData.entity.position.y);

                if(Application.settingsManager.reconciliation) {
                    let j = 0;
                    while (j < this.pendingInputs.length) {
                        const input = this.pendingInputs[j];
                        if (input.inputSequenceNumber <= playerData.lastProcessedInput) {
                            this.pendingInputs.splice(j, 1);
                        } else {
                            player.entity.applyInput(input);
                            j++;
                        }
                    }
                } else {
                    this.pendingInputs = [];
                }
            }
            else {
                if(!Application.settingsManager.interpolation)
                    player.entity.position = new Vector2(playerData.entity.position.x, playerData.entity.position.y);
                else {
                    const timestamp = performance.now();
                    player.entity.positionBuffer.push(new ShareableData(
                        timestamp,
                        new Vector2(playerData.entity.position.x, playerData.entity.position.y)
                    ))
                }
            }
        })
    }

    getPlayerById(playerId: number | undefined): Player | null {
        for(let i = 0; i < this.currentPlayers.length; i++) {
            const player = this.currentPlayers[i];
            if(player.id == playerId)
                return player;
        }
        
        return null;
    }

    update(): void {
        if(Application.ctx == null)
            return Application.logger.sendLog("ERROR", `Impossible to get canvas context.`);

        Application.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        this.processInputs();

        if(Application.settingsManager.interpolation)
            this.interpolateEntities();

        this.currentPlayers.forEach((player) => {
            if(player.entity == null)
                return;

            player.entity.draw(Application.ctx as CanvasRenderingContext2D, player.username);
        });

        window.requestAnimationFrame(this.update.bind(this));
    }

    processInputs(): void {
        const activePlayer = this.getPlayerById(Application.currentUser?.id);
        if(activePlayer == null || activePlayer.entity == null)
            return;

        const nowTs = performance.now();
        const lastTs = this.lastTs || nowTs;
        const dtSec = (nowTs - lastTs) / 1000.0;
        this.lastTs = nowTs;

        const commands: Command[] = [];

        if(Application.keyManager.right)
            commands.push(Command.Right)
        else if(Application.keyManager.left)
            commands.push(Command.Left)

        if(Application.keyManager.up)
            commands.push(Command.Up)
        else if(Application.keyManager.down)
            commands.push(Command.Down)

        if(commands.length == 0)
            return;

        this.inputSequenceNumber++;

        const inputs = new InputMessage({
            commands: commands,
            playerId: activePlayer.id,
            pressedTime: dtSec,
            inputSequenceNumber: this.inputSequenceNumber
        });

        Application.webSocketManager.sendMsg("inputsData", inputs);

        if(Application.settingsManager.prediction)
            activePlayer.entity.applyInput(inputs);

        this.pendingInputs.push(inputs);
    }

    interpolateEntities(): void {
        const now = performance.now();
        const renderTimestamp = now - (1000.0 / Config.SERVER_UPDATE_INTERVAL);

        this.currentPlayers.forEach((player) => {
            const entity = player.entity;

            if(entity == null || player.id == Application.currentUser?.id)
                return;

            const buffer = entity.positionBuffer;

            while (buffer.length >= 2 && buffer[1].timestamp <= renderTimestamp) {
                buffer.shift();
            }

            if(buffer.length >= 2 && buffer[0].timestamp <= renderTimestamp && renderTimestamp <= buffer[1].timestamp) {
                entity.position.x = this.interpolate(
                    buffer[0].shareableData.x,
                    buffer[1].shareableData.x,
                    buffer[0].timestamp,
                    buffer[1].timestamp,
                    renderTimestamp);

                entity.position.y = this.interpolate(
                    buffer[0].shareableData.y,
                    buffer[1].shareableData.y,
                    buffer[0].timestamp,
                    buffer[1].timestamp,
                    renderTimestamp);
            }
        })
    }

    private interpolate(p0: number, p1: number, t0: number, t1: number, renderTimestamp: number): number {
        const deltaMovement = (p1 - p0);
        return p0 + deltaMovement * (renderTimestamp - t0) / (t1 - t0);
    }
}