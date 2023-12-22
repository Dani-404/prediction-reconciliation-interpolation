/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./client/Config/Config.ts":
/*!*********************************!*\
  !*** ./client/Config/Config.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = {
    SERVER_HOST: "127.0.0.1",
    SERVER_PORT: 8090,
    SERVER_UPDATE_INTERVAL: 10
};


/***/ }),

/***/ "./client/Key/KeyManager.ts":
/*!**********************************!*\
  !*** ./client/Key/KeyManager.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class KeyManager {
    constructor() {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.initEvents();
    }
    initEvents() {
        window.addEventListener("keyup", this.keyUp.bind(this));
        window.addEventListener("keydown", this.keyDown.bind(this));
    }
    keyUp(e) {
        switch (e.code) {
            case "ArrowUp":
                this.up = false;
                break;
            case "ArrowDown":
                this.down = false;
                break;
            case "ArrowLeft":
                this.left = false;
                break;
            case "ArrowRight":
                this.right = false;
                break;
        }
    }
    keyDown(e) {
        switch (e.code) {
            case "ArrowUp":
                this.up = true;
                break;
            case "ArrowDown":
                this.down = true;
                break;
            case "ArrowLeft":
                this.left = true;
                break;
            case "ArrowRight":
                this.right = true;
                break;
        }
    }
    getInputs() {
        return { up: this.up, down: this.down, left: this.left, right: this.right };
    }
}
exports["default"] = KeyManager;


/***/ }),

/***/ "./client/Player/Player.ts":
/*!*********************************!*\
  !*** ./client/Player/Player.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Player {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.entity = data.entity;
    }
}
exports["default"] = Player;


/***/ }),

/***/ "./client/Room/Room.ts":
/*!*****************************!*\
  !*** ./client/Room/Room.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Command_1 = __webpack_require__(/*! ../../shared/Command/Command */ "./shared/Command/Command.ts");
const Entity_1 = __importDefault(__webpack_require__(/*! ../../shared/Entity/Entity */ "./shared/Entity/Entity.ts"));
const InputMessage_1 = __webpack_require__(/*! ../../shared/InputMessage/InputMessage */ "./shared/InputMessage/InputMessage.ts");
const ShareableData_1 = __importDefault(__webpack_require__(/*! ../../shared/ShareableData/ShareableData */ "./shared/ShareableData/ShareableData.ts"));
const Vector2_1 = __importDefault(__webpack_require__(/*! ../../shared/Vector2/Vector2 */ "./shared/Vector2/Vector2.ts"));
const Config_1 = __importDefault(__webpack_require__(/*! ../Config/Config */ "./client/Config/Config.ts"));
const Player_1 = __importDefault(__webpack_require__(/*! ../Player/Player */ "./client/Player/Player.ts"));
const main_1 = __importDefault(__webpack_require__(/*! ../main */ "./client/main.ts"));
class Room {
    constructor(data) {
        this.id = data.id;
        this.currentPlayers = [];
        this.worldStates = [];
        this.lastTs = 0;
        this.inputSequenceNumber = 0;
        this.pendingInputs = [];
    }
    initAllPlayers(playersList) {
        playersList.forEach((player) => {
            this.initPlayer(player);
        });
    }
    initPlayer(player) {
        if (this.currentPlayers.filter((playerData) => playerData.id == player.id)[0] != null)
            return;
        const playerData = new Player_1.default({
            id: player.id,
            username: player.username,
            entity: new Entity_1.default({
                width: player.entity.width,
                height: player.entity.height,
                color: player.entity.color,
                position: new Vector2_1.default(player.entity.position.x, player.entity.position.y)
            })
        });
        this.currentPlayers.push(playerData);
        main_1.default.logger.sendLog("VERBOSE", `Player ${player.username} initialized.`);
    }
    removePlayer(playerId) {
        this.currentPlayers.forEach(function (player, index, object) {
            if (player.id == playerId) {
                main_1.default.logger.sendLog("VERBOSE", `Player ${player.username} left the room.`);
                object.splice(index, 1);
            }
        });
    }
    initPlayerEntity(playerData) {
        const player = this.getPlayerById(playerData.id);
        if (player == null)
            return;
        player.entity = new Entity_1.default({
            width: playerData.entity.width,
            height: playerData.entity.height,
            color: playerData.entity.color,
            position: new Vector2_1.default(playerData.entity.position.x, playerData.entity.position.y)
        });
        main_1.default.logger.sendLog("VERBOSE", `Entity of [${player.username}] initialized.`);
    }
    destroyPlayerEntity(playerId) {
        var _a;
        const player = this.getPlayerById(playerId);
        if (player == null || player.entity == null)
            return;
        player.entity = null;
        player.id == ((_a = main_1.default.currentUser) === null || _a === void 0 ? void 0 : _a.id) ? this.pendingInputs = [] : null;
        main_1.default.logger.sendLog("VERBOSE", `Entity of [${player.username}] destroyed.`);
    }
    updateWorldState(playersData) {
        playersData.forEach((playerData) => {
            var _a;
            const player = this.getPlayerById(playerData.id);
            if (player == null || player.entity == null)
                return;
            if (player.id == ((_a = main_1.default.currentUser) === null || _a === void 0 ? void 0 : _a.id)) {
                player.entity.position = new Vector2_1.default(playerData.entity.position.x, playerData.entity.position.y);
                if (main_1.default.settingsManager.reconciliation) {
                    let j = 0;
                    while (j < this.pendingInputs.length) {
                        const input = this.pendingInputs[j];
                        if (input.inputSequenceNumber <= playerData.lastProcessedInput) {
                            this.pendingInputs.splice(j, 1);
                        }
                        else {
                            player.entity.applyInput(input);
                            j++;
                        }
                    }
                }
                else {
                    this.pendingInputs = [];
                }
            }
            else {
                if (!main_1.default.settingsManager.interpolation)
                    player.entity.position = new Vector2_1.default(playerData.entity.position.x, playerData.entity.position.y);
                else {
                    const timestamp = performance.now();
                    player.entity.positionBuffer.push(new ShareableData_1.default(timestamp, new Vector2_1.default(playerData.entity.position.x, playerData.entity.position.y)));
                }
            }
        });
    }
    getPlayerById(playerId) {
        for (let i = 0; i < this.currentPlayers.length; i++) {
            const player = this.currentPlayers[i];
            if (player.id == playerId)
                return player;
        }
        return null;
    }
    update() {
        if (main_1.default.ctx == null)
            return main_1.default.logger.sendLog("ERROR", `Impossible to get canvas context.`);
        main_1.default.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.processInputs();
        if (main_1.default.settingsManager.interpolation)
            this.interpolateEntities();
        this.currentPlayers.forEach((player) => {
            if (player.entity == null)
                return;
            player.entity.draw(main_1.default.ctx, player.username);
        });
    }
    processInputs() {
        var _a;
        const activePlayer = this.getPlayerById((_a = main_1.default.currentUser) === null || _a === void 0 ? void 0 : _a.id);
        if (activePlayer == null || activePlayer.entity == null)
            return;
        const nowTs = performance.now();
        const lastTs = this.lastTs || nowTs;
        const dtSec = (nowTs - lastTs) / 1000.0;
        this.lastTs = nowTs;
        const commands = [];
        if (main_1.default.keyManager.right)
            commands.push(Command_1.Command.Right);
        else if (main_1.default.keyManager.left)
            commands.push(Command_1.Command.Left);
        if (main_1.default.keyManager.up)
            commands.push(Command_1.Command.Up);
        else if (main_1.default.keyManager.down)
            commands.push(Command_1.Command.Down);
        if (commands.length == 0)
            return;
        this.inputSequenceNumber++;
        const inputs = new InputMessage_1.InputMessage({
            commands: commands,
            playerId: activePlayer.id,
            pressedTime: dtSec,
            inputSequenceNumber: this.inputSequenceNumber
        });
        main_1.default.webSocketManager.sendMsg("inputsData", inputs);
        if (main_1.default.settingsManager.prediction)
            activePlayer.entity.applyInput(inputs);
        this.pendingInputs.push(inputs);
    }
    interpolateEntities() {
        const now = performance.now();
        const renderTimestamp = now - (1000.0 / Config_1.default.SERVER_UPDATE_INTERVAL);
        this.currentPlayers.forEach((player) => {
            var _a;
            const entity = player.entity;
            if (entity == null || player.id == ((_a = main_1.default.currentUser) === null || _a === void 0 ? void 0 : _a.id))
                return;
            const buffer = entity.positionBuffer;
            while (buffer.length >= 2 && buffer[1].timestamp <= renderTimestamp) {
                buffer.shift();
            }
            if (buffer.length >= 2 && buffer[0].timestamp <= renderTimestamp && renderTimestamp <= buffer[1].timestamp) {
                entity.position.x = this.interpolate(buffer[0].shareableData.x, buffer[1].shareableData.x, buffer[0].timestamp, buffer[1].timestamp, renderTimestamp);
                entity.position.y = this.interpolate(buffer[0].shareableData.y, buffer[1].shareableData.y, buffer[0].timestamp, buffer[1].timestamp, renderTimestamp);
            }
        });
    }
    interpolate(p0, p1, t0, t1, renderTimestamp) {
        const deltaMovement = (p1 - p0);
        return p0 + deltaMovement * (renderTimestamp - t0) / (t1 - t0);
    }
}
exports["default"] = Room;


/***/ }),

/***/ "./client/Settings/SettingsManager.ts":
/*!********************************************!*\
  !*** ./client/Settings/SettingsManager.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const main_1 = __importDefault(__webpack_require__(/*! ../main */ "./client/main.ts"));
class SettingsManager {
    constructor() {
        this.prediction = false;
        this.reconciliation = false;
        this.interpolation = false;
        this.initEvents();
    }
    initEvents() {
        var _a, _b, _c, _d, _e;
        (_a = document.getElementById("prediction")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.setPrediction.bind(this));
        (_b = document.getElementById("reconciliation")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", this.setReconciliation.bind(this));
        (_c = document.getElementById("interpolation")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", this.setInterpolation.bind(this));
        (_d = document.getElementById("init_entity")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", this.initEntity.bind(this));
        (_e = document.getElementById("destroy_entity")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", this.destroyEntity.bind(this));
        const roomForm = document.getElementById("room_form");
        if (roomForm != null)
            roomForm.addEventListener("submit", this.goToRoom.bind(this));
    }
    setPrediction(e) {
        this.prediction = e.target.checked;
    }
    setReconciliation(e) {
        this.reconciliation = e.target.checked;
    }
    setInterpolation(e) {
        this.interpolation = e.target.checked;
    }
    initEntity() {
        main_1.default.webSocketManager.sendMsg("initEntity");
    }
    destroyEntity() {
        main_1.default.webSocketManager.sendMsg("destroyEntity");
    }
    goToRoom(e) {
        e.preventDefault();
        const roomId = document.getElementById("room_id");
        if (roomId == null)
            return;
        main_1.default.webSocketManager.sendMsg("joinRoom", roomId.value);
    }
}
exports["default"] = SettingsManager;


/***/ }),

/***/ "./client/User/User.ts":
/*!*****************************!*\
  !*** ./client/User/User.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class User {
    constructor(id, username) {
        this.id = id;
        this.username = username;
    }
}
exports["default"] = User;


/***/ }),

/***/ "./client/WebSockets/WebSocketsManager.ts":
/*!************************************************!*\
  !*** ./client/WebSockets/WebSocketsManager.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Config_1 = __importDefault(__webpack_require__(/*! ../Config/Config */ "./client/Config/Config.ts"));
const Room_1 = __importDefault(__webpack_require__(/*! ../Room/Room */ "./client/Room/Room.ts"));
const User_1 = __importDefault(__webpack_require__(/*! ../User/User */ "./client/User/User.ts"));
const main_1 = __importDefault(__webpack_require__(/*! ../main */ "./client/main.ts"));
class WebsocketManager {
    constructor() {
        this.ws = null;
    }
    init() {
        return new Promise((resolve, reject) => {
            const instance = this;
            this.ws = new WebSocket(`ws://${Config_1.default.SERVER_HOST}:${Config_1.default.SERVER_PORT}`);
            this.ws.onclose = () => {
                main_1.default.currentUser = null;
                main_1.default.game ? main_1.default.game.style.display = "none" : null;
                main_1.default.loginForm ? main_1.default.loginForm.style.display = "block" : null;
                main_1.default.logger.sendLog("ERROR", "Connection to server losted.");
            };
            this.ws.onopen = () => {
                main_1.default.logger.sendLog("SUCCESS", "Connected to server.");
                main_1.default.loginForm ? main_1.default.loginForm.style.display = "block" : null;
            };
            this.ws.onmessage = (msg) => {
                if (msg == null || msg.data == null)
                    return;
                const message = JSON.parse(msg.data.toString());
                switch (message.key) {
                    case "logged": {
                        main_1.default.currentUser = new User_1.default(message.value.id, message.value.username);
                        main_1.default.loginForm ? main_1.default.loginForm.style.display = "none" : null;
                        main_1.default.resizeCanvas();
                        main_1.default.game ? main_1.default.game.style.display = "block" : null;
                        main_1.default.logger.sendLog("INFO", `Logged as [${main_1.default.currentUser.id}] ${main_1.default.currentUser.username}.`);
                        // Join room ID 5ab81
                        instance.sendMsg("joinRoom", "5ab81");
                        break;
                    }
                    case "initRoom": {
                        main_1.default.currentRoom = new Room_1.default(message.value);
                        main_1.default.logger.sendLog("INFO", `Initializing room [${main_1.default.currentRoom.id}].`);
                        const roomId = document.getElementById("room_id");
                        if (roomId != null)
                            roomId.value = main_1.default.currentRoom.id.toString();
                        main_1.default.currentRoom.initAllPlayers(message.value.currentPlayers);
                        break;
                    }
                    case "playerJoin": {
                        if (main_1.default.currentRoom == null)
                            return;
                        main_1.default.currentRoom.initPlayer(message.value);
                        break;
                    }
                    case "playerLeft": {
                        if (main_1.default.currentRoom == null)
                            return;
                        main_1.default.currentRoom.removePlayer(message.value);
                        break;
                    }
                    case "worldState": {
                        if (main_1.default.currentRoom == null)
                            return;
                        main_1.default.currentRoom.updateWorldState(message.value);
                        break;
                    }
                    case "initEntity": {
                        if (main_1.default.currentRoom == null)
                            return;
                        main_1.default.currentRoom.initPlayerEntity(message.value);
                        break;
                    }
                    case "destroyEntity": {
                        if (main_1.default.currentRoom == null)
                            return;
                        main_1.default.currentRoom.destroyPlayerEntity(message.value);
                        break;
                    }
                }
            };
        });
    }
    sendMsg(key, value = null) {
        if (this.ws == null || this.ws.readyState !== WebSocket.OPEN)
            return main_1.default.logger.sendLog("ERROR", "Impossible to send message to server, websockets are disconnect.");
        const message = JSON.stringify({ key: key, value: value });
        this.ws.send(message);
    }
}
exports["default"] = WebsocketManager;


/***/ }),

/***/ "./client/main.ts":
/*!************************!*\
  !*** ./client/main.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Logger_1 = __importDefault(__webpack_require__(/*! ../shared/Logger/Logger */ "./shared/Logger/Logger.ts"));
const KeyManager_1 = __importDefault(__webpack_require__(/*! ./Key/KeyManager */ "./client/Key/KeyManager.ts"));
const SettingsManager_1 = __importDefault(__webpack_require__(/*! ./Settings/SettingsManager */ "./client/Settings/SettingsManager.ts"));
const WebSocketsManager_1 = __importDefault(__webpack_require__(/*! ./WebSockets/WebSocketsManager */ "./client/WebSockets/WebSocketsManager.ts"));
let Application;
class App {
    constructor() {
        this.logger = new Logger_1.default();
        this.keyManager = new KeyManager_1.default();
        this.webSocketManager = new WebSocketsManager_1.default();
        this.settingsManager = new SettingsManager_1.default();
        this.currentUser = null;
        this.currentRoom = null;
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.game = document.getElementById("game");
        this.loginForm = document.getElementById("login");
        window.requestAnimationFrame(this.update.bind(this));
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initEvents();
            yield this.webSocketManager.init();
        });
    }
    initEvents() {
        window.addEventListener("resize", this.resizeCanvas.bind(this));
        if (this.loginForm != null)
            this.loginForm.addEventListener("submit", this.tryLogin.bind(this));
    }
    resizeCanvas() {
        if (this.canvas == null)
            return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    tryLogin(e) {
        e.preventDefault();
        if (this.currentUser != null)
            return;
        const username = document.getElementById("login_username");
        if (username == null)
            return;
        this.webSocketManager.sendMsg("login", username.value);
    }
    update() {
        if (this.currentRoom != null)
            this.currentRoom.update();
        window.requestAnimationFrame(this.update.bind(this));
    }
}
Application = new App();
exports["default"] = Application;
Application.init().catch((e) => Application.logger.sendCriticalError(e.toString()));


/***/ }),

/***/ "./shared/Command/Command.ts":
/*!***********************************!*\
  !*** ./shared/Command/Command.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Command = void 0;
var Command;
(function (Command) {
    Command[Command["Up"] = 0] = "Up";
    Command[Command["Down"] = 1] = "Down";
    Command[Command["Left"] = 2] = "Left";
    Command[Command["Right"] = 3] = "Right";
})(Command || (exports.Command = Command = {}));


/***/ }),

/***/ "./shared/Entity/Entity.ts":
/*!*********************************!*\
  !*** ./shared/Entity/Entity.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Command_1 = __webpack_require__(/*! ../Command/Command */ "./shared/Command/Command.ts");
class Entity {
    constructor(data) {
        this.width = data.width;
        this.height = data.height;
        this.color = data.color;
        this.position = data.position;
        this.positionBuffer = [];
    }
    draw(ctx, username) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.font = "12px serif";
        ctx.fillStyle = "white";
        ctx.fillText(username, this.position.x, this.position.y - 10);
    }
    applyInput(input) {
        const speed = 100;
        if (input.commands.includes(Command_1.Command.Right))
            this.position.x += input.pressedTime * speed;
        if (input.commands.includes(Command_1.Command.Left))
            this.position.x += input.pressedTime * -speed;
        if (input.commands.includes(Command_1.Command.Up))
            this.position.y += input.pressedTime * -speed;
        if (input.commands.includes(Command_1.Command.Down))
            this.position.y += input.pressedTime * speed;
    }
}
exports["default"] = Entity;


/***/ }),

/***/ "./shared/InputMessage/InputMessage.ts":
/*!*********************************************!*\
  !*** ./shared/InputMessage/InputMessage.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InputMessage = void 0;
class InputMessage {
    constructor(data) {
        this.commands = data.commands;
        this.playerId = data.playerId;
        this.pressedTime = data.pressedTime;
        this.inputSequenceNumber = data.inputSequenceNumber;
    }
}
exports.InputMessage = InputMessage;


/***/ }),

/***/ "./shared/Logger/LogLevel.ts":
/*!***********************************!*\
  !*** ./shared/Logger/LogLevel.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const LogLevel = {
    INFO: {
        level: 0,
        name: "INFO",
        bgColor: "\x1b[44m",
        bgWebColor: "#19689B"
    },
    WARNING: {
        level: 0,
        name: "WARNING",
        bgColor: "\x1b[43m",
        bgWebColor: "#CF7E0F"
    },
    ERROR: {
        level: 0,
        name: "ERROR",
        bgColor: "\x1b[41m",
        bgWebColor: "#AF1B1B"
    },
    CRITICAL_ERROR: {
        level: 0,
        name: "CRITICAL ERROR",
        bgColor: "\x1b[41m",
        bgWebColor: "#AF1B1B"
    },
    SUCCESS: {
        level: 0,
        name: "SUCCESS",
        bgColor: "\x1b[42m",
        bgWebColor: "#167C43"
    },
    DEBUG: {
        level: 1,
        name: "DEBUG",
        bgColor: "\x1b[46m",
        bgWebColor: "#951D8A"
    },
    VERBOSE: {
        level: 2,
        name: "VERBOSE",
        bgColor: "\x1b[45m",
        bgWebColor: "#918D12"
    }
};
exports["default"] = LogLevel;


/***/ }),

/***/ "./shared/Logger/Logger.ts":
/*!*********************************!*\
  !*** ./shared/Logger/Logger.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const LogLevel_1 = __importDefault(__webpack_require__(/*! ./LogLevel */ "./shared/Logger/LogLevel.ts"));
class Logger {
    sendLog(logKey, message) {
        if (typeof window === 'undefined')
            console.log(LogLevel_1.default[logKey].bgColor, LogLevel_1.default[logKey].name, "\x1b[0m", message);
        else
            console.log(`%c ${LogLevel_1.default[logKey].name} %c ${message}`, `background-color: ${LogLevel_1.default[logKey].bgWebColor}; color: #FFF; font-weight: bold`, `background-color: inherit; color: inherit`);
    }
    sendCriticalError(message) {
        this.sendLog("CRITICAL_ERROR", message);
        if (typeof window === 'undefined')
            process.exit;
    }
}
exports["default"] = Logger;


/***/ }),

/***/ "./shared/ShareableData/ShareableData.ts":
/*!***********************************************!*\
  !*** ./shared/ShareableData/ShareableData.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class ShareableData {
    constructor(ts, p) {
        this.timestamp = ts;
        this.shareableData = p;
    }
}
exports["default"] = ShareableData;


/***/ }),

/***/ "./shared/Vector2/Vector2.ts":
/*!***********************************!*\
  !*** ./shared/Vector2/Vector2.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Vector2 {
    constructor(x, y) {
        this.x = x,
            this.y = y;
    }
}
exports["default"] = Vector2;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./client/main.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWU7Ozs7Ozs7Ozs7O0FDUkY7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWU7Ozs7Ozs7VUNSZjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vY2xpZW50L0NvbmZpZy9Db25maWcudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vY2xpZW50L0tleS9LZXlNYW5hZ2VyLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL2NsaWVudC9QbGF5ZXIvUGxheWVyLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL2NsaWVudC9Sb29tL1Jvb20udHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vY2xpZW50L1NldHRpbmdzL1NldHRpbmdzTWFuYWdlci50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9jbGllbnQvVXNlci9Vc2VyLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL2NsaWVudC9XZWJTb2NrZXRzL1dlYlNvY2tldHNNYW5hZ2VyLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL2NsaWVudC9tYWluLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL3NoYXJlZC9Db21tYW5kL0NvbW1hbmQudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vc2hhcmVkL0VudGl0eS9FbnRpdHkudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vc2hhcmVkL0lucHV0TWVzc2FnZS9JbnB1dE1lc3NhZ2UudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vc2hhcmVkL0xvZ2dlci9Mb2dMZXZlbC50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9zaGFyZWQvTG9nZ2VyL0xvZ2dlci50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9zaGFyZWQvU2hhcmVhYmxlRGF0YS9TaGFyZWFibGVEYXRhLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL3NoYXJlZC9WZWN0b3IyL1ZlY3RvcjIudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHtcbiAgICBTRVJWRVJfSE9TVDogXCIxMjcuMC4wLjFcIixcbiAgICBTRVJWRVJfUE9SVDogODA5MCxcbiAgICBTRVJWRVJfVVBEQVRFX0lOVEVSVkFMOiAxMFxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY2xhc3MgS2V5TWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kb3duID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGVmdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICAgIH1cbiAgICBpbml0RXZlbnRzKCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIHRoaXMua2V5VXAuYmluZCh0aGlzKSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleURvd24uYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIGtleVVwKGUpIHtcbiAgICAgICAgc3dpdGNoIChlLmNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgICAgICAgICAgdGhpcy51cCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICAgICAgICAgIHRoaXMuZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkFycm93TGVmdFwiOlxuICAgICAgICAgICAgICAgIHRoaXMubGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkFycm93UmlnaHRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAga2V5RG93bihlKSB7XG4gICAgICAgIHN3aXRjaCAoZS5jb2RlKSB7XG4gICAgICAgICAgICBjYXNlIFwiQXJyb3dVcFwiOlxuICAgICAgICAgICAgICAgIHRoaXMudXAgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICAgICAgICAgIHRoaXMuZG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiQXJyb3dMZWZ0XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5sZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJBcnJvd1JpZ2h0XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5yaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0SW5wdXRzKCkge1xuICAgICAgICByZXR1cm4geyB1cDogdGhpcy51cCwgZG93bjogdGhpcy5kb3duLCBsZWZ0OiB0aGlzLmxlZnQsIHJpZ2h0OiB0aGlzLnJpZ2h0IH07XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gS2V5TWFuYWdlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY2xhc3MgUGxheWVyIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICAgIHRoaXMuaWQgPSBkYXRhLmlkO1xuICAgICAgICB0aGlzLnVzZXJuYW1lID0gZGF0YS51c2VybmFtZTtcbiAgICAgICAgdGhpcy5lbnRpdHkgPSBkYXRhLmVudGl0eTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBQbGF5ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IENvbW1hbmRfMSA9IHJlcXVpcmUoXCIuLi8uLi9zaGFyZWQvQ29tbWFuZC9Db21tYW5kXCIpO1xuY29uc3QgRW50aXR5XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uLy4uL3NoYXJlZC9FbnRpdHkvRW50aXR5XCIpKTtcbmNvbnN0IElucHV0TWVzc2FnZV8xID0gcmVxdWlyZShcIi4uLy4uL3NoYXJlZC9JbnB1dE1lc3NhZ2UvSW5wdXRNZXNzYWdlXCIpO1xuY29uc3QgU2hhcmVhYmxlRGF0YV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi8uLi9zaGFyZWQvU2hhcmVhYmxlRGF0YS9TaGFyZWFibGVEYXRhXCIpKTtcbmNvbnN0IFZlY3RvcjJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vLi4vc2hhcmVkL1ZlY3RvcjIvVmVjdG9yMlwiKSk7XG5jb25zdCBDb25maWdfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vQ29uZmlnL0NvbmZpZ1wiKSk7XG5jb25zdCBQbGF5ZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vUGxheWVyL1BsYXllclwiKSk7XG5jb25zdCBtYWluXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL21haW5cIikpO1xuY2xhc3MgUm9vbSB7XG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgICAgICB0aGlzLmlkID0gZGF0YS5pZDtcbiAgICAgICAgdGhpcy5jdXJyZW50UGxheWVycyA9IFtdO1xuICAgICAgICB0aGlzLndvcmxkU3RhdGVzID0gW107XG4gICAgICAgIHRoaXMubGFzdFRzID0gMDtcbiAgICAgICAgdGhpcy5pbnB1dFNlcXVlbmNlTnVtYmVyID0gMDtcbiAgICAgICAgdGhpcy5wZW5kaW5nSW5wdXRzID0gW107XG4gICAgfVxuICAgIGluaXRBbGxQbGF5ZXJzKHBsYXllcnNMaXN0KSB7XG4gICAgICAgIHBsYXllcnNMaXN0LmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbml0UGxheWVyKHBsYXllcik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbml0UGxheWVyKHBsYXllcikge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGxheWVycy5maWx0ZXIoKHBsYXllckRhdGEpID0+IHBsYXllckRhdGEuaWQgPT0gcGxheWVyLmlkKVswXSAhPSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBwbGF5ZXJEYXRhID0gbmV3IFBsYXllcl8xLmRlZmF1bHQoe1xuICAgICAgICAgICAgaWQ6IHBsYXllci5pZCxcbiAgICAgICAgICAgIHVzZXJuYW1lOiBwbGF5ZXIudXNlcm5hbWUsXG4gICAgICAgICAgICBlbnRpdHk6IG5ldyBFbnRpdHlfMS5kZWZhdWx0KHtcbiAgICAgICAgICAgICAgICB3aWR0aDogcGxheWVyLmVudGl0eS53aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHBsYXllci5lbnRpdHkuaGVpZ2h0LFxuICAgICAgICAgICAgICAgIGNvbG9yOiBwbGF5ZXIuZW50aXR5LmNvbG9yLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMl8xLmRlZmF1bHQocGxheWVyLmVudGl0eS5wb3NpdGlvbi54LCBwbGF5ZXIuZW50aXR5LnBvc2l0aW9uLnkpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jdXJyZW50UGxheWVycy5wdXNoKHBsYXllckRhdGEpO1xuICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dnZXIuc2VuZExvZyhcIlZFUkJPU0VcIiwgYFBsYXllciAke3BsYXllci51c2VybmFtZX0gaW5pdGlhbGl6ZWQuYCk7XG4gICAgfVxuICAgIHJlbW92ZVBsYXllcihwbGF5ZXJJZCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRQbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBsYXllciwgaW5kZXgsIG9iamVjdCkge1xuICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PSBwbGF5ZXJJZCkge1xuICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmxvZ2dlci5zZW5kTG9nKFwiVkVSQk9TRVwiLCBgUGxheWVyICR7cGxheWVyLnVzZXJuYW1lfSBsZWZ0IHRoZSByb29tLmApO1xuICAgICAgICAgICAgICAgIG9iamVjdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW5pdFBsYXllckVudGl0eShwbGF5ZXJEYXRhKSB7XG4gICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMuZ2V0UGxheWVyQnlJZChwbGF5ZXJEYXRhLmlkKTtcbiAgICAgICAgaWYgKHBsYXllciA9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBwbGF5ZXIuZW50aXR5ID0gbmV3IEVudGl0eV8xLmRlZmF1bHQoe1xuICAgICAgICAgICAgd2lkdGg6IHBsYXllckRhdGEuZW50aXR5LndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBwbGF5ZXJEYXRhLmVudGl0eS5oZWlnaHQsXG4gICAgICAgICAgICBjb2xvcjogcGxheWVyRGF0YS5lbnRpdHkuY29sb3IsXG4gICAgICAgICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjJfMS5kZWZhdWx0KHBsYXllckRhdGEuZW50aXR5LnBvc2l0aW9uLngsIHBsYXllckRhdGEuZW50aXR5LnBvc2l0aW9uLnkpXG4gICAgICAgIH0pO1xuICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dnZXIuc2VuZExvZyhcIlZFUkJPU0VcIiwgYEVudGl0eSBvZiBbJHtwbGF5ZXIudXNlcm5hbWV9XSBpbml0aWFsaXplZC5gKTtcbiAgICB9XG4gICAgZGVzdHJveVBsYXllckVudGl0eShwbGF5ZXJJZCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMuZ2V0UGxheWVyQnlJZChwbGF5ZXJJZCk7XG4gICAgICAgIGlmIChwbGF5ZXIgPT0gbnVsbCB8fCBwbGF5ZXIuZW50aXR5ID09IG51bGwpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHBsYXllci5lbnRpdHkgPSBudWxsO1xuICAgICAgICBwbGF5ZXIuaWQgPT0gKChfYSA9IG1haW5fMS5kZWZhdWx0LmN1cnJlbnRVc2VyKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuaWQpID8gdGhpcy5wZW5kaW5nSW5wdXRzID0gW10gOiBudWxsO1xuICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dnZXIuc2VuZExvZyhcIlZFUkJPU0VcIiwgYEVudGl0eSBvZiBbJHtwbGF5ZXIudXNlcm5hbWV9XSBkZXN0cm95ZWQuYCk7XG4gICAgfVxuICAgIHVwZGF0ZVdvcmxkU3RhdGUocGxheWVyc0RhdGEpIHtcbiAgICAgICAgcGxheWVyc0RhdGEuZm9yRWFjaCgocGxheWVyRGF0YSkgPT4ge1xuICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5nZXRQbGF5ZXJCeUlkKHBsYXllckRhdGEuaWQpO1xuICAgICAgICAgICAgaWYgKHBsYXllciA9PSBudWxsIHx8IHBsYXllci5lbnRpdHkgPT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBpZiAocGxheWVyLmlkID09ICgoX2EgPSBtYWluXzEuZGVmYXVsdC5jdXJyZW50VXNlcikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmlkKSkge1xuICAgICAgICAgICAgICAgIHBsYXllci5lbnRpdHkucG9zaXRpb24gPSBuZXcgVmVjdG9yMl8xLmRlZmF1bHQocGxheWVyRGF0YS5lbnRpdHkucG9zaXRpb24ueCwgcGxheWVyRGF0YS5lbnRpdHkucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgaWYgKG1haW5fMS5kZWZhdWx0LnNldHRpbmdzTWFuYWdlci5yZWNvbmNpbGlhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaiA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChqIDwgdGhpcy5wZW5kaW5nSW5wdXRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5wdXQgPSB0aGlzLnBlbmRpbmdJbnB1dHNbal07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQuaW5wdXRTZXF1ZW5jZU51bWJlciA8PSBwbGF5ZXJEYXRhLmxhc3RQcm9jZXNzZWRJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGVuZGluZ0lucHV0cy5zcGxpY2UoaiwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuZW50aXR5LmFwcGx5SW5wdXQoaW5wdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGorKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nSW5wdXRzID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtYWluXzEuZGVmYXVsdC5zZXR0aW5nc01hbmFnZXIuaW50ZXJwb2xhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmVudGl0eS5wb3NpdGlvbiA9IG5ldyBWZWN0b3IyXzEuZGVmYXVsdChwbGF5ZXJEYXRhLmVudGl0eS5wb3NpdGlvbi54LCBwbGF5ZXJEYXRhLmVudGl0eS5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZXN0YW1wID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5lbnRpdHkucG9zaXRpb25CdWZmZXIucHVzaChuZXcgU2hhcmVhYmxlRGF0YV8xLmRlZmF1bHQodGltZXN0YW1wLCBuZXcgVmVjdG9yMl8xLmRlZmF1bHQocGxheWVyRGF0YS5lbnRpdHkucG9zaXRpb24ueCwgcGxheWVyRGF0YS5lbnRpdHkucG9zaXRpb24ueSkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRQbGF5ZXJCeUlkKHBsYXllcklkKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jdXJyZW50UGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5jdXJyZW50UGxheWVyc1tpXTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaWQgPT0gcGxheWVySWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBsYXllcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdXBkYXRlKCkge1xuICAgICAgICBpZiAobWFpbl8xLmRlZmF1bHQuY3R4ID09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gbWFpbl8xLmRlZmF1bHQubG9nZ2VyLnNlbmRMb2coXCJFUlJPUlwiLCBgSW1wb3NzaWJsZSB0byBnZXQgY2FudmFzIGNvbnRleHQuYCk7XG4gICAgICAgIG1haW5fMS5kZWZhdWx0LmN0eC5jbGVhclJlY3QoMCwgMCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgICAgIHRoaXMucHJvY2Vzc0lucHV0cygpO1xuICAgICAgICBpZiAobWFpbl8xLmRlZmF1bHQuc2V0dGluZ3NNYW5hZ2VyLmludGVycG9sYXRpb24pXG4gICAgICAgICAgICB0aGlzLmludGVycG9sYXRlRW50aXRpZXMoKTtcbiAgICAgICAgdGhpcy5jdXJyZW50UGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuZW50aXR5ID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgcGxheWVyLmVudGl0eS5kcmF3KG1haW5fMS5kZWZhdWx0LmN0eCwgcGxheWVyLnVzZXJuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByb2Nlc3NJbnB1dHMoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgY29uc3QgYWN0aXZlUGxheWVyID0gdGhpcy5nZXRQbGF5ZXJCeUlkKChfYSA9IG1haW5fMS5kZWZhdWx0LmN1cnJlbnRVc2VyKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuaWQpO1xuICAgICAgICBpZiAoYWN0aXZlUGxheWVyID09IG51bGwgfHwgYWN0aXZlUGxheWVyLmVudGl0eSA9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBub3dUcyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICBjb25zdCBsYXN0VHMgPSB0aGlzLmxhc3RUcyB8fCBub3dUcztcbiAgICAgICAgY29uc3QgZHRTZWMgPSAobm93VHMgLSBsYXN0VHMpIC8gMTAwMC4wO1xuICAgICAgICB0aGlzLmxhc3RUcyA9IG5vd1RzO1xuICAgICAgICBjb25zdCBjb21tYW5kcyA9IFtdO1xuICAgICAgICBpZiAobWFpbl8xLmRlZmF1bHQua2V5TWFuYWdlci5yaWdodClcbiAgICAgICAgICAgIGNvbW1hbmRzLnB1c2goQ29tbWFuZF8xLkNvbW1hbmQuUmlnaHQpO1xuICAgICAgICBlbHNlIGlmIChtYWluXzEuZGVmYXVsdC5rZXlNYW5hZ2VyLmxlZnQpXG4gICAgICAgICAgICBjb21tYW5kcy5wdXNoKENvbW1hbmRfMS5Db21tYW5kLkxlZnQpO1xuICAgICAgICBpZiAobWFpbl8xLmRlZmF1bHQua2V5TWFuYWdlci51cClcbiAgICAgICAgICAgIGNvbW1hbmRzLnB1c2goQ29tbWFuZF8xLkNvbW1hbmQuVXApO1xuICAgICAgICBlbHNlIGlmIChtYWluXzEuZGVmYXVsdC5rZXlNYW5hZ2VyLmRvd24pXG4gICAgICAgICAgICBjb21tYW5kcy5wdXNoKENvbW1hbmRfMS5Db21tYW5kLkRvd24pO1xuICAgICAgICBpZiAoY29tbWFuZHMubGVuZ3RoID09IDApXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMuaW5wdXRTZXF1ZW5jZU51bWJlcisrO1xuICAgICAgICBjb25zdCBpbnB1dHMgPSBuZXcgSW5wdXRNZXNzYWdlXzEuSW5wdXRNZXNzYWdlKHtcbiAgICAgICAgICAgIGNvbW1hbmRzOiBjb21tYW5kcyxcbiAgICAgICAgICAgIHBsYXllcklkOiBhY3RpdmVQbGF5ZXIuaWQsXG4gICAgICAgICAgICBwcmVzc2VkVGltZTogZHRTZWMsXG4gICAgICAgICAgICBpbnB1dFNlcXVlbmNlTnVtYmVyOiB0aGlzLmlucHV0U2VxdWVuY2VOdW1iZXJcbiAgICAgICAgfSk7XG4gICAgICAgIG1haW5fMS5kZWZhdWx0LndlYlNvY2tldE1hbmFnZXIuc2VuZE1zZyhcImlucHV0c0RhdGFcIiwgaW5wdXRzKTtcbiAgICAgICAgaWYgKG1haW5fMS5kZWZhdWx0LnNldHRpbmdzTWFuYWdlci5wcmVkaWN0aW9uKVxuICAgICAgICAgICAgYWN0aXZlUGxheWVyLmVudGl0eS5hcHBseUlucHV0KGlucHV0cyk7XG4gICAgICAgIHRoaXMucGVuZGluZ0lucHV0cy5wdXNoKGlucHV0cyk7XG4gICAgfVxuICAgIGludGVycG9sYXRlRW50aXRpZXMoKSB7XG4gICAgICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICBjb25zdCByZW5kZXJUaW1lc3RhbXAgPSBub3cgLSAoMTAwMC4wIC8gQ29uZmlnXzEuZGVmYXVsdC5TRVJWRVJfVVBEQVRFX0lOVEVSVkFMKTtcbiAgICAgICAgdGhpcy5jdXJyZW50UGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgIGNvbnN0IGVudGl0eSA9IHBsYXllci5lbnRpdHk7XG4gICAgICAgICAgICBpZiAoZW50aXR5ID09IG51bGwgfHwgcGxheWVyLmlkID09ICgoX2EgPSBtYWluXzEuZGVmYXVsdC5jdXJyZW50VXNlcikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmlkKSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBidWZmZXIgPSBlbnRpdHkucG9zaXRpb25CdWZmZXI7XG4gICAgICAgICAgICB3aGlsZSAoYnVmZmVyLmxlbmd0aCA+PSAyICYmIGJ1ZmZlclsxXS50aW1lc3RhbXAgPD0gcmVuZGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyLnNoaWZ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCA+PSAyICYmIGJ1ZmZlclswXS50aW1lc3RhbXAgPD0gcmVuZGVyVGltZXN0YW1wICYmIHJlbmRlclRpbWVzdGFtcCA8PSBidWZmZXJbMV0udGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgZW50aXR5LnBvc2l0aW9uLnggPSB0aGlzLmludGVycG9sYXRlKGJ1ZmZlclswXS5zaGFyZWFibGVEYXRhLngsIGJ1ZmZlclsxXS5zaGFyZWFibGVEYXRhLngsIGJ1ZmZlclswXS50aW1lc3RhbXAsIGJ1ZmZlclsxXS50aW1lc3RhbXAsIHJlbmRlclRpbWVzdGFtcCk7XG4gICAgICAgICAgICAgICAgZW50aXR5LnBvc2l0aW9uLnkgPSB0aGlzLmludGVycG9sYXRlKGJ1ZmZlclswXS5zaGFyZWFibGVEYXRhLnksIGJ1ZmZlclsxXS5zaGFyZWFibGVEYXRhLnksIGJ1ZmZlclswXS50aW1lc3RhbXAsIGJ1ZmZlclsxXS50aW1lc3RhbXAsIHJlbmRlclRpbWVzdGFtcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbnRlcnBvbGF0ZShwMCwgcDEsIHQwLCB0MSwgcmVuZGVyVGltZXN0YW1wKSB7XG4gICAgICAgIGNvbnN0IGRlbHRhTW92ZW1lbnQgPSAocDEgLSBwMCk7XG4gICAgICAgIHJldHVybiBwMCArIGRlbHRhTW92ZW1lbnQgKiAocmVuZGVyVGltZXN0YW1wIC0gdDApIC8gKHQxIC0gdDApO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFJvb207XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IG1haW5fMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vbWFpblwiKSk7XG5jbGFzcyBTZXR0aW5nc01hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnByZWRpY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZWNvbmNpbGlhdGlvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmludGVycG9sYXRpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gICAgfVxuICAgIGluaXRFdmVudHMoKSB7XG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2U7XG4gICAgICAgIChfYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJlZGljdGlvblwiKSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNldFByZWRpY3Rpb24uYmluZCh0aGlzKSk7XG4gICAgICAgIChfYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVjb25jaWxpYXRpb25cIikpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zZXRSZWNvbmNpbGlhdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgKF9jID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbnRlcnBvbGF0aW9uXCIpKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2MuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2V0SW50ZXJwb2xhdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgKF9kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbml0X2VudGl0eVwiKSkgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmluaXRFbnRpdHkuYmluZCh0aGlzKSk7XG4gICAgICAgIChfZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzdHJveV9lbnRpdHlcIikpID09PSBudWxsIHx8IF9lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZXN0cm95RW50aXR5LmJpbmQodGhpcykpO1xuICAgICAgICBjb25zdCByb29tRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vbV9mb3JtXCIpO1xuICAgICAgICBpZiAocm9vbUZvcm0gIT0gbnVsbClcbiAgICAgICAgICAgIHJvb21Gb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgdGhpcy5nb1RvUm9vbS5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgc2V0UHJlZGljdGlvbihlKSB7XG4gICAgICAgIHRoaXMucHJlZGljdGlvbiA9IGUudGFyZ2V0LmNoZWNrZWQ7XG4gICAgfVxuICAgIHNldFJlY29uY2lsaWF0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5yZWNvbmNpbGlhdGlvbiA9IGUudGFyZ2V0LmNoZWNrZWQ7XG4gICAgfVxuICAgIHNldEludGVycG9sYXRpb24oZSkge1xuICAgICAgICB0aGlzLmludGVycG9sYXRpb24gPSBlLnRhcmdldC5jaGVja2VkO1xuICAgIH1cbiAgICBpbml0RW50aXR5KCkge1xuICAgICAgICBtYWluXzEuZGVmYXVsdC53ZWJTb2NrZXRNYW5hZ2VyLnNlbmRNc2coXCJpbml0RW50aXR5XCIpO1xuICAgIH1cbiAgICBkZXN0cm95RW50aXR5KCkge1xuICAgICAgICBtYWluXzEuZGVmYXVsdC53ZWJTb2NrZXRNYW5hZ2VyLnNlbmRNc2coXCJkZXN0cm95RW50aXR5XCIpO1xuICAgIH1cbiAgICBnb1RvUm9vbShlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb29tX2lkXCIpO1xuICAgICAgICBpZiAocm9vbUlkID09IG51bGwpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIG1haW5fMS5kZWZhdWx0LndlYlNvY2tldE1hbmFnZXIuc2VuZE1zZyhcImpvaW5Sb29tXCIsIHJvb21JZC52YWx1ZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gU2V0dGluZ3NNYW5hZ2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBVc2VyIHtcbiAgICBjb25zdHJ1Y3RvcihpZCwgdXNlcm5hbWUpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLnVzZXJuYW1lID0gdXNlcm5hbWU7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gVXNlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgQ29uZmlnXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL0NvbmZpZy9Db25maWdcIikpO1xuY29uc3QgUm9vbV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9Sb29tL1Jvb21cIikpO1xuY29uc3QgVXNlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9Vc2VyL1VzZXJcIikpO1xuY29uc3QgbWFpbl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9tYWluXCIpKTtcbmNsYXNzIFdlYnNvY2tldE1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLndzID0gbnVsbDtcbiAgICB9XG4gICAgaW5pdCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMud3MgPSBuZXcgV2ViU29ja2V0KGB3czovLyR7Q29uZmlnXzEuZGVmYXVsdC5TRVJWRVJfSE9TVH06JHtDb25maWdfMS5kZWZhdWx0LlNFUlZFUl9QT1JUfWApO1xuICAgICAgICAgICAgdGhpcy53cy5vbmNsb3NlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmN1cnJlbnRVc2VyID0gbnVsbDtcbiAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5nYW1lID8gbWFpbl8xLmRlZmF1bHQuZ2FtZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCIgOiBudWxsO1xuICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmxvZ2luRm9ybSA/IG1haW5fMS5kZWZhdWx0LmxvZ2luRm9ybS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiIDogbnVsbDtcbiAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dnZXIuc2VuZExvZyhcIkVSUk9SXCIsIFwiQ29ubmVjdGlvbiB0byBzZXJ2ZXIgbG9zdGVkLlwiKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLndzLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dnZXIuc2VuZExvZyhcIlNVQ0NFU1NcIiwgXCJDb25uZWN0ZWQgdG8gc2VydmVyLlwiKTtcbiAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dpbkZvcm0gPyBtYWluXzEuZGVmYXVsdC5sb2dpbkZvcm0uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIiA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy53cy5vbm1lc3NhZ2UgPSAobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG1zZyA9PSBudWxsIHx8IG1zZy5kYXRhID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5wYXJzZShtc2cuZGF0YS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG1lc3NhZ2Uua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJsb2dnZWRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuY3VycmVudFVzZXIgPSBuZXcgVXNlcl8xLmRlZmF1bHQobWVzc2FnZS52YWx1ZS5pZCwgbWVzc2FnZS52YWx1ZS51c2VybmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dpbkZvcm0gPyBtYWluXzEuZGVmYXVsdC5sb2dpbkZvcm0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LnJlc2l6ZUNhbnZhcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuZ2FtZSA/IG1haW5fMS5kZWZhdWx0LmdhbWUuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIiA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dnZXIuc2VuZExvZyhcIklORk9cIiwgYExvZ2dlZCBhcyBbJHttYWluXzEuZGVmYXVsdC5jdXJyZW50VXNlci5pZH1dICR7bWFpbl8xLmRlZmF1bHQuY3VycmVudFVzZXIudXNlcm5hbWV9LmApO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSm9pbiByb29tIElEIDVhYjgxXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5zZW5kTXNnKFwiam9pblJvb21cIiwgXCI1YWI4MVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJpbml0Um9vbVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbSA9IG5ldyBSb29tXzEuZGVmYXVsdChtZXNzYWdlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmxvZ2dlci5zZW5kTG9nKFwiSU5GT1wiLCBgSW5pdGlhbGl6aW5nIHJvb20gWyR7bWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20uaWR9XS5gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vbV9pZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb29tSWQgIT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tSWQudmFsdWUgPSBtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbS5pZC50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20uaW5pdEFsbFBsYXllcnMobWVzc2FnZS52YWx1ZS5jdXJyZW50UGxheWVycyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGxheWVySm9pblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20gPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbS5pbml0UGxheWVyKG1lc3NhZ2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBsYXllckxlZnRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1haW5fMS5kZWZhdWx0LmN1cnJlbnRSb29tID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20ucmVtb3ZlUGxheWVyKG1lc3NhZ2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIndvcmxkU3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1haW5fMS5kZWZhdWx0LmN1cnJlbnRSb29tID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20udXBkYXRlV29ybGRTdGF0ZShtZXNzYWdlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJpbml0RW50aXR5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbSA9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmN1cnJlbnRSb29tLmluaXRQbGF5ZXJFbnRpdHkobWVzc2FnZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZGVzdHJveUVudGl0eVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20gPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbS5kZXN0cm95UGxheWVyRW50aXR5KG1lc3NhZ2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2VuZE1zZyhrZXksIHZhbHVlID0gbnVsbCkge1xuICAgICAgICBpZiAodGhpcy53cyA9PSBudWxsIHx8IHRoaXMud3MucmVhZHlTdGF0ZSAhPT0gV2ViU29ja2V0Lk9QRU4pXG4gICAgICAgICAgICByZXR1cm4gbWFpbl8xLmRlZmF1bHQubG9nZ2VyLnNlbmRMb2coXCJFUlJPUlwiLCBcIkltcG9zc2libGUgdG8gc2VuZCBtZXNzYWdlIHRvIHNlcnZlciwgd2Vic29ja2V0cyBhcmUgZGlzY29ubmVjdC5cIik7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeSh7IGtleToga2V5LCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgIHRoaXMud3Muc2VuZChtZXNzYWdlKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBXZWJzb2NrZXRNYW5hZ2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IExvZ2dlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9zaGFyZWQvTG9nZ2VyL0xvZ2dlclwiKSk7XG5jb25zdCBLZXlNYW5hZ2VyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vS2V5L0tleU1hbmFnZXJcIikpO1xuY29uc3QgU2V0dGluZ3NNYW5hZ2VyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vU2V0dGluZ3MvU2V0dGluZ3NNYW5hZ2VyXCIpKTtcbmNvbnN0IFdlYlNvY2tldHNNYW5hZ2VyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vV2ViU29ja2V0cy9XZWJTb2NrZXRzTWFuYWdlclwiKSk7XG5sZXQgQXBwbGljYXRpb247XG5jbGFzcyBBcHAge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmxvZ2dlciA9IG5ldyBMb2dnZXJfMS5kZWZhdWx0KCk7XG4gICAgICAgIHRoaXMua2V5TWFuYWdlciA9IG5ldyBLZXlNYW5hZ2VyXzEuZGVmYXVsdCgpO1xuICAgICAgICB0aGlzLndlYlNvY2tldE1hbmFnZXIgPSBuZXcgV2ViU29ja2V0c01hbmFnZXJfMS5kZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuc2V0dGluZ3NNYW5hZ2VyID0gbmV3IFNldHRpbmdzTWFuYWdlcl8xLmRlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5jdXJyZW50VXNlciA9IG51bGw7XG4gICAgICAgIHRoaXMuY3VycmVudFJvb20gPSBudWxsO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZUNhbnZhc1wiKTtcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIHRoaXMuZ2FtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZVwiKTtcbiAgICAgICAgdGhpcy5sb2dpbkZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ2luXCIpO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudXBkYXRlLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICBpbml0KCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLndlYlNvY2tldE1hbmFnZXIuaW5pdCgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW5pdEV2ZW50cygpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5yZXNpemVDYW52YXMuYmluZCh0aGlzKSk7XG4gICAgICAgIGlmICh0aGlzLmxvZ2luRm9ybSAhPSBudWxsKVxuICAgICAgICAgICAgdGhpcy5sb2dpbkZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCB0aGlzLnRyeUxvZ2luLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICByZXNpemVDYW52YXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNhbnZhcyA9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgfVxuICAgIHRyeUxvZ2luKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50VXNlciAhPSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCB1c2VybmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9naW5fdXNlcm5hbWVcIik7XG4gICAgICAgIGlmICh1c2VybmFtZSA9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLndlYlNvY2tldE1hbmFnZXIuc2VuZE1zZyhcImxvZ2luXCIsIHVzZXJuYW1lLnZhbHVlKTtcbiAgICB9XG4gICAgdXBkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um9vbSAhPSBudWxsKVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Um9vbS51cGRhdGUoKTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpKTtcbiAgICB9XG59XG5BcHBsaWNhdGlvbiA9IG5ldyBBcHAoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEFwcGxpY2F0aW9uO1xuQXBwbGljYXRpb24uaW5pdCgpLmNhdGNoKChlKSA9PiBBcHBsaWNhdGlvbi5sb2dnZXIuc2VuZENyaXRpY2FsRXJyb3IoZS50b1N0cmluZygpKSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ29tbWFuZCA9IHZvaWQgMDtcbnZhciBDb21tYW5kO1xuKGZ1bmN0aW9uIChDb21tYW5kKSB7XG4gICAgQ29tbWFuZFtDb21tYW5kW1wiVXBcIl0gPSAwXSA9IFwiVXBcIjtcbiAgICBDb21tYW5kW0NvbW1hbmRbXCJEb3duXCJdID0gMV0gPSBcIkRvd25cIjtcbiAgICBDb21tYW5kW0NvbW1hbmRbXCJMZWZ0XCJdID0gMl0gPSBcIkxlZnRcIjtcbiAgICBDb21tYW5kW0NvbW1hbmRbXCJSaWdodFwiXSA9IDNdID0gXCJSaWdodFwiO1xufSkoQ29tbWFuZCB8fCAoZXhwb3J0cy5Db21tYW5kID0gQ29tbWFuZCA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IENvbW1hbmRfMSA9IHJlcXVpcmUoXCIuLi9Db21tYW5kL0NvbW1hbmRcIik7XG5jbGFzcyBFbnRpdHkge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IGRhdGEud2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gZGF0YS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuY29sb3IgPSBkYXRhLmNvbG9yO1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgdGhpcy5wb3NpdGlvbkJ1ZmZlciA9IFtdO1xuICAgIH1cbiAgICBkcmF3KGN0eCwgdXNlcm5hbWUpIHtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgICAgIGN0eC5maWxsUmVjdCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBjdHguZm9udCA9IFwiMTJweCBzZXJpZlwiO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgICAgICBjdHguZmlsbFRleHQodXNlcm5hbWUsIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55IC0gMTApO1xuICAgIH1cbiAgICBhcHBseUlucHV0KGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHNwZWVkID0gMTAwO1xuICAgICAgICBpZiAoaW5wdXQuY29tbWFuZHMuaW5jbHVkZXMoQ29tbWFuZF8xLkNvbW1hbmQuUmlnaHQpKVxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ICs9IGlucHV0LnByZXNzZWRUaW1lICogc3BlZWQ7XG4gICAgICAgIGlmIChpbnB1dC5jb21tYW5kcy5pbmNsdWRlcyhDb21tYW5kXzEuQ29tbWFuZC5MZWZ0KSlcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCArPSBpbnB1dC5wcmVzc2VkVGltZSAqIC1zcGVlZDtcbiAgICAgICAgaWYgKGlucHV0LmNvbW1hbmRzLmluY2x1ZGVzKENvbW1hbmRfMS5Db21tYW5kLlVwKSlcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSArPSBpbnB1dC5wcmVzc2VkVGltZSAqIC1zcGVlZDtcbiAgICAgICAgaWYgKGlucHV0LmNvbW1hbmRzLmluY2x1ZGVzKENvbW1hbmRfMS5Db21tYW5kLkRvd24pKVxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55ICs9IGlucHV0LnByZXNzZWRUaW1lICogc3BlZWQ7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gRW50aXR5O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLklucHV0TWVzc2FnZSA9IHZvaWQgMDtcbmNsYXNzIElucHV0TWVzc2FnZSB7XG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgICAgICB0aGlzLmNvbW1hbmRzID0gZGF0YS5jb21tYW5kcztcbiAgICAgICAgdGhpcy5wbGF5ZXJJZCA9IGRhdGEucGxheWVySWQ7XG4gICAgICAgIHRoaXMucHJlc3NlZFRpbWUgPSBkYXRhLnByZXNzZWRUaW1lO1xuICAgICAgICB0aGlzLmlucHV0U2VxdWVuY2VOdW1iZXIgPSBkYXRhLmlucHV0U2VxdWVuY2VOdW1iZXI7XG4gICAgfVxufVxuZXhwb3J0cy5JbnB1dE1lc3NhZ2UgPSBJbnB1dE1lc3NhZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IExvZ0xldmVsID0ge1xuICAgIElORk86IHtcbiAgICAgICAgbGV2ZWw6IDAsXG4gICAgICAgIG5hbWU6IFwiSU5GT1wiLFxuICAgICAgICBiZ0NvbG9yOiBcIlxceDFiWzQ0bVwiLFxuICAgICAgICBiZ1dlYkNvbG9yOiBcIiMxOTY4OUJcIlxuICAgIH0sXG4gICAgV0FSTklORzoge1xuICAgICAgICBsZXZlbDogMCxcbiAgICAgICAgbmFtZTogXCJXQVJOSU5HXCIsXG4gICAgICAgIGJnQ29sb3I6IFwiXFx4MWJbNDNtXCIsXG4gICAgICAgIGJnV2ViQ29sb3I6IFwiI0NGN0UwRlwiXG4gICAgfSxcbiAgICBFUlJPUjoge1xuICAgICAgICBsZXZlbDogMCxcbiAgICAgICAgbmFtZTogXCJFUlJPUlwiLFxuICAgICAgICBiZ0NvbG9yOiBcIlxceDFiWzQxbVwiLFxuICAgICAgICBiZ1dlYkNvbG9yOiBcIiNBRjFCMUJcIlxuICAgIH0sXG4gICAgQ1JJVElDQUxfRVJST1I6IHtcbiAgICAgICAgbGV2ZWw6IDAsXG4gICAgICAgIG5hbWU6IFwiQ1JJVElDQUwgRVJST1JcIixcbiAgICAgICAgYmdDb2xvcjogXCJcXHgxYls0MW1cIixcbiAgICAgICAgYmdXZWJDb2xvcjogXCIjQUYxQjFCXCJcbiAgICB9LFxuICAgIFNVQ0NFU1M6IHtcbiAgICAgICAgbGV2ZWw6IDAsXG4gICAgICAgIG5hbWU6IFwiU1VDQ0VTU1wiLFxuICAgICAgICBiZ0NvbG9yOiBcIlxceDFiWzQybVwiLFxuICAgICAgICBiZ1dlYkNvbG9yOiBcIiMxNjdDNDNcIlxuICAgIH0sXG4gICAgREVCVUc6IHtcbiAgICAgICAgbGV2ZWw6IDEsXG4gICAgICAgIG5hbWU6IFwiREVCVUdcIixcbiAgICAgICAgYmdDb2xvcjogXCJcXHgxYls0Nm1cIixcbiAgICAgICAgYmdXZWJDb2xvcjogXCIjOTUxRDhBXCJcbiAgICB9LFxuICAgIFZFUkJPU0U6IHtcbiAgICAgICAgbGV2ZWw6IDIsXG4gICAgICAgIG5hbWU6IFwiVkVSQk9TRVwiLFxuICAgICAgICBiZ0NvbG9yOiBcIlxceDFiWzQ1bVwiLFxuICAgICAgICBiZ1dlYkNvbG9yOiBcIiM5MThEMTJcIlxuICAgIH1cbn07XG5leHBvcnRzLmRlZmF1bHQgPSBMb2dMZXZlbDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgTG9nTGV2ZWxfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9Mb2dMZXZlbFwiKSk7XG5jbGFzcyBMb2dnZXIge1xuICAgIHNlbmRMb2cobG9nS2V5LCBtZXNzYWdlKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKExvZ0xldmVsXzEuZGVmYXVsdFtsb2dLZXldLmJnQ29sb3IsIExvZ0xldmVsXzEuZGVmYXVsdFtsb2dLZXldLm5hbWUsIFwiXFx4MWJbMG1cIiwgbWVzc2FnZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAlYyAke0xvZ0xldmVsXzEuZGVmYXVsdFtsb2dLZXldLm5hbWV9ICVjICR7bWVzc2FnZX1gLCBgYmFja2dyb3VuZC1jb2xvcjogJHtMb2dMZXZlbF8xLmRlZmF1bHRbbG9nS2V5XS5iZ1dlYkNvbG9yfTsgY29sb3I6ICNGRkY7IGZvbnQtd2VpZ2h0OiBib2xkYCwgYGJhY2tncm91bmQtY29sb3I6IGluaGVyaXQ7IGNvbG9yOiBpbmhlcml0YCk7XG4gICAgfVxuICAgIHNlbmRDcml0aWNhbEVycm9yKG1lc3NhZ2UpIHtcbiAgICAgICAgdGhpcy5zZW5kTG9nKFwiQ1JJVElDQUxfRVJST1JcIiwgbWVzc2FnZSk7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdDtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBMb2dnZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIFNoYXJlYWJsZURhdGEge1xuICAgIGNvbnN0cnVjdG9yKHRzLCBwKSB7XG4gICAgICAgIHRoaXMudGltZXN0YW1wID0gdHM7XG4gICAgICAgIHRoaXMuc2hhcmVhYmxlRGF0YSA9IHA7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gU2hhcmVhYmxlRGF0YTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY2xhc3MgVmVjdG9yMiB7XG4gICAgY29uc3RydWN0b3IoeCwgeSkge1xuICAgICAgICB0aGlzLnggPSB4LFxuICAgICAgICAgICAgdGhpcy55ID0geTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBWZWN0b3IyO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vY2xpZW50L21haW4udHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=