import { Command } from "../Command/Command";
import { InputMessage } from "../InputMessage/InputMessage";
import KeyInterface from "../../client/Key/KeyInterface";
import Vector2 from "../Vector2/Vector2";
import EntityInterface from "./EntityInterface";
import ShareableData from "../ShareableData/ShareableData";

export default class Entity implements EntityInterface {
    width: number;
    height: number;
    color: string;
    position: Vector2;
    positionBuffer: ShareableData[];

    constructor(data: EntityInterface) {
        this.width = data.width;
        this.height = data.height;
        this.color = data.color;
        this.position = data.position;
        this.positionBuffer = [];
    }

    draw(ctx: CanvasRenderingContext2D, username: string): void {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        ctx.font = "12px serif";
        ctx.fillStyle = "white";
        ctx.fillText(username, this.position.x, this.position.y - 10);
    }

    applyInput(input: InputMessage) {
        const speed = 100;

        if(input.commands.includes(Command.Right))
            this.position.x += input.pressedTime * speed;

        if(input.commands.includes(Command.Left))
            this.position.x += input.pressedTime * -speed;

        if(input.commands.includes(Command.Up))
            this.position.y += input.pressedTime * -speed;

        if(input.commands.includes(Command.Down))
            this.position.y += input.pressedTime * speed;
    }
}