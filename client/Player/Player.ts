import Entity from "../../shared/Entity/Entity";
import PlayerInterface from "./PlayerInterface";

export default class Player implements PlayerInterface {
    id: number;
    username: string;
    entity: Entity | null;

    constructor(data: PlayerInterface) {
        this.id = data.id;
        this.username = data.username;
        this.entity = data.entity;
    }
}