import Entity from "../../shared/Entity/Entity";
import Client from "../Client/Client";
import Room from "../Room/Room";

export default interface PlayerInterface {
    id: number,
    username: string,
    client: null | Client,
    currentRoom?: null | Room,
    entity?: null | Entity 
}