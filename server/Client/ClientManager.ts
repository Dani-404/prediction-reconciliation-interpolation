import Server from "../main";
import Client from "./Client";

type ClientsType = {
    [key: number]: Client
}

export default class ClientManager {
    clientId: number;
    clients: ClientsType;

    constructor() {
        this.clientId = 0;
        this.clients = {};
    }

    newClient(socket: any): void {
        this.clientId++;
        const client = new Client({id: this.clientId, socket: socket});
        this.clients[client.id] = client;
        client.initEvents();

        Server.logger.sendLog("VERBOSE", `New client connection [${client.id}].`);
    }

    destroyClient(socketId: number): void {
        if(!this.clients.hasOwnProperty(socketId))
            return;

        const client = this.clients[socketId];
        client.destroy();
        Server.logger.sendLog("VERBOSE", `Client disconnect [${socketId}].`);
    }
}