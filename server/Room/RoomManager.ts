import Config from "../Config/Config";
import Player from "../Player/Player";
import Server from "../main";
import Room from "./Room";

type RoomsType = {
    [key: number]: Room
}

export default class RoomManager {
    rooms: RoomsType;

    constructor() {
        this.rooms = {};
        setInterval(this.update.bind(this), 1000/Config.UPDATE_INTERVAL);
    }

    initRoom(roomId: number, byPlayer: Player) {
        let room = this.rooms[roomId];

        if(room != null && room == byPlayer.currentRoom)
            return;
        
        if(room != null)
            return room.addPlayer(byPlayer);

        Server.logger.sendLog("INFO", `Loading room ${roomId}.`);
        room = new Room({id: roomId});
        this.rooms[room.id] = room;
        room.addPlayer(byPlayer);
    }

    getRoom(roomId: number): Room | null {
        const room = this.rooms[roomId];

        if(room == null)
            return null;
        else 
            return room;
    }

    destroyRoom(roomId: number): void {
        if(!this.rooms.hasOwnProperty(roomId))
            return;

        const room = this.rooms[roomId];
        Server.logger.sendLog("INFO", `Unloading room ${roomId}.`);
        delete this.rooms[roomId];
    }

    update(): void {
        for(let i in this.rooms) {
            const room = this.rooms[i];
            room.update();
        }
    }
}