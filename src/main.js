/** @format */

const http = require("http");
const dotenv = require("dotenv");

const config = require("./config");
const database = require("./lib/database");
const app = require("./lib/server");

dotenv.config();

const { port } = config;
const server = http.createServer(app);

async function main() {
    try {
        await startServer();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

async function startServer() {
    database.connect(config.mongo.uri);
    server.listen(port, onlistening);
}

function onlistening() {
    console.log(`listening on http://ocalhost:${port}`);
}

main();
