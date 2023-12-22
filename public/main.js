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
        window.requestAnimationFrame(this.update.bind(this));
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
        window.requestAnimationFrame(this.update.bind(this));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBLGtCQUFlOzs7Ozs7Ozs7OztBQ1JGO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFlOzs7Ozs7O1VDUmY7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL2NsaWVudC9Db25maWcvQ29uZmlnLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL2NsaWVudC9LZXkvS2V5TWFuYWdlci50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9jbGllbnQvUGxheWVyL1BsYXllci50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9jbGllbnQvUm9vbS9Sb29tLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL2NsaWVudC9TZXR0aW5ncy9TZXR0aW5nc01hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vY2xpZW50L1VzZXIvVXNlci50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9jbGllbnQvV2ViU29ja2V0cy9XZWJTb2NrZXRzTWFuYWdlci50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9jbGllbnQvbWFpbi50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9zaGFyZWQvQ29tbWFuZC9Db21tYW5kLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL3NoYXJlZC9FbnRpdHkvRW50aXR5LnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL3NoYXJlZC9JbnB1dE1lc3NhZ2UvSW5wdXRNZXNzYWdlLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL3NoYXJlZC9Mb2dnZXIvTG9nTGV2ZWwudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vc2hhcmVkL0xvZ2dlci9Mb2dnZXIudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vc2hhcmVkL1NoYXJlYWJsZURhdGEvU2hhcmVhYmxlRGF0YS50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9zaGFyZWQvVmVjdG9yMi9WZWN0b3IyLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSB7XG4gICAgU0VSVkVSX0hPU1Q6IFwiMTI3LjAuMC4xXCIsXG4gICAgU0VSVkVSX1BPUlQ6IDgwOTAsXG4gICAgU0VSVkVSX1VQREFURV9JTlRFUlZBTDogMTBcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIEtleU1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnVwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZG93biA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yaWdodCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmluaXRFdmVudHMoKTtcbiAgICB9XG4gICAgaW5pdEV2ZW50cygpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCB0aGlzLmtleVVwLmJpbmQodGhpcykpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlEb3duLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICBrZXlVcChlKSB7XG4gICAgICAgIHN3aXRjaCAoZS5jb2RlKSB7XG4gICAgICAgICAgICBjYXNlIFwiQXJyb3dVcFwiOlxuICAgICAgICAgICAgICAgIHRoaXMudXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJBcnJvd0Rvd25cIjpcbiAgICAgICAgICAgICAgICB0aGlzLmRvd24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJBcnJvd0xlZnRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJBcnJvd1JpZ2h0XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5yaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGtleURvd24oZSkge1xuICAgICAgICBzd2l0Y2ggKGUuY29kZSkge1xuICAgICAgICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgICAgICAgICB0aGlzLnVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJBcnJvd0Rvd25cIjpcbiAgICAgICAgICAgICAgICB0aGlzLmRvd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkFycm93TGVmdFwiOlxuICAgICAgICAgICAgICAgIHRoaXMubGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiQXJyb3dSaWdodFwiOlxuICAgICAgICAgICAgICAgIHRoaXMucmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldElucHV0cygpIHtcbiAgICAgICAgcmV0dXJuIHsgdXA6IHRoaXMudXAsIGRvd246IHRoaXMuZG93biwgbGVmdDogdGhpcy5sZWZ0LCByaWdodDogdGhpcy5yaWdodCB9O1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IEtleU1hbmFnZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIFBsYXllciB7XG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgICAgICB0aGlzLmlkID0gZGF0YS5pZDtcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IGRhdGEudXNlcm5hbWU7XG4gICAgICAgIHRoaXMuZW50aXR5ID0gZGF0YS5lbnRpdHk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gUGxheWVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBDb21tYW5kXzEgPSByZXF1aXJlKFwiLi4vLi4vc2hhcmVkL0NvbW1hbmQvQ29tbWFuZFwiKTtcbmNvbnN0IEVudGl0eV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi8uLi9zaGFyZWQvRW50aXR5L0VudGl0eVwiKSk7XG5jb25zdCBJbnB1dE1lc3NhZ2VfMSA9IHJlcXVpcmUoXCIuLi8uLi9zaGFyZWQvSW5wdXRNZXNzYWdlL0lucHV0TWVzc2FnZVwiKTtcbmNvbnN0IFNoYXJlYWJsZURhdGFfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vLi4vc2hhcmVkL1NoYXJlYWJsZURhdGEvU2hhcmVhYmxlRGF0YVwiKSk7XG5jb25zdCBWZWN0b3IyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uLy4uL3NoYXJlZC9WZWN0b3IyL1ZlY3RvcjJcIikpO1xuY29uc3QgQ29uZmlnXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL0NvbmZpZy9Db25maWdcIikpO1xuY29uc3QgUGxheWVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL1BsYXllci9QbGF5ZXJcIikpO1xuY29uc3QgbWFpbl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9tYWluXCIpKTtcbmNsYXNzIFJvb20ge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgICAgdGhpcy5pZCA9IGRhdGEuaWQ7XG4gICAgICAgIHRoaXMuY3VycmVudFBsYXllcnMgPSBbXTtcbiAgICAgICAgdGhpcy53b3JsZFN0YXRlcyA9IFtdO1xuICAgICAgICB0aGlzLmxhc3RUcyA9IDA7XG4gICAgICAgIHRoaXMuaW5wdXRTZXF1ZW5jZU51bWJlciA9IDA7XG4gICAgICAgIHRoaXMucGVuZGluZ0lucHV0cyA9IFtdO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudXBkYXRlLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICBpbml0QWxsUGxheWVycyhwbGF5ZXJzTGlzdCkge1xuICAgICAgICBwbGF5ZXJzTGlzdC5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5pdFBsYXllcihwbGF5ZXIpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW5pdFBsYXllcihwbGF5ZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFBsYXllcnMuZmlsdGVyKChwbGF5ZXJEYXRhKSA9PiBwbGF5ZXJEYXRhLmlkID09IHBsYXllci5pZClbMF0gIT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgcGxheWVyRGF0YSA9IG5ldyBQbGF5ZXJfMS5kZWZhdWx0KHtcbiAgICAgICAgICAgIGlkOiBwbGF5ZXIuaWQsXG4gICAgICAgICAgICB1c2VybmFtZTogcGxheWVyLnVzZXJuYW1lLFxuICAgICAgICAgICAgZW50aXR5OiBuZXcgRW50aXR5XzEuZGVmYXVsdCh7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHBsYXllci5lbnRpdHkud2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBwbGF5ZXIuZW50aXR5LmhlaWdodCxcbiAgICAgICAgICAgICAgICBjb2xvcjogcGxheWVyLmVudGl0eS5jb2xvcixcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjJfMS5kZWZhdWx0KHBsYXllci5lbnRpdHkucG9zaXRpb24ueCwgcGxheWVyLmVudGl0eS5wb3NpdGlvbi55KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY3VycmVudFBsYXllcnMucHVzaChwbGF5ZXJEYXRhKTtcbiAgICAgICAgbWFpbl8xLmRlZmF1bHQubG9nZ2VyLnNlbmRMb2coXCJWRVJCT1NFXCIsIGBQbGF5ZXIgJHtwbGF5ZXIudXNlcm5hbWV9IGluaXRpYWxpemVkLmApO1xuICAgIH1cbiAgICByZW1vdmVQbGF5ZXIocGxheWVySWQpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwbGF5ZXIsIGluZGV4LCBvYmplY3QpIHtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaWQgPT0gcGxheWVySWQpIHtcbiAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dnZXIuc2VuZExvZyhcIlZFUkJPU0VcIiwgYFBsYXllciAke3BsYXllci51c2VybmFtZX0gbGVmdCB0aGUgcm9vbS5gKTtcbiAgICAgICAgICAgICAgICBvYmplY3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGluaXRQbGF5ZXJFbnRpdHkocGxheWVyRGF0YSkge1xuICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLmdldFBsYXllckJ5SWQocGxheWVyRGF0YS5pZCk7XG4gICAgICAgIGlmIChwbGF5ZXIgPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgcGxheWVyLmVudGl0eSA9IG5ldyBFbnRpdHlfMS5kZWZhdWx0KHtcbiAgICAgICAgICAgIHdpZHRoOiBwbGF5ZXJEYXRhLmVudGl0eS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogcGxheWVyRGF0YS5lbnRpdHkuaGVpZ2h0LFxuICAgICAgICAgICAgY29sb3I6IHBsYXllckRhdGEuZW50aXR5LmNvbG9yLFxuICAgICAgICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyXzEuZGVmYXVsdChwbGF5ZXJEYXRhLmVudGl0eS5wb3NpdGlvbi54LCBwbGF5ZXJEYXRhLmVudGl0eS5wb3NpdGlvbi55KVxuICAgICAgICB9KTtcbiAgICAgICAgbWFpbl8xLmRlZmF1bHQubG9nZ2VyLnNlbmRMb2coXCJWRVJCT1NFXCIsIGBFbnRpdHkgb2YgWyR7cGxheWVyLnVzZXJuYW1lfV0gaW5pdGlhbGl6ZWQuYCk7XG4gICAgfVxuICAgIGRlc3Ryb3lQbGF5ZXJFbnRpdHkocGxheWVySWQpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLmdldFBsYXllckJ5SWQocGxheWVySWQpO1xuICAgICAgICBpZiAocGxheWVyID09IG51bGwgfHwgcGxheWVyLmVudGl0eSA9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBwbGF5ZXIuZW50aXR5ID0gbnVsbDtcbiAgICAgICAgcGxheWVyLmlkID09ICgoX2EgPSBtYWluXzEuZGVmYXVsdC5jdXJyZW50VXNlcikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmlkKSA/IHRoaXMucGVuZGluZ0lucHV0cyA9IFtdIDogbnVsbDtcbiAgICAgICAgbWFpbl8xLmRlZmF1bHQubG9nZ2VyLnNlbmRMb2coXCJWRVJCT1NFXCIsIGBFbnRpdHkgb2YgWyR7cGxheWVyLnVzZXJuYW1lfV0gZGVzdHJveWVkLmApO1xuICAgIH1cbiAgICB1cGRhdGVXb3JsZFN0YXRlKHBsYXllcnNEYXRhKSB7XG4gICAgICAgIHBsYXllcnNEYXRhLmZvckVhY2goKHBsYXllckRhdGEpID0+IHtcbiAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMuZ2V0UGxheWVyQnlJZChwbGF5ZXJEYXRhLmlkKTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIgPT0gbnVsbCB8fCBwbGF5ZXIuZW50aXR5ID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PSAoKF9hID0gbWFpbl8xLmRlZmF1bHQuY3VycmVudFVzZXIpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5pZCkpIHtcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZW50aXR5LnBvc2l0aW9uID0gbmV3IFZlY3RvcjJfMS5kZWZhdWx0KHBsYXllckRhdGEuZW50aXR5LnBvc2l0aW9uLngsIHBsYXllckRhdGEuZW50aXR5LnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICAgIGlmIChtYWluXzEuZGVmYXVsdC5zZXR0aW5nc01hbmFnZXIucmVjb25jaWxpYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGogPSAwO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaiA8IHRoaXMucGVuZGluZ0lucHV0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gdGhpcy5wZW5kaW5nSW5wdXRzW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlucHV0LmlucHV0U2VxdWVuY2VOdW1iZXIgPD0gcGxheWVyRGF0YS5sYXN0UHJvY2Vzc2VkSW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBlbmRpbmdJbnB1dHMuc3BsaWNlKGosIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyLmVudGl0eS5hcHBseUlucHV0KGlucHV0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGVuZGluZ0lucHV0cyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghbWFpbl8xLmRlZmF1bHQuc2V0dGluZ3NNYW5hZ2VyLmludGVycG9sYXRpb24pXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5lbnRpdHkucG9zaXRpb24gPSBuZXcgVmVjdG9yMl8xLmRlZmF1bHQocGxheWVyRGF0YS5lbnRpdHkucG9zaXRpb24ueCwgcGxheWVyRGF0YS5lbnRpdHkucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuZW50aXR5LnBvc2l0aW9uQnVmZmVyLnB1c2gobmV3IFNoYXJlYWJsZURhdGFfMS5kZWZhdWx0KHRpbWVzdGFtcCwgbmV3IFZlY3RvcjJfMS5kZWZhdWx0KHBsYXllckRhdGEuZW50aXR5LnBvc2l0aW9uLngsIHBsYXllckRhdGEuZW50aXR5LnBvc2l0aW9uLnkpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0UGxheWVyQnlJZChwbGF5ZXJJZCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY3VycmVudFBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMuY3VycmVudFBsYXllcnNbaV07XG4gICAgICAgICAgICBpZiAocGxheWVyLmlkID09IHBsYXllcklkKVxuICAgICAgICAgICAgICAgIHJldHVybiBwbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKG1haW5fMS5kZWZhdWx0LmN0eCA9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIG1haW5fMS5kZWZhdWx0LmxvZ2dlci5zZW5kTG9nKFwiRVJST1JcIiwgYEltcG9zc2libGUgdG8gZ2V0IGNhbnZhcyBjb250ZXh0LmApO1xuICAgICAgICBtYWluXzEuZGVmYXVsdC5jdHguY2xlYXJSZWN0KDAsIDAsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgICB0aGlzLnByb2Nlc3NJbnB1dHMoKTtcbiAgICAgICAgaWYgKG1haW5fMS5kZWZhdWx0LnNldHRpbmdzTWFuYWdlci5pbnRlcnBvbGF0aW9uKVxuICAgICAgICAgICAgdGhpcy5pbnRlcnBvbGF0ZUVudGl0aWVzKCk7XG4gICAgICAgIHRoaXMuY3VycmVudFBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAocGxheWVyLmVudGl0eSA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHBsYXllci5lbnRpdHkuZHJhdyhtYWluXzEuZGVmYXVsdC5jdHgsIHBsYXllci51c2VybmFtZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudXBkYXRlLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICBwcm9jZXNzSW5wdXRzKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGNvbnN0IGFjdGl2ZVBsYXllciA9IHRoaXMuZ2V0UGxheWVyQnlJZCgoX2EgPSBtYWluXzEuZGVmYXVsdC5jdXJyZW50VXNlcikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmlkKTtcbiAgICAgICAgaWYgKGFjdGl2ZVBsYXllciA9PSBudWxsIHx8IGFjdGl2ZVBsYXllci5lbnRpdHkgPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3Qgbm93VHMgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgY29uc3QgbGFzdFRzID0gdGhpcy5sYXN0VHMgfHwgbm93VHM7XG4gICAgICAgIGNvbnN0IGR0U2VjID0gKG5vd1RzIC0gbGFzdFRzKSAvIDEwMDAuMDtcbiAgICAgICAgdGhpcy5sYXN0VHMgPSBub3dUcztcbiAgICAgICAgY29uc3QgY29tbWFuZHMgPSBbXTtcbiAgICAgICAgaWYgKG1haW5fMS5kZWZhdWx0LmtleU1hbmFnZXIucmlnaHQpXG4gICAgICAgICAgICBjb21tYW5kcy5wdXNoKENvbW1hbmRfMS5Db21tYW5kLlJpZ2h0KTtcbiAgICAgICAgZWxzZSBpZiAobWFpbl8xLmRlZmF1bHQua2V5TWFuYWdlci5sZWZ0KVxuICAgICAgICAgICAgY29tbWFuZHMucHVzaChDb21tYW5kXzEuQ29tbWFuZC5MZWZ0KTtcbiAgICAgICAgaWYgKG1haW5fMS5kZWZhdWx0LmtleU1hbmFnZXIudXApXG4gICAgICAgICAgICBjb21tYW5kcy5wdXNoKENvbW1hbmRfMS5Db21tYW5kLlVwKTtcbiAgICAgICAgZWxzZSBpZiAobWFpbl8xLmRlZmF1bHQua2V5TWFuYWdlci5kb3duKVxuICAgICAgICAgICAgY29tbWFuZHMucHVzaChDb21tYW5kXzEuQ29tbWFuZC5Eb3duKTtcbiAgICAgICAgaWYgKGNvbW1hbmRzLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLmlucHV0U2VxdWVuY2VOdW1iZXIrKztcbiAgICAgICAgY29uc3QgaW5wdXRzID0gbmV3IElucHV0TWVzc2FnZV8xLklucHV0TWVzc2FnZSh7XG4gICAgICAgICAgICBjb21tYW5kczogY29tbWFuZHMsXG4gICAgICAgICAgICBwbGF5ZXJJZDogYWN0aXZlUGxheWVyLmlkLFxuICAgICAgICAgICAgcHJlc3NlZFRpbWU6IGR0U2VjLFxuICAgICAgICAgICAgaW5wdXRTZXF1ZW5jZU51bWJlcjogdGhpcy5pbnB1dFNlcXVlbmNlTnVtYmVyXG4gICAgICAgIH0pO1xuICAgICAgICBtYWluXzEuZGVmYXVsdC53ZWJTb2NrZXRNYW5hZ2VyLnNlbmRNc2coXCJpbnB1dHNEYXRhXCIsIGlucHV0cyk7XG4gICAgICAgIGlmIChtYWluXzEuZGVmYXVsdC5zZXR0aW5nc01hbmFnZXIucHJlZGljdGlvbilcbiAgICAgICAgICAgIGFjdGl2ZVBsYXllci5lbnRpdHkuYXBwbHlJbnB1dChpbnB1dHMpO1xuICAgICAgICB0aGlzLnBlbmRpbmdJbnB1dHMucHVzaChpbnB1dHMpO1xuICAgIH1cbiAgICBpbnRlcnBvbGF0ZUVudGl0aWVzKCkge1xuICAgICAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgY29uc3QgcmVuZGVyVGltZXN0YW1wID0gbm93IC0gKDEwMDAuMCAvIENvbmZpZ18xLmRlZmF1bHQuU0VSVkVSX1VQREFURV9JTlRFUlZBTCk7XG4gICAgICAgIHRoaXMuY3VycmVudFBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICBjb25zdCBlbnRpdHkgPSBwbGF5ZXIuZW50aXR5O1xuICAgICAgICAgICAgaWYgKGVudGl0eSA9PSBudWxsIHx8IHBsYXllci5pZCA9PSAoKF9hID0gbWFpbl8xLmRlZmF1bHQuY3VycmVudFVzZXIpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5pZCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gZW50aXR5LnBvc2l0aW9uQnVmZmVyO1xuICAgICAgICAgICAgd2hpbGUgKGJ1ZmZlci5sZW5ndGggPj0gMiAmJiBidWZmZXJbMV0udGltZXN0YW1wIDw9IHJlbmRlclRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgIGJ1ZmZlci5zaGlmdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJ1ZmZlci5sZW5ndGggPj0gMiAmJiBidWZmZXJbMF0udGltZXN0YW1wIDw9IHJlbmRlclRpbWVzdGFtcCAmJiByZW5kZXJUaW1lc3RhbXAgPD0gYnVmZmVyWzFdLnRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgIGVudGl0eS5wb3NpdGlvbi54ID0gdGhpcy5pbnRlcnBvbGF0ZShidWZmZXJbMF0uc2hhcmVhYmxlRGF0YS54LCBidWZmZXJbMV0uc2hhcmVhYmxlRGF0YS54LCBidWZmZXJbMF0udGltZXN0YW1wLCBidWZmZXJbMV0udGltZXN0YW1wLCByZW5kZXJUaW1lc3RhbXApO1xuICAgICAgICAgICAgICAgIGVudGl0eS5wb3NpdGlvbi55ID0gdGhpcy5pbnRlcnBvbGF0ZShidWZmZXJbMF0uc2hhcmVhYmxlRGF0YS55LCBidWZmZXJbMV0uc2hhcmVhYmxlRGF0YS55LCBidWZmZXJbMF0udGltZXN0YW1wLCBidWZmZXJbMV0udGltZXN0YW1wLCByZW5kZXJUaW1lc3RhbXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW50ZXJwb2xhdGUocDAsIHAxLCB0MCwgdDEsIHJlbmRlclRpbWVzdGFtcCkge1xuICAgICAgICBjb25zdCBkZWx0YU1vdmVtZW50ID0gKHAxIC0gcDApO1xuICAgICAgICByZXR1cm4gcDAgKyBkZWx0YU1vdmVtZW50ICogKHJlbmRlclRpbWVzdGFtcCAtIHQwKSAvICh0MSAtIHQwKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBSb29tO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBtYWluXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL21haW5cIikpO1xuY2xhc3MgU2V0dGluZ3NNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wcmVkaWN0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVjb25jaWxpYXRpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbnRlcnBvbGF0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICAgIH1cbiAgICBpbml0RXZlbnRzKCkge1xuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lO1xuICAgICAgICAoX2EgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByZWRpY3Rpb25cIikpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zZXRQcmVkaWN0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICAoX2IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY29uY2lsaWF0aW9uXCIpKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2V0UmVjb25jaWxpYXRpb24uYmluZCh0aGlzKSk7XG4gICAgICAgIChfYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW50ZXJwb2xhdGlvblwiKSkgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNldEludGVycG9sYXRpb24uYmluZCh0aGlzKSk7XG4gICAgICAgIChfZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5pdF9lbnRpdHlcIikpID09PSBudWxsIHx8IF9kID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5pbml0RW50aXR5LmJpbmQodGhpcykpO1xuICAgICAgICAoX2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc3Ryb3lfZW50aXR5XCIpKSA9PT0gbnVsbCB8fCBfZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2UuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZGVzdHJveUVudGl0eS5iaW5kKHRoaXMpKTtcbiAgICAgICAgY29uc3Qgcm9vbUZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb21fZm9ybVwiKTtcbiAgICAgICAgaWYgKHJvb21Gb3JtICE9IG51bGwpXG4gICAgICAgICAgICByb29tRm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHRoaXMuZ29Ub1Jvb20uYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIHNldFByZWRpY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnByZWRpY3Rpb24gPSBlLnRhcmdldC5jaGVja2VkO1xuICAgIH1cbiAgICBzZXRSZWNvbmNpbGlhdGlvbihlKSB7XG4gICAgICAgIHRoaXMucmVjb25jaWxpYXRpb24gPSBlLnRhcmdldC5jaGVja2VkO1xuICAgIH1cbiAgICBzZXRJbnRlcnBvbGF0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5pbnRlcnBvbGF0aW9uID0gZS50YXJnZXQuY2hlY2tlZDtcbiAgICB9XG4gICAgaW5pdEVudGl0eSgpIHtcbiAgICAgICAgbWFpbl8xLmRlZmF1bHQud2ViU29ja2V0TWFuYWdlci5zZW5kTXNnKFwiaW5pdEVudGl0eVwiKTtcbiAgICB9XG4gICAgZGVzdHJveUVudGl0eSgpIHtcbiAgICAgICAgbWFpbl8xLmRlZmF1bHQud2ViU29ja2V0TWFuYWdlci5zZW5kTXNnKFwiZGVzdHJveUVudGl0eVwiKTtcbiAgICB9XG4gICAgZ29Ub1Jvb20oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vbV9pZFwiKTtcbiAgICAgICAgaWYgKHJvb21JZCA9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBtYWluXzEuZGVmYXVsdC53ZWJTb2NrZXRNYW5hZ2VyLnNlbmRNc2coXCJqb2luUm9vbVwiLCByb29tSWQudmFsdWUpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFNldHRpbmdzTWFuYWdlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY2xhc3MgVXNlciB7XG4gICAgY29uc3RydWN0b3IoaWQsIHVzZXJuYW1lKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IHVzZXJuYW1lO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFVzZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IENvbmZpZ18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9Db25maWcvQ29uZmlnXCIpKTtcbmNvbnN0IFJvb21fMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vUm9vbS9Sb29tXCIpKTtcbmNvbnN0IFVzZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vVXNlci9Vc2VyXCIpKTtcbmNvbnN0IG1haW5fMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vbWFpblwiKSk7XG5jbGFzcyBXZWJzb2NrZXRNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy53cyA9IG51bGw7XG4gICAgfVxuICAgIGluaXQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLndzID0gbmV3IFdlYlNvY2tldChgd3M6Ly8ke0NvbmZpZ18xLmRlZmF1bHQuU0VSVkVSX0hPU1R9OiR7Q29uZmlnXzEuZGVmYXVsdC5TRVJWRVJfUE9SVH1gKTtcbiAgICAgICAgICAgIHRoaXMud3Mub25jbG9zZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5jdXJyZW50VXNlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuZ2FtZSA/IG1haW5fMS5kZWZhdWx0LmdhbWUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiIDogbnVsbDtcbiAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dpbkZvcm0gPyBtYWluXzEuZGVmYXVsdC5sb2dpbkZvcm0uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIiA6IG51bGw7XG4gICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQubG9nZ2VyLnNlbmRMb2coXCJFUlJPUlwiLCBcIkNvbm5lY3Rpb24gdG8gc2VydmVyIGxvc3RlZC5cIik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy53cy5vbm9wZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQubG9nZ2VyLnNlbmRMb2coXCJTVUNDRVNTXCIsIFwiQ29ubmVjdGVkIHRvIHNlcnZlci5cIik7XG4gICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQubG9naW5Gb3JtID8gbWFpbl8xLmRlZmF1bHQubG9naW5Gb3JtLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCIgOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMud3Mub25tZXNzYWdlID0gKG1zZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChtc2cgPT0gbnVsbCB8fCBtc2cuZGF0YSA9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UobXNnLmRhdGEudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChtZXNzYWdlLmtleSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwibG9nZ2VkXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmN1cnJlbnRVc2VyID0gbmV3IFVzZXJfMS5kZWZhdWx0KG1lc3NhZ2UudmFsdWUuaWQsIG1lc3NhZ2UudmFsdWUudXNlcm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQubG9naW5Gb3JtID8gbWFpbl8xLmRlZmF1bHQubG9naW5Gb3JtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIiA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5yZXNpemVDYW52YXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmdhbWUgPyBtYWluXzEuZGVmYXVsdC5nYW1lLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCIgOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQubG9nZ2VyLnNlbmRMb2coXCJJTkZPXCIsIGBMb2dnZWQgYXMgWyR7bWFpbl8xLmRlZmF1bHQuY3VycmVudFVzZXIuaWR9XSAke21haW5fMS5kZWZhdWx0LmN1cnJlbnRVc2VyLnVzZXJuYW1lfS5gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEpvaW4gcm9vbSBJRCA1YWI4MVxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Uuc2VuZE1zZyhcImpvaW5Sb29tXCIsIFwiNWFiODFcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiaW5pdFJvb21cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20gPSBuZXcgUm9vbV8xLmRlZmF1bHQobWVzc2FnZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dnZXIuc2VuZExvZyhcIklORk9cIiwgYEluaXRpYWxpemluZyByb29tIFske21haW5fMS5kZWZhdWx0LmN1cnJlbnRSb29tLmlkfV0uYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByb29tSWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb21faWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocm9vbUlkICE9IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUlkLnZhbHVlID0gbWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20uaWQudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmN1cnJlbnRSb29tLmluaXRBbGxQbGF5ZXJzKG1lc3NhZ2UudmFsdWUuY3VycmVudFBsYXllcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBsYXllckpvaW5cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1haW5fMS5kZWZhdWx0LmN1cnJlbnRSb29tID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20uaW5pdFBsYXllcihtZXNzYWdlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwbGF5ZXJMZWZ0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbSA9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmN1cnJlbnRSb29tLnJlbW92ZVBsYXllcihtZXNzYWdlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ3b3JsZFN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbSA9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmN1cnJlbnRSb29tLnVwZGF0ZVdvcmxkU3RhdGUobWVzc2FnZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiaW5pdEVudGl0eVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20gPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbS5pbml0UGxheWVyRW50aXR5KG1lc3NhZ2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImRlc3Ryb3lFbnRpdHlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1haW5fMS5kZWZhdWx0LmN1cnJlbnRSb29tID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20uZGVzdHJveVBsYXllckVudGl0eShtZXNzYWdlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNlbmRNc2coa2V5LCB2YWx1ZSA9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMud3MgPT0gbnVsbCB8fCB0aGlzLndzLnJlYWR5U3RhdGUgIT09IFdlYlNvY2tldC5PUEVOKVxuICAgICAgICAgICAgcmV0dXJuIG1haW5fMS5kZWZhdWx0LmxvZ2dlci5zZW5kTG9nKFwiRVJST1JcIiwgXCJJbXBvc3NpYmxlIHRvIHNlbmQgbWVzc2FnZSB0byBzZXJ2ZXIsIHdlYnNvY2tldHMgYXJlIGRpc2Nvbm5lY3QuXCIpO1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoeyBrZXk6IGtleSwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICB0aGlzLndzLnNlbmQobWVzc2FnZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gV2Vic29ja2V0TWFuYWdlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBMb2dnZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vc2hhcmVkL0xvZ2dlci9Mb2dnZXJcIikpO1xuY29uc3QgS2V5TWFuYWdlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL0tleS9LZXlNYW5hZ2VyXCIpKTtcbmNvbnN0IFNldHRpbmdzTWFuYWdlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL1NldHRpbmdzL1NldHRpbmdzTWFuYWdlclwiKSk7XG5jb25zdCBXZWJTb2NrZXRzTWFuYWdlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL1dlYlNvY2tldHMvV2ViU29ja2V0c01hbmFnZXJcIikpO1xubGV0IEFwcGxpY2F0aW9uO1xuY2xhc3MgQXBwIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBuZXcgTG9nZ2VyXzEuZGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmtleU1hbmFnZXIgPSBuZXcgS2V5TWFuYWdlcl8xLmRlZmF1bHQoKTtcbiAgICAgICAgdGhpcy53ZWJTb2NrZXRNYW5hZ2VyID0gbmV3IFdlYlNvY2tldHNNYW5hZ2VyXzEuZGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnNldHRpbmdzTWFuYWdlciA9IG5ldyBTZXR0aW5nc01hbmFnZXJfMS5kZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuY3VycmVudFVzZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmN1cnJlbnRSb29tID0gbnVsbDtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVDYW52YXNcIik7XG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICB0aGlzLmdhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVcIik7XG4gICAgICAgIHRoaXMubG9naW5Gb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dpblwiKTtcbiAgICB9XG4gICAgaW5pdCgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICAgICAgICAgICAgeWllbGQgdGhpcy53ZWJTb2NrZXRNYW5hZ2VyLmluaXQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGluaXRFdmVudHMoKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMucmVzaXplQ2FudmFzLmJpbmQodGhpcykpO1xuICAgICAgICBpZiAodGhpcy5sb2dpbkZvcm0gIT0gbnVsbClcbiAgICAgICAgICAgIHRoaXMubG9naW5Gb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgdGhpcy50cnlMb2dpbi5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgcmVzaXplQ2FudmFzKCkge1xuICAgICAgICBpZiAodGhpcy5jYW52YXMgPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIH1cbiAgICB0cnlMb2dpbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFVzZXIgIT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgdXNlcm5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ2luX3VzZXJuYW1lXCIpO1xuICAgICAgICBpZiAodXNlcm5hbWUgPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy53ZWJTb2NrZXRNYW5hZ2VyLnNlbmRNc2coXCJsb2dpblwiLCB1c2VybmFtZS52YWx1ZSk7XG4gICAgfVxufVxuQXBwbGljYXRpb24gPSBuZXcgQXBwKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBBcHBsaWNhdGlvbjtcbkFwcGxpY2F0aW9uLmluaXQoKS5jYXRjaCgoZSkgPT4gQXBwbGljYXRpb24ubG9nZ2VyLnNlbmRDcml0aWNhbEVycm9yKGUudG9TdHJpbmcoKSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNvbW1hbmQgPSB2b2lkIDA7XG52YXIgQ29tbWFuZDtcbihmdW5jdGlvbiAoQ29tbWFuZCkge1xuICAgIENvbW1hbmRbQ29tbWFuZFtcIlVwXCJdID0gMF0gPSBcIlVwXCI7XG4gICAgQ29tbWFuZFtDb21tYW5kW1wiRG93blwiXSA9IDFdID0gXCJEb3duXCI7XG4gICAgQ29tbWFuZFtDb21tYW5kW1wiTGVmdFwiXSA9IDJdID0gXCJMZWZ0XCI7XG4gICAgQ29tbWFuZFtDb21tYW5kW1wiUmlnaHRcIl0gPSAzXSA9IFwiUmlnaHRcIjtcbn0pKENvbW1hbmQgfHwgKGV4cG9ydHMuQ29tbWFuZCA9IENvbW1hbmQgPSB7fSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBDb21tYW5kXzEgPSByZXF1aXJlKFwiLi4vQ29tbWFuZC9Db21tYW5kXCIpO1xuY2xhc3MgRW50aXR5IHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICAgIHRoaXMud2lkdGggPSBkYXRhLndpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGRhdGEuaGVpZ2h0O1xuICAgICAgICB0aGlzLmNvbG9yID0gZGF0YS5jb2xvcjtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGRhdGEucG9zaXRpb247XG4gICAgICAgIHRoaXMucG9zaXRpb25CdWZmZXIgPSBbXTtcbiAgICB9XG4gICAgZHJhdyhjdHgsIHVzZXJuYW1lKSB7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xuICAgICAgICBjdHguZmlsbFJlY3QodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY3R4LmZvbnQgPSBcIjEycHggc2VyaWZcIjtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcbiAgICAgICAgY3R4LmZpbGxUZXh0KHVzZXJuYW1lLCB0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSAtIDEwKTtcbiAgICB9XG4gICAgYXBwbHlJbnB1dChpbnB1dCkge1xuICAgICAgICBjb25zdCBzcGVlZCA9IDEwMDtcbiAgICAgICAgaWYgKGlucHV0LmNvbW1hbmRzLmluY2x1ZGVzKENvbW1hbmRfMS5Db21tYW5kLlJpZ2h0KSlcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCArPSBpbnB1dC5wcmVzc2VkVGltZSAqIHNwZWVkO1xuICAgICAgICBpZiAoaW5wdXQuY29tbWFuZHMuaW5jbHVkZXMoQ29tbWFuZF8xLkNvbW1hbmQuTGVmdCkpXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggKz0gaW5wdXQucHJlc3NlZFRpbWUgKiAtc3BlZWQ7XG4gICAgICAgIGlmIChpbnB1dC5jb21tYW5kcy5pbmNsdWRlcyhDb21tYW5kXzEuQ29tbWFuZC5VcCkpXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgKz0gaW5wdXQucHJlc3NlZFRpbWUgKiAtc3BlZWQ7XG4gICAgICAgIGlmIChpbnB1dC5jb21tYW5kcy5pbmNsdWRlcyhDb21tYW5kXzEuQ29tbWFuZC5Eb3duKSlcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSArPSBpbnB1dC5wcmVzc2VkVGltZSAqIHNwZWVkO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IEVudGl0eTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5JbnB1dE1lc3NhZ2UgPSB2b2lkIDA7XG5jbGFzcyBJbnB1dE1lc3NhZ2Uge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kcyA9IGRhdGEuY29tbWFuZHM7XG4gICAgICAgIHRoaXMucGxheWVySWQgPSBkYXRhLnBsYXllcklkO1xuICAgICAgICB0aGlzLnByZXNzZWRUaW1lID0gZGF0YS5wcmVzc2VkVGltZTtcbiAgICAgICAgdGhpcy5pbnB1dFNlcXVlbmNlTnVtYmVyID0gZGF0YS5pbnB1dFNlcXVlbmNlTnVtYmVyO1xuICAgIH1cbn1cbmV4cG9ydHMuSW5wdXRNZXNzYWdlID0gSW5wdXRNZXNzYWdlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBMb2dMZXZlbCA9IHtcbiAgICBJTkZPOiB7XG4gICAgICAgIGxldmVsOiAwLFxuICAgICAgICBuYW1lOiBcIklORk9cIixcbiAgICAgICAgYmdDb2xvcjogXCJcXHgxYls0NG1cIixcbiAgICAgICAgYmdXZWJDb2xvcjogXCIjMTk2ODlCXCJcbiAgICB9LFxuICAgIFdBUk5JTkc6IHtcbiAgICAgICAgbGV2ZWw6IDAsXG4gICAgICAgIG5hbWU6IFwiV0FSTklOR1wiLFxuICAgICAgICBiZ0NvbG9yOiBcIlxceDFiWzQzbVwiLFxuICAgICAgICBiZ1dlYkNvbG9yOiBcIiNDRjdFMEZcIlxuICAgIH0sXG4gICAgRVJST1I6IHtcbiAgICAgICAgbGV2ZWw6IDAsXG4gICAgICAgIG5hbWU6IFwiRVJST1JcIixcbiAgICAgICAgYmdDb2xvcjogXCJcXHgxYls0MW1cIixcbiAgICAgICAgYmdXZWJDb2xvcjogXCIjQUYxQjFCXCJcbiAgICB9LFxuICAgIENSSVRJQ0FMX0VSUk9SOiB7XG4gICAgICAgIGxldmVsOiAwLFxuICAgICAgICBuYW1lOiBcIkNSSVRJQ0FMIEVSUk9SXCIsXG4gICAgICAgIGJnQ29sb3I6IFwiXFx4MWJbNDFtXCIsXG4gICAgICAgIGJnV2ViQ29sb3I6IFwiI0FGMUIxQlwiXG4gICAgfSxcbiAgICBTVUNDRVNTOiB7XG4gICAgICAgIGxldmVsOiAwLFxuICAgICAgICBuYW1lOiBcIlNVQ0NFU1NcIixcbiAgICAgICAgYmdDb2xvcjogXCJcXHgxYls0Mm1cIixcbiAgICAgICAgYmdXZWJDb2xvcjogXCIjMTY3QzQzXCJcbiAgICB9LFxuICAgIERFQlVHOiB7XG4gICAgICAgIGxldmVsOiAxLFxuICAgICAgICBuYW1lOiBcIkRFQlVHXCIsXG4gICAgICAgIGJnQ29sb3I6IFwiXFx4MWJbNDZtXCIsXG4gICAgICAgIGJnV2ViQ29sb3I6IFwiIzk1MUQ4QVwiXG4gICAgfSxcbiAgICBWRVJCT1NFOiB7XG4gICAgICAgIGxldmVsOiAyLFxuICAgICAgICBuYW1lOiBcIlZFUkJPU0VcIixcbiAgICAgICAgYmdDb2xvcjogXCJcXHgxYls0NW1cIixcbiAgICAgICAgYmdXZWJDb2xvcjogXCIjOTE4RDEyXCJcbiAgICB9XG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gTG9nTGV2ZWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IExvZ0xldmVsXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vTG9nTGV2ZWxcIikpO1xuY2xhc3MgTG9nZ2VyIHtcbiAgICBzZW5kTG9nKGxvZ0tleSwgbWVzc2FnZSkge1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhMb2dMZXZlbF8xLmRlZmF1bHRbbG9nS2V5XS5iZ0NvbG9yLCBMb2dMZXZlbF8xLmRlZmF1bHRbbG9nS2V5XS5uYW1lLCBcIlxceDFiWzBtXCIsIG1lc3NhZ2UpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJWMgJHtMb2dMZXZlbF8xLmRlZmF1bHRbbG9nS2V5XS5uYW1lfSAlYyAke21lc3NhZ2V9YCwgYGJhY2tncm91bmQtY29sb3I6ICR7TG9nTGV2ZWxfMS5kZWZhdWx0W2xvZ0tleV0uYmdXZWJDb2xvcn07IGNvbG9yOiAjRkZGOyBmb250LXdlaWdodDogYm9sZGAsIGBiYWNrZ3JvdW5kLWNvbG9yOiBpbmhlcml0OyBjb2xvcjogaW5oZXJpdGApO1xuICAgIH1cbiAgICBzZW5kQ3JpdGljYWxFcnJvcihtZXNzYWdlKSB7XG4gICAgICAgIHRoaXMuc2VuZExvZyhcIkNSSVRJQ0FMX0VSUk9SXCIsIG1lc3NhZ2UpO1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQ7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gTG9nZ2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBTaGFyZWFibGVEYXRhIHtcbiAgICBjb25zdHJ1Y3Rvcih0cywgcCkge1xuICAgICAgICB0aGlzLnRpbWVzdGFtcCA9IHRzO1xuICAgICAgICB0aGlzLnNoYXJlYWJsZURhdGEgPSBwO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFNoYXJlYWJsZURhdGE7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIFZlY3RvcjIge1xuICAgIGNvbnN0cnVjdG9yKHgsIHkpIHtcbiAgICAgICAgdGhpcy54ID0geCxcbiAgICAgICAgICAgIHRoaXMueSA9IHk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gVmVjdG9yMjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL2NsaWVudC9tYWluLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9