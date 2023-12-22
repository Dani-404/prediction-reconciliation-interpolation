import { Command } from "../Command/Command";

export default interface InputMessageInterface {
    commands: Command[],
    playerId: number | null,
    pressedTime: number,
    inputSequenceNumber: number
}