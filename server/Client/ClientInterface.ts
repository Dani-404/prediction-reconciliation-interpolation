import { WebSocket } from "ws";
import Player from "../Player/Player";

export default interface ClientInterface {
    id: number,
    socket: WebSocket,
    player?: null | Player;
}