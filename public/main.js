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
            activePlayer.entity.applyInput(inputs, main_1.default.settingsManager.cheat ? 200 : 100);
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
        this.cheat = false;
        this.initEvents();
    }
    initEvents() {
        var _a, _b, _c, _d, _e, _f;
        (_a = document.getElementById("prediction")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.setPrediction.bind(this));
        (_b = document.getElementById("reconciliation")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", this.setReconciliation.bind(this));
        (_c = document.getElementById("interpolation")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", this.setInterpolation.bind(this));
        (_d = document.getElementById("cheat")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", this.setCheat.bind(this));
        (_e = document.getElementById("init_entity")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", this.initEntity.bind(this));
        (_f = document.getElementById("destroy_entity")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", this.destroyEntity.bind(this));
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
    setCheat(e) {
        this.cheat = e.target.checked;
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
    applyInput(input, speed = 100) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFFLGFBQWEsRUFBQztBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBZTs7Ozs7Ozs7Ozs7QUNSRjtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBZTs7Ozs7OztVQ1JmO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9jbGllbnQvQ29uZmlnL0NvbmZpZy50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9jbGllbnQvS2V5L0tleU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vY2xpZW50L1BsYXllci9QbGF5ZXIudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vY2xpZW50L1Jvb20vUm9vbS50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9jbGllbnQvU2V0dGluZ3MvU2V0dGluZ3NNYW5hZ2VyLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL2NsaWVudC9Vc2VyL1VzZXIudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vY2xpZW50L1dlYlNvY2tldHMvV2ViU29ja2V0c01hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vY2xpZW50L21haW4udHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vc2hhcmVkL0NvbW1hbmQvQ29tbWFuZC50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9zaGFyZWQvRW50aXR5L0VudGl0eS50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9zaGFyZWQvSW5wdXRNZXNzYWdlL0lucHV0TWVzc2FnZS50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vLi9zaGFyZWQvTG9nZ2VyL0xvZ0xldmVsLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL3NoYXJlZC9Mb2dnZXIvTG9nZ2VyLnRzIiwid2VicGFjazovL3ByZWRpY3Rpb24tcmVjb25jaWxpYXRpb24taW50ZXJwb2xhdGlvbi8uL3NoYXJlZC9TaGFyZWFibGVEYXRhL1NoYXJlYWJsZURhdGEudHMiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uLy4vc2hhcmVkL1ZlY3RvcjIvVmVjdG9yMi50cyIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vcHJlZGljdGlvbi1yZWNvbmNpbGlhdGlvbi1pbnRlcnBvbGF0aW9uL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9wcmVkaWN0aW9uLXJlY29uY2lsaWF0aW9uLWludGVycG9sYXRpb24vd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICAgIFNFUlZFUl9IT1NUOiBcIjEyNy4wLjAuMVwiLFxuICAgIFNFUlZFUl9QT1JUOiA4MDkwLFxuICAgIFNFUlZFUl9VUERBVEVfSU5URVJWQUw6IDEwXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBLZXlNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy51cCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRvd24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sZWZ0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gICAgfVxuICAgIGluaXRFdmVudHMoKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgdGhpcy5rZXlVcC5iaW5kKHRoaXMpKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMua2V5RG93bi5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAga2V5VXAoZSkge1xuICAgICAgICBzd2l0Y2ggKGUuY29kZSkge1xuICAgICAgICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgICAgICAgICB0aGlzLnVwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiQXJyb3dEb3duXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5kb3duID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiQXJyb3dMZWZ0XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5sZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiQXJyb3dSaWdodFwiOlxuICAgICAgICAgICAgICAgIHRoaXMucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBrZXlEb3duKGUpIHtcbiAgICAgICAgc3dpdGNoIChlLmNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgICAgICAgICAgdGhpcy51cCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiQXJyb3dEb3duXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJBcnJvd0xlZnRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkFycm93UmlnaHRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRJbnB1dHMoKSB7XG4gICAgICAgIHJldHVybiB7IHVwOiB0aGlzLnVwLCBkb3duOiB0aGlzLmRvd24sIGxlZnQ6IHRoaXMubGVmdCwgcmlnaHQ6IHRoaXMucmlnaHQgfTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBLZXlNYW5hZ2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBQbGF5ZXIge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgICAgdGhpcy5pZCA9IGRhdGEuaWQ7XG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSBkYXRhLnVzZXJuYW1lO1xuICAgICAgICB0aGlzLmVudGl0eSA9IGRhdGEuZW50aXR5O1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFBsYXllcjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgQ29tbWFuZF8xID0gcmVxdWlyZShcIi4uLy4uL3NoYXJlZC9Db21tYW5kL0NvbW1hbmRcIik7XG5jb25zdCBFbnRpdHlfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vLi4vc2hhcmVkL0VudGl0eS9FbnRpdHlcIikpO1xuY29uc3QgSW5wdXRNZXNzYWdlXzEgPSByZXF1aXJlKFwiLi4vLi4vc2hhcmVkL0lucHV0TWVzc2FnZS9JbnB1dE1lc3NhZ2VcIik7XG5jb25zdCBTaGFyZWFibGVEYXRhXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uLy4uL3NoYXJlZC9TaGFyZWFibGVEYXRhL1NoYXJlYWJsZURhdGFcIikpO1xuY29uc3QgVmVjdG9yMl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi8uLi9zaGFyZWQvVmVjdG9yMi9WZWN0b3IyXCIpKTtcbmNvbnN0IENvbmZpZ18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9Db25maWcvQ29uZmlnXCIpKTtcbmNvbnN0IFBsYXllcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9QbGF5ZXIvUGxheWVyXCIpKTtcbmNvbnN0IG1haW5fMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vbWFpblwiKSk7XG5jbGFzcyBSb29tIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICAgIHRoaXMuaWQgPSBkYXRhLmlkO1xuICAgICAgICB0aGlzLmN1cnJlbnRQbGF5ZXJzID0gW107XG4gICAgICAgIHRoaXMud29ybGRTdGF0ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5sYXN0VHMgPSAwO1xuICAgICAgICB0aGlzLmlucHV0U2VxdWVuY2VOdW1iZXIgPSAwO1xuICAgICAgICB0aGlzLnBlbmRpbmdJbnB1dHMgPSBbXTtcbiAgICB9XG4gICAgaW5pdEFsbFBsYXllcnMocGxheWVyc0xpc3QpIHtcbiAgICAgICAgcGxheWVyc0xpc3QuZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmluaXRQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGluaXRQbGF5ZXIocGxheWVyKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQbGF5ZXJzLmZpbHRlcigocGxheWVyRGF0YSkgPT4gcGxheWVyRGF0YS5pZCA9PSBwbGF5ZXIuaWQpWzBdICE9IG51bGwpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHBsYXllckRhdGEgPSBuZXcgUGxheWVyXzEuZGVmYXVsdCh7XG4gICAgICAgICAgICBpZDogcGxheWVyLmlkLFxuICAgICAgICAgICAgdXNlcm5hbWU6IHBsYXllci51c2VybmFtZSxcbiAgICAgICAgICAgIGVudGl0eTogbmV3IEVudGl0eV8xLmRlZmF1bHQoe1xuICAgICAgICAgICAgICAgIHdpZHRoOiBwbGF5ZXIuZW50aXR5LndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogcGxheWVyLmVudGl0eS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgY29sb3I6IHBsYXllci5lbnRpdHkuY29sb3IsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyXzEuZGVmYXVsdChwbGF5ZXIuZW50aXR5LnBvc2l0aW9uLngsIHBsYXllci5lbnRpdHkucG9zaXRpb24ueSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmN1cnJlbnRQbGF5ZXJzLnB1c2gocGxheWVyRGF0YSk7XG4gICAgICAgIG1haW5fMS5kZWZhdWx0LmxvZ2dlci5zZW5kTG9nKFwiVkVSQk9TRVwiLCBgUGxheWVyICR7cGxheWVyLnVzZXJuYW1lfSBpbml0aWFsaXplZC5gKTtcbiAgICB9XG4gICAgcmVtb3ZlUGxheWVyKHBsYXllcklkKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFBsYXllcnMuZm9yRWFjaChmdW5jdGlvbiAocGxheWVyLCBpbmRleCwgb2JqZWN0KSB7XG4gICAgICAgICAgICBpZiAocGxheWVyLmlkID09IHBsYXllcklkKSB7XG4gICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQubG9nZ2VyLnNlbmRMb2coXCJWRVJCT1NFXCIsIGBQbGF5ZXIgJHtwbGF5ZXIudXNlcm5hbWV9IGxlZnQgdGhlIHJvb20uYCk7XG4gICAgICAgICAgICAgICAgb2JqZWN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbml0UGxheWVyRW50aXR5KHBsYXllckRhdGEpIHtcbiAgICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5nZXRQbGF5ZXJCeUlkKHBsYXllckRhdGEuaWQpO1xuICAgICAgICBpZiAocGxheWVyID09IG51bGwpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHBsYXllci5lbnRpdHkgPSBuZXcgRW50aXR5XzEuZGVmYXVsdCh7XG4gICAgICAgICAgICB3aWR0aDogcGxheWVyRGF0YS5lbnRpdHkud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHBsYXllckRhdGEuZW50aXR5LmhlaWdodCxcbiAgICAgICAgICAgIGNvbG9yOiBwbGF5ZXJEYXRhLmVudGl0eS5jb2xvcixcbiAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMl8xLmRlZmF1bHQocGxheWVyRGF0YS5lbnRpdHkucG9zaXRpb24ueCwgcGxheWVyRGF0YS5lbnRpdHkucG9zaXRpb24ueSlcbiAgICAgICAgfSk7XG4gICAgICAgIG1haW5fMS5kZWZhdWx0LmxvZ2dlci5zZW5kTG9nKFwiVkVSQk9TRVwiLCBgRW50aXR5IG9mIFske3BsYXllci51c2VybmFtZX1dIGluaXRpYWxpemVkLmApO1xuICAgIH1cbiAgICBkZXN0cm95UGxheWVyRW50aXR5KHBsYXllcklkKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5nZXRQbGF5ZXJCeUlkKHBsYXllcklkKTtcbiAgICAgICAgaWYgKHBsYXllciA9PSBudWxsIHx8IHBsYXllci5lbnRpdHkgPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgcGxheWVyLmVudGl0eSA9IG51bGw7XG4gICAgICAgIHBsYXllci5pZCA9PSAoKF9hID0gbWFpbl8xLmRlZmF1bHQuY3VycmVudFVzZXIpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5pZCkgPyB0aGlzLnBlbmRpbmdJbnB1dHMgPSBbXSA6IG51bGw7XG4gICAgICAgIG1haW5fMS5kZWZhdWx0LmxvZ2dlci5zZW5kTG9nKFwiVkVSQk9TRVwiLCBgRW50aXR5IG9mIFske3BsYXllci51c2VybmFtZX1dIGRlc3Ryb3llZC5gKTtcbiAgICB9XG4gICAgdXBkYXRlV29ybGRTdGF0ZShwbGF5ZXJzRGF0YSkge1xuICAgICAgICBwbGF5ZXJzRGF0YS5mb3JFYWNoKChwbGF5ZXJEYXRhKSA9PiB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLmdldFBsYXllckJ5SWQocGxheWVyRGF0YS5pZCk7XG4gICAgICAgICAgICBpZiAocGxheWVyID09IG51bGwgfHwgcGxheWVyLmVudGl0eSA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaWQgPT0gKChfYSA9IG1haW5fMS5kZWZhdWx0LmN1cnJlbnRVc2VyKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuaWQpKSB7XG4gICAgICAgICAgICAgICAgcGxheWVyLmVudGl0eS5wb3NpdGlvbiA9IG5ldyBWZWN0b3IyXzEuZGVmYXVsdChwbGF5ZXJEYXRhLmVudGl0eS5wb3NpdGlvbi54LCBwbGF5ZXJEYXRhLmVudGl0eS5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgICAgICBpZiAobWFpbl8xLmRlZmF1bHQuc2V0dGluZ3NNYW5hZ2VyLnJlY29uY2lsaWF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBqID0gMDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGogPCB0aGlzLnBlbmRpbmdJbnB1dHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnB1dCA9IHRoaXMucGVuZGluZ0lucHV0c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dC5pbnB1dFNlcXVlbmNlTnVtYmVyIDw9IHBsYXllckRhdGEubGFzdFByb2Nlc3NlZElucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nSW5wdXRzLnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci5lbnRpdHkuYXBwbHlJbnB1dChpbnB1dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaisrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlbmRpbmdJbnB1dHMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIW1haW5fMS5kZWZhdWx0LnNldHRpbmdzTWFuYWdlci5pbnRlcnBvbGF0aW9uKVxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuZW50aXR5LnBvc2l0aW9uID0gbmV3IFZlY3RvcjJfMS5kZWZhdWx0KHBsYXllckRhdGEuZW50aXR5LnBvc2l0aW9uLngsIHBsYXllckRhdGEuZW50aXR5LnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmVudGl0eS5wb3NpdGlvbkJ1ZmZlci5wdXNoKG5ldyBTaGFyZWFibGVEYXRhXzEuZGVmYXVsdCh0aW1lc3RhbXAsIG5ldyBWZWN0b3IyXzEuZGVmYXVsdChwbGF5ZXJEYXRhLmVudGl0eS5wb3NpdGlvbi54LCBwbGF5ZXJEYXRhLmVudGl0eS5wb3NpdGlvbi55KSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldFBsYXllckJ5SWQocGxheWVySWQpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmN1cnJlbnRQbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLmN1cnJlbnRQbGF5ZXJzW2ldO1xuICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PSBwbGF5ZXJJZClcbiAgICAgICAgICAgICAgICByZXR1cm4gcGxheWVyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIGlmIChtYWluXzEuZGVmYXVsdC5jdHggPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBtYWluXzEuZGVmYXVsdC5sb2dnZXIuc2VuZExvZyhcIkVSUk9SXCIsIGBJbXBvc3NpYmxlIHRvIGdldCBjYW52YXMgY29udGV4dC5gKTtcbiAgICAgICAgbWFpbl8xLmRlZmF1bHQuY3R4LmNsZWFyUmVjdCgwLCAwLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICAgICAgdGhpcy5wcm9jZXNzSW5wdXRzKCk7XG4gICAgICAgIGlmIChtYWluXzEuZGVmYXVsdC5zZXR0aW5nc01hbmFnZXIuaW50ZXJwb2xhdGlvbilcbiAgICAgICAgICAgIHRoaXMuaW50ZXJwb2xhdGVFbnRpdGllcygpO1xuICAgICAgICB0aGlzLmN1cnJlbnRQbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKHBsYXllci5lbnRpdHkgPT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBwbGF5ZXIuZW50aXR5LmRyYXcobWFpbl8xLmRlZmF1bHQuY3R4LCBwbGF5ZXIudXNlcm5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJvY2Vzc0lucHV0cygpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBjb25zdCBhY3RpdmVQbGF5ZXIgPSB0aGlzLmdldFBsYXllckJ5SWQoKF9hID0gbWFpbl8xLmRlZmF1bHQuY3VycmVudFVzZXIpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5pZCk7XG4gICAgICAgIGlmIChhY3RpdmVQbGF5ZXIgPT0gbnVsbCB8fCBhY3RpdmVQbGF5ZXIuZW50aXR5ID09IG51bGwpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IG5vd1RzID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIGNvbnN0IGxhc3RUcyA9IHRoaXMubGFzdFRzIHx8IG5vd1RzO1xuICAgICAgICBjb25zdCBkdFNlYyA9IChub3dUcyAtIGxhc3RUcykgLyAxMDAwLjA7XG4gICAgICAgIHRoaXMubGFzdFRzID0gbm93VHM7XG4gICAgICAgIGNvbnN0IGNvbW1hbmRzID0gW107XG4gICAgICAgIGlmIChtYWluXzEuZGVmYXVsdC5rZXlNYW5hZ2VyLnJpZ2h0KVxuICAgICAgICAgICAgY29tbWFuZHMucHVzaChDb21tYW5kXzEuQ29tbWFuZC5SaWdodCk7XG4gICAgICAgIGVsc2UgaWYgKG1haW5fMS5kZWZhdWx0LmtleU1hbmFnZXIubGVmdClcbiAgICAgICAgICAgIGNvbW1hbmRzLnB1c2goQ29tbWFuZF8xLkNvbW1hbmQuTGVmdCk7XG4gICAgICAgIGlmIChtYWluXzEuZGVmYXVsdC5rZXlNYW5hZ2VyLnVwKVxuICAgICAgICAgICAgY29tbWFuZHMucHVzaChDb21tYW5kXzEuQ29tbWFuZC5VcCk7XG4gICAgICAgIGVsc2UgaWYgKG1haW5fMS5kZWZhdWx0LmtleU1hbmFnZXIuZG93bilcbiAgICAgICAgICAgIGNvbW1hbmRzLnB1c2goQ29tbWFuZF8xLkNvbW1hbmQuRG93bik7XG4gICAgICAgIGlmIChjb21tYW5kcy5sZW5ndGggPT0gMClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5pbnB1dFNlcXVlbmNlTnVtYmVyKys7XG4gICAgICAgIGNvbnN0IGlucHV0cyA9IG5ldyBJbnB1dE1lc3NhZ2VfMS5JbnB1dE1lc3NhZ2Uoe1xuICAgICAgICAgICAgY29tbWFuZHM6IGNvbW1hbmRzLFxuICAgICAgICAgICAgcGxheWVySWQ6IGFjdGl2ZVBsYXllci5pZCxcbiAgICAgICAgICAgIHByZXNzZWRUaW1lOiBkdFNlYyxcbiAgICAgICAgICAgIGlucHV0U2VxdWVuY2VOdW1iZXI6IHRoaXMuaW5wdXRTZXF1ZW5jZU51bWJlclxuICAgICAgICB9KTtcbiAgICAgICAgbWFpbl8xLmRlZmF1bHQud2ViU29ja2V0TWFuYWdlci5zZW5kTXNnKFwiaW5wdXRzRGF0YVwiLCBpbnB1dHMpO1xuICAgICAgICBpZiAobWFpbl8xLmRlZmF1bHQuc2V0dGluZ3NNYW5hZ2VyLnByZWRpY3Rpb24pXG4gICAgICAgICAgICBhY3RpdmVQbGF5ZXIuZW50aXR5LmFwcGx5SW5wdXQoaW5wdXRzLCBtYWluXzEuZGVmYXVsdC5zZXR0aW5nc01hbmFnZXIuY2hlYXQgPyAyMDAgOiAxMDApO1xuICAgICAgICB0aGlzLnBlbmRpbmdJbnB1dHMucHVzaChpbnB1dHMpO1xuICAgIH1cbiAgICBpbnRlcnBvbGF0ZUVudGl0aWVzKCkge1xuICAgICAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgY29uc3QgcmVuZGVyVGltZXN0YW1wID0gbm93IC0gKDEwMDAuMCAvIENvbmZpZ18xLmRlZmF1bHQuU0VSVkVSX1VQREFURV9JTlRFUlZBTCk7XG4gICAgICAgIHRoaXMuY3VycmVudFBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICBjb25zdCBlbnRpdHkgPSBwbGF5ZXIuZW50aXR5O1xuICAgICAgICAgICAgaWYgKGVudGl0eSA9PSBudWxsIHx8IHBsYXllci5pZCA9PSAoKF9hID0gbWFpbl8xLmRlZmF1bHQuY3VycmVudFVzZXIpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5pZCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gZW50aXR5LnBvc2l0aW9uQnVmZmVyO1xuICAgICAgICAgICAgd2hpbGUgKGJ1ZmZlci5sZW5ndGggPj0gMiAmJiBidWZmZXJbMV0udGltZXN0YW1wIDw9IHJlbmRlclRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgIGJ1ZmZlci5zaGlmdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJ1ZmZlci5sZW5ndGggPj0gMiAmJiBidWZmZXJbMF0udGltZXN0YW1wIDw9IHJlbmRlclRpbWVzdGFtcCAmJiByZW5kZXJUaW1lc3RhbXAgPD0gYnVmZmVyWzFdLnRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgIGVudGl0eS5wb3NpdGlvbi54ID0gdGhpcy5pbnRlcnBvbGF0ZShidWZmZXJbMF0uc2hhcmVhYmxlRGF0YS54LCBidWZmZXJbMV0uc2hhcmVhYmxlRGF0YS54LCBidWZmZXJbMF0udGltZXN0YW1wLCBidWZmZXJbMV0udGltZXN0YW1wLCByZW5kZXJUaW1lc3RhbXApO1xuICAgICAgICAgICAgICAgIGVudGl0eS5wb3NpdGlvbi55ID0gdGhpcy5pbnRlcnBvbGF0ZShidWZmZXJbMF0uc2hhcmVhYmxlRGF0YS55LCBidWZmZXJbMV0uc2hhcmVhYmxlRGF0YS55LCBidWZmZXJbMF0udGltZXN0YW1wLCBidWZmZXJbMV0udGltZXN0YW1wLCByZW5kZXJUaW1lc3RhbXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW50ZXJwb2xhdGUocDAsIHAxLCB0MCwgdDEsIHJlbmRlclRpbWVzdGFtcCkge1xuICAgICAgICBjb25zdCBkZWx0YU1vdmVtZW50ID0gKHAxIC0gcDApO1xuICAgICAgICByZXR1cm4gcDAgKyBkZWx0YU1vdmVtZW50ICogKHJlbmRlclRpbWVzdGFtcCAtIHQwKSAvICh0MSAtIHQwKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBSb29tO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBtYWluXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL21haW5cIikpO1xuY2xhc3MgU2V0dGluZ3NNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wcmVkaWN0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVjb25jaWxpYXRpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbnRlcnBvbGF0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2hlYXQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gICAgfVxuICAgIGluaXRFdmVudHMoKSB7XG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2UsIF9mO1xuICAgICAgICAoX2EgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByZWRpY3Rpb25cIikpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zZXRQcmVkaWN0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICAoX2IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY29uY2lsaWF0aW9uXCIpKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2V0UmVjb25jaWxpYXRpb24uYmluZCh0aGlzKSk7XG4gICAgICAgIChfYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW50ZXJwb2xhdGlvblwiKSkgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNldEludGVycG9sYXRpb24uYmluZCh0aGlzKSk7XG4gICAgICAgIChfZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hlYXRcIikpID09PSBudWxsIHx8IF9kID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zZXRDaGVhdC5iaW5kKHRoaXMpKTtcbiAgICAgICAgKF9lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbml0X2VudGl0eVwiKSkgPT09IG51bGwgfHwgX2UgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9lLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmluaXRFbnRpdHkuYmluZCh0aGlzKSk7XG4gICAgICAgIChfZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzdHJveV9lbnRpdHlcIikpID09PSBudWxsIHx8IF9mID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZXN0cm95RW50aXR5LmJpbmQodGhpcykpO1xuICAgICAgICBjb25zdCByb29tRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vbV9mb3JtXCIpO1xuICAgICAgICBpZiAocm9vbUZvcm0gIT0gbnVsbClcbiAgICAgICAgICAgIHJvb21Gb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgdGhpcy5nb1RvUm9vbS5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgc2V0UHJlZGljdGlvbihlKSB7XG4gICAgICAgIHRoaXMucHJlZGljdGlvbiA9IGUudGFyZ2V0LmNoZWNrZWQ7XG4gICAgfVxuICAgIHNldFJlY29uY2lsaWF0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5yZWNvbmNpbGlhdGlvbiA9IGUudGFyZ2V0LmNoZWNrZWQ7XG4gICAgfVxuICAgIHNldEludGVycG9sYXRpb24oZSkge1xuICAgICAgICB0aGlzLmludGVycG9sYXRpb24gPSBlLnRhcmdldC5jaGVja2VkO1xuICAgIH1cbiAgICBzZXRDaGVhdChlKSB7XG4gICAgICAgIHRoaXMuY2hlYXQgPSBlLnRhcmdldC5jaGVja2VkO1xuICAgIH1cbiAgICBpbml0RW50aXR5KCkge1xuICAgICAgICBtYWluXzEuZGVmYXVsdC53ZWJTb2NrZXRNYW5hZ2VyLnNlbmRNc2coXCJpbml0RW50aXR5XCIpO1xuICAgIH1cbiAgICBkZXN0cm95RW50aXR5KCkge1xuICAgICAgICBtYWluXzEuZGVmYXVsdC53ZWJTb2NrZXRNYW5hZ2VyLnNlbmRNc2coXCJkZXN0cm95RW50aXR5XCIpO1xuICAgIH1cbiAgICBnb1RvUm9vbShlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb29tX2lkXCIpO1xuICAgICAgICBpZiAocm9vbUlkID09IG51bGwpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIG1haW5fMS5kZWZhdWx0LndlYlNvY2tldE1hbmFnZXIuc2VuZE1zZyhcImpvaW5Sb29tXCIsIHJvb21JZC52YWx1ZSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gU2V0dGluZ3NNYW5hZ2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBVc2VyIHtcbiAgICBjb25zdHJ1Y3RvcihpZCwgdXNlcm5hbWUpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLnVzZXJuYW1lID0gdXNlcm5hbWU7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gVXNlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgQ29uZmlnXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL0NvbmZpZy9Db25maWdcIikpO1xuY29uc3QgUm9vbV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9Sb29tL1Jvb21cIikpO1xuY29uc3QgVXNlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9Vc2VyL1VzZXJcIikpO1xuY29uc3QgbWFpbl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9tYWluXCIpKTtcbmNsYXNzIFdlYnNvY2tldE1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLndzID0gbnVsbDtcbiAgICB9XG4gICAgaW5pdCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMud3MgPSBuZXcgV2ViU29ja2V0KGB3czovLyR7Q29uZmlnXzEuZGVmYXVsdC5TRVJWRVJfSE9TVH06JHtDb25maWdfMS5kZWZhdWx0LlNFUlZFUl9QT1JUfWApO1xuICAgICAgICAgICAgdGhpcy53cy5vbmNsb3NlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmN1cnJlbnRVc2VyID0gbnVsbDtcbiAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5nYW1lID8gbWFpbl8xLmRlZmF1bHQuZ2FtZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCIgOiBudWxsO1xuICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmxvZ2luRm9ybSA/IG1haW5fMS5kZWZhdWx0LmxvZ2luRm9ybS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiIDogbnVsbDtcbiAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dnZXIuc2VuZExvZyhcIkVSUk9SXCIsIFwiQ29ubmVjdGlvbiB0byBzZXJ2ZXIgbG9zdGVkLlwiKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLndzLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dnZXIuc2VuZExvZyhcIlNVQ0NFU1NcIiwgXCJDb25uZWN0ZWQgdG8gc2VydmVyLlwiKTtcbiAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dpbkZvcm0gPyBtYWluXzEuZGVmYXVsdC5sb2dpbkZvcm0uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIiA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy53cy5vbm1lc3NhZ2UgPSAobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG1zZyA9PSBudWxsIHx8IG1zZy5kYXRhID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5wYXJzZShtc2cuZGF0YS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG1lc3NhZ2Uua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJsb2dnZWRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuY3VycmVudFVzZXIgPSBuZXcgVXNlcl8xLmRlZmF1bHQobWVzc2FnZS52YWx1ZS5pZCwgbWVzc2FnZS52YWx1ZS51c2VybmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dpbkZvcm0gPyBtYWluXzEuZGVmYXVsdC5sb2dpbkZvcm0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LnJlc2l6ZUNhbnZhcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuZ2FtZSA/IG1haW5fMS5kZWZhdWx0LmdhbWUuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIiA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5sb2dnZXIuc2VuZExvZyhcIklORk9cIiwgYExvZ2dlZCBhcyBbJHttYWluXzEuZGVmYXVsdC5jdXJyZW50VXNlci5pZH1dICR7bWFpbl8xLmRlZmF1bHQuY3VycmVudFVzZXIudXNlcm5hbWV9LmApO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSm9pbiByb29tIElEIDVhYjgxXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5zZW5kTXNnKFwiam9pblJvb21cIiwgXCI1YWI4MVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJpbml0Um9vbVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbSA9IG5ldyBSb29tXzEuZGVmYXVsdChtZXNzYWdlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmxvZ2dlci5zZW5kTG9nKFwiSU5GT1wiLCBgSW5pdGlhbGl6aW5nIHJvb20gWyR7bWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20uaWR9XS5gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vbV9pZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb29tSWQgIT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tSWQudmFsdWUgPSBtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbS5pZC50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20uaW5pdEFsbFBsYXllcnMobWVzc2FnZS52YWx1ZS5jdXJyZW50UGxheWVycyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGxheWVySm9pblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20gPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbS5pbml0UGxheWVyKG1lc3NhZ2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBsYXllckxlZnRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1haW5fMS5kZWZhdWx0LmN1cnJlbnRSb29tID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20ucmVtb3ZlUGxheWVyKG1lc3NhZ2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIndvcmxkU3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1haW5fMS5kZWZhdWx0LmN1cnJlbnRSb29tID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20udXBkYXRlV29ybGRTdGF0ZShtZXNzYWdlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJpbml0RW50aXR5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbSA9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5fMS5kZWZhdWx0LmN1cnJlbnRSb29tLmluaXRQbGF5ZXJFbnRpdHkobWVzc2FnZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZGVzdHJveUVudGl0eVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFpbl8xLmRlZmF1bHQuY3VycmVudFJvb20gPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWluXzEuZGVmYXVsdC5jdXJyZW50Um9vbS5kZXN0cm95UGxheWVyRW50aXR5KG1lc3NhZ2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2VuZE1zZyhrZXksIHZhbHVlID0gbnVsbCkge1xuICAgICAgICBpZiAodGhpcy53cyA9PSBudWxsIHx8IHRoaXMud3MucmVhZHlTdGF0ZSAhPT0gV2ViU29ja2V0Lk9QRU4pXG4gICAgICAgICAgICByZXR1cm4gbWFpbl8xLmRlZmF1bHQubG9nZ2VyLnNlbmRMb2coXCJFUlJPUlwiLCBcIkltcG9zc2libGUgdG8gc2VuZCBtZXNzYWdlIHRvIHNlcnZlciwgd2Vic29ja2V0cyBhcmUgZGlzY29ubmVjdC5cIik7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeSh7IGtleToga2V5LCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgIHRoaXMud3Muc2VuZChtZXNzYWdlKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBXZWJzb2NrZXRNYW5hZ2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IExvZ2dlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9zaGFyZWQvTG9nZ2VyL0xvZ2dlclwiKSk7XG5jb25zdCBLZXlNYW5hZ2VyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vS2V5L0tleU1hbmFnZXJcIikpO1xuY29uc3QgU2V0dGluZ3NNYW5hZ2VyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vU2V0dGluZ3MvU2V0dGluZ3NNYW5hZ2VyXCIpKTtcbmNvbnN0IFdlYlNvY2tldHNNYW5hZ2VyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vV2ViU29ja2V0cy9XZWJTb2NrZXRzTWFuYWdlclwiKSk7XG5sZXQgQXBwbGljYXRpb247XG5jbGFzcyBBcHAge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmxvZ2dlciA9IG5ldyBMb2dnZXJfMS5kZWZhdWx0KCk7XG4gICAgICAgIHRoaXMua2V5TWFuYWdlciA9IG5ldyBLZXlNYW5hZ2VyXzEuZGVmYXVsdCgpO1xuICAgICAgICB0aGlzLndlYlNvY2tldE1hbmFnZXIgPSBuZXcgV2ViU29ja2V0c01hbmFnZXJfMS5kZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuc2V0dGluZ3NNYW5hZ2VyID0gbmV3IFNldHRpbmdzTWFuYWdlcl8xLmRlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5jdXJyZW50VXNlciA9IG51bGw7XG4gICAgICAgIHRoaXMuY3VycmVudFJvb20gPSBudWxsO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZUNhbnZhc1wiKTtcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIHRoaXMuZ2FtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZVwiKTtcbiAgICAgICAgdGhpcy5sb2dpbkZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ2luXCIpO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudXBkYXRlLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICBpbml0KCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLndlYlNvY2tldE1hbmFnZXIuaW5pdCgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW5pdEV2ZW50cygpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5yZXNpemVDYW52YXMuYmluZCh0aGlzKSk7XG4gICAgICAgIGlmICh0aGlzLmxvZ2luRm9ybSAhPSBudWxsKVxuICAgICAgICAgICAgdGhpcy5sb2dpbkZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCB0aGlzLnRyeUxvZ2luLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICByZXNpemVDYW52YXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNhbnZhcyA9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgfVxuICAgIHRyeUxvZ2luKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50VXNlciAhPSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCB1c2VybmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9naW5fdXNlcm5hbWVcIik7XG4gICAgICAgIGlmICh1c2VybmFtZSA9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLndlYlNvY2tldE1hbmFnZXIuc2VuZE1zZyhcImxvZ2luXCIsIHVzZXJuYW1lLnZhbHVlKTtcbiAgICB9XG4gICAgdXBkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um9vbSAhPSBudWxsKVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Um9vbS51cGRhdGUoKTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpKTtcbiAgICB9XG59XG5BcHBsaWNhdGlvbiA9IG5ldyBBcHAoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEFwcGxpY2F0aW9uO1xuQXBwbGljYXRpb24uaW5pdCgpLmNhdGNoKChlKSA9PiBBcHBsaWNhdGlvbi5sb2dnZXIuc2VuZENyaXRpY2FsRXJyb3IoZS50b1N0cmluZygpKSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ29tbWFuZCA9IHZvaWQgMDtcbnZhciBDb21tYW5kO1xuKGZ1bmN0aW9uIChDb21tYW5kKSB7XG4gICAgQ29tbWFuZFtDb21tYW5kW1wiVXBcIl0gPSAwXSA9IFwiVXBcIjtcbiAgICBDb21tYW5kW0NvbW1hbmRbXCJEb3duXCJdID0gMV0gPSBcIkRvd25cIjtcbiAgICBDb21tYW5kW0NvbW1hbmRbXCJMZWZ0XCJdID0gMl0gPSBcIkxlZnRcIjtcbiAgICBDb21tYW5kW0NvbW1hbmRbXCJSaWdodFwiXSA9IDNdID0gXCJSaWdodFwiO1xufSkoQ29tbWFuZCB8fCAoZXhwb3J0cy5Db21tYW5kID0gQ29tbWFuZCA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IENvbW1hbmRfMSA9IHJlcXVpcmUoXCIuLi9Db21tYW5kL0NvbW1hbmRcIik7XG5jbGFzcyBFbnRpdHkge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IGRhdGEud2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gZGF0YS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuY29sb3IgPSBkYXRhLmNvbG9yO1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgdGhpcy5wb3NpdGlvbkJ1ZmZlciA9IFtdO1xuICAgIH1cbiAgICBkcmF3KGN0eCwgdXNlcm5hbWUpIHtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgICAgIGN0eC5maWxsUmVjdCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBjdHguZm9udCA9IFwiMTJweCBzZXJpZlwiO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgICAgICBjdHguZmlsbFRleHQodXNlcm5hbWUsIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55IC0gMTApO1xuICAgIH1cbiAgICBhcHBseUlucHV0KGlucHV0LCBzcGVlZCA9IDEwMCkge1xuICAgICAgICBpZiAoaW5wdXQuY29tbWFuZHMuaW5jbHVkZXMoQ29tbWFuZF8xLkNvbW1hbmQuUmlnaHQpKVxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ICs9IGlucHV0LnByZXNzZWRUaW1lICogc3BlZWQ7XG4gICAgICAgIGlmIChpbnB1dC5jb21tYW5kcy5pbmNsdWRlcyhDb21tYW5kXzEuQ29tbWFuZC5MZWZ0KSlcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCArPSBpbnB1dC5wcmVzc2VkVGltZSAqIC1zcGVlZDtcbiAgICAgICAgaWYgKGlucHV0LmNvbW1hbmRzLmluY2x1ZGVzKENvbW1hbmRfMS5Db21tYW5kLlVwKSlcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSArPSBpbnB1dC5wcmVzc2VkVGltZSAqIC1zcGVlZDtcbiAgICAgICAgaWYgKGlucHV0LmNvbW1hbmRzLmluY2x1ZGVzKENvbW1hbmRfMS5Db21tYW5kLkRvd24pKVxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55ICs9IGlucHV0LnByZXNzZWRUaW1lICogc3BlZWQ7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gRW50aXR5O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLklucHV0TWVzc2FnZSA9IHZvaWQgMDtcbmNsYXNzIElucHV0TWVzc2FnZSB7XG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgICAgICB0aGlzLmNvbW1hbmRzID0gZGF0YS5jb21tYW5kcztcbiAgICAgICAgdGhpcy5wbGF5ZXJJZCA9IGRhdGEucGxheWVySWQ7XG4gICAgICAgIHRoaXMucHJlc3NlZFRpbWUgPSBkYXRhLnByZXNzZWRUaW1lO1xuICAgICAgICB0aGlzLmlucHV0U2VxdWVuY2VOdW1iZXIgPSBkYXRhLmlucHV0U2VxdWVuY2VOdW1iZXI7XG4gICAgfVxufVxuZXhwb3J0cy5JbnB1dE1lc3NhZ2UgPSBJbnB1dE1lc3NhZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IExvZ0xldmVsID0ge1xuICAgIElORk86IHtcbiAgICAgICAgbGV2ZWw6IDAsXG4gICAgICAgIG5hbWU6IFwiSU5GT1wiLFxuICAgICAgICBiZ0NvbG9yOiBcIlxceDFiWzQ0bVwiLFxuICAgICAgICBiZ1dlYkNvbG9yOiBcIiMxOTY4OUJcIlxuICAgIH0sXG4gICAgV0FSTklORzoge1xuICAgICAgICBsZXZlbDogMCxcbiAgICAgICAgbmFtZTogXCJXQVJOSU5HXCIsXG4gICAgICAgIGJnQ29sb3I6IFwiXFx4MWJbNDNtXCIsXG4gICAgICAgIGJnV2ViQ29sb3I6IFwiI0NGN0UwRlwiXG4gICAgfSxcbiAgICBFUlJPUjoge1xuICAgICAgICBsZXZlbDogMCxcbiAgICAgICAgbmFtZTogXCJFUlJPUlwiLFxuICAgICAgICBiZ0NvbG9yOiBcIlxceDFiWzQxbVwiLFxuICAgICAgICBiZ1dlYkNvbG9yOiBcIiNBRjFCMUJcIlxuICAgIH0sXG4gICAgQ1JJVElDQUxfRVJST1I6IHtcbiAgICAgICAgbGV2ZWw6IDAsXG4gICAgICAgIG5hbWU6IFwiQ1JJVElDQUwgRVJST1JcIixcbiAgICAgICAgYmdDb2xvcjogXCJcXHgxYls0MW1cIixcbiAgICAgICAgYmdXZWJDb2xvcjogXCIjQUYxQjFCXCJcbiAgICB9LFxuICAgIFNVQ0NFU1M6IHtcbiAgICAgICAgbGV2ZWw6IDAsXG4gICAgICAgIG5hbWU6IFwiU1VDQ0VTU1wiLFxuICAgICAgICBiZ0NvbG9yOiBcIlxceDFiWzQybVwiLFxuICAgICAgICBiZ1dlYkNvbG9yOiBcIiMxNjdDNDNcIlxuICAgIH0sXG4gICAgREVCVUc6IHtcbiAgICAgICAgbGV2ZWw6IDEsXG4gICAgICAgIG5hbWU6IFwiREVCVUdcIixcbiAgICAgICAgYmdDb2xvcjogXCJcXHgxYls0Nm1cIixcbiAgICAgICAgYmdXZWJDb2xvcjogXCIjOTUxRDhBXCJcbiAgICB9LFxuICAgIFZFUkJPU0U6IHtcbiAgICAgICAgbGV2ZWw6IDIsXG4gICAgICAgIG5hbWU6IFwiVkVSQk9TRVwiLFxuICAgICAgICBiZ0NvbG9yOiBcIlxceDFiWzQ1bVwiLFxuICAgICAgICBiZ1dlYkNvbG9yOiBcIiM5MThEMTJcIlxuICAgIH1cbn07XG5leHBvcnRzLmRlZmF1bHQgPSBMb2dMZXZlbDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgTG9nTGV2ZWxfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9Mb2dMZXZlbFwiKSk7XG5jbGFzcyBMb2dnZXIge1xuICAgIHNlbmRMb2cobG9nS2V5LCBtZXNzYWdlKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKExvZ0xldmVsXzEuZGVmYXVsdFtsb2dLZXldLmJnQ29sb3IsIExvZ0xldmVsXzEuZGVmYXVsdFtsb2dLZXldLm5hbWUsIFwiXFx4MWJbMG1cIiwgbWVzc2FnZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAlYyAke0xvZ0xldmVsXzEuZGVmYXVsdFtsb2dLZXldLm5hbWV9ICVjICR7bWVzc2FnZX1gLCBgYmFja2dyb3VuZC1jb2xvcjogJHtMb2dMZXZlbF8xLmRlZmF1bHRbbG9nS2V5XS5iZ1dlYkNvbG9yfTsgY29sb3I6ICNGRkY7IGZvbnQtd2VpZ2h0OiBib2xkYCwgYGJhY2tncm91bmQtY29sb3I6IGluaGVyaXQ7IGNvbG9yOiBpbmhlcml0YCk7XG4gICAgfVxuICAgIHNlbmRDcml0aWNhbEVycm9yKG1lc3NhZ2UpIHtcbiAgICAgICAgdGhpcy5zZW5kTG9nKFwiQ1JJVElDQUxfRVJST1JcIiwgbWVzc2FnZSk7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdDtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBMb2dnZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIFNoYXJlYWJsZURhdGEge1xuICAgIGNvbnN0cnVjdG9yKHRzLCBwKSB7XG4gICAgICAgIHRoaXMudGltZXN0YW1wID0gdHM7XG4gICAgICAgIHRoaXMuc2hhcmVhYmxlRGF0YSA9IHA7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gU2hhcmVhYmxlRGF0YTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY2xhc3MgVmVjdG9yMiB7XG4gICAgY29uc3RydWN0b3IoeCwgeSkge1xuICAgICAgICB0aGlzLnggPSB4LFxuICAgICAgICAgICAgdGhpcy55ID0geTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBWZWN0b3IyO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vY2xpZW50L21haW4udHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=