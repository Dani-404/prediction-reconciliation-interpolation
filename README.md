# Real WebSocket implementation of an authoritative server with client side prediction, server reconciliation, and entities interpolation

### Installation
```sh
$ npm install
$ npm start
```

### Implementation
* WebSocket server and WebSocket client
* Clients, Players login and Rooms system
* Client side prediction, server reconciliation and entities interpolation based on [Gabriel Gambetta tutorial](https://gabrielgambetta.com/client-server-game-architecture.html). 

### Client Config
```
SERVER_HOST: "127.0.0.1",
SERVER_PORT: 8090,
SERVER_UPDATE_INTERVAL: 10
```

### Server Config
```
PORT: 8090,
HTTP_PORT: 8091,
UPDATE_INTERVAL: 10,
MAX_PRESS_TIME: 10
```

### Real example
![image](https://i.imgur.com/8Q6Ffyb.gif)

### Dependencies 
* typescript
* ts-loader
* webpack
* ws
* express
* finalhandler
* path
