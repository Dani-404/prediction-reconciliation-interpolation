import Entity from "../../shared/Entity/Entity";

export default interface PlayerInterface {
    id: number,
    username: string,
    entity: null | Entity
}