import Player from "../Player/Player";

export default interface RoomInterface {
    id: number,
    currentPlayers?: Array<Player>
}