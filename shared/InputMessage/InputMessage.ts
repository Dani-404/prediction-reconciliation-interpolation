import { Command } from "../Command/Command"
import InputMessageInterface from "./InputMessageInterface"

export class InputMessage implements InputMessageInterface {
    commands: Command[];
    playerId: number | null;
    pressedTime: number;
    inputSequenceNumber: number;

    constructor(data: InputMessageInterface) {
        this.commands = data.commands;
        this.playerId = data.playerId;
        this.pressedTime = data.pressedTime;
        this.inputSequenceNumber = data.inputSequenceNumber;
    }
}