import Application from "../main";

export default class SettingsManager {
    prediction: boolean;
    reconciliation: boolean;
    interpolation: boolean;
    cheat: boolean;

    constructor() {
        this.prediction = false;
        this.reconciliation = false;
        this.interpolation = false;
        this.cheat = false;

        this.initEvents();
    }

    initEvents(): void {
        document.getElementById("prediction")?.addEventListener("click", this.setPrediction.bind(this));
        document.getElementById("reconciliation")?.addEventListener("click", this.setReconciliation.bind(this));
        document.getElementById("interpolation")?.addEventListener("click", this.setInterpolation.bind(this));
        document.getElementById("cheat")?.addEventListener("click", this.setCheat.bind(this));
        document.getElementById("init_entity")?.addEventListener("click", this.initEntity.bind(this));
        document.getElementById("destroy_entity")?.addEventListener("click", this.destroyEntity.bind(this));

        const roomForm = document.getElementById("room_form") as HTMLFormElement;
        if(roomForm != null)
            roomForm.addEventListener("submit", this.goToRoom.bind(this));
    }

    setPrediction(e: any): void {
        this.prediction = e.target.checked;
    }

    setReconciliation(e: any): void {
        this.reconciliation = e.target.checked;
    }

    setInterpolation(e: any): void {
        this.interpolation = e.target.checked;
    }
    
    setCheat(e: any): void {
        this.cheat = e.target.checked;
    }

    initEntity(): void {
        Application.webSocketManager.sendMsg("initEntity");
    }

    destroyEntity(): void {
        Application.webSocketManager.sendMsg("destroyEntity");
    }

    goToRoom(e: any): void {
        e.preventDefault();

        const roomId = document.getElementById("room_id") as HTMLInputElement;
        if(roomId == null)
            return;

        Application.webSocketManager.sendMsg("joinRoom", roomId.value)
    }
}