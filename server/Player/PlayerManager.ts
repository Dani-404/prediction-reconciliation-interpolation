import Client from '../Client/Client';
import Server from '../main';
import Player from './Player';

type PlayersType = {
    [key: number]: Player
}

export default class PlayerManager {
    players: PlayersType;

    constructor() {
        this.players = {};
    }

    newPlayer(client: Client, username: string): void {
        if(this.players.hasOwnProperty(client.id))
            return;
        
        if(username == null || username.trim().length == 0)
            username = `Guest_${client.id}`;
        else
            username = username.trim().substring(0, 15);

        const player = new Player({id: client.id, username: username, client: client});
        this.players[player.id] = player;
        client.player = player;

        Server.logger.sendLog("INFO", `${player.username} just logged in.`);
        client.sendMsg("logged", {id: player.id, username: player.username});
    }
}