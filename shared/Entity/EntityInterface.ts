import ShareableData from "../ShareableData/ShareableData"
import Vector2 from "../Vector2/Vector2"

export default interface EntityInterface {
    width: number,
    height: number,
    color: string,
    position: Vector2,
    positionBuffer?: ShareableData[]
}