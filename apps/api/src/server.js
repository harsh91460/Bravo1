import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

dotenv.config({
  path: path.resolve(currentDirectory, "../../../.env")
});
import app from "./app.js";
import {
  connectMongoDB,
  disconnectMongoDB
} from "./config/mongodb.js";
import {
  connectRedis,
  disconnectRedis
} from "./config/redis.js";

const PORT = Number(process.env.API_PORT) || 3000;

let server;
let shuttingDown = false;

async function startServer() {
  try {
    await connectMongoDB();
    await connectRedis();

    server = app.listen(PORT, () => {
      console.log(`Bravo API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Bravo API:", error.message);

    await disconnectRedis().catch(() => {});
    await disconnectMongoDB().catch(() => {});

    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received. Shutting down Bravo API...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await disconnectRedis();
    await disconnectMongoDB();

    console.log("Bravo API shut down cleanly");
  } catch (error) {
    console.error("Error during shutdown:", error.message);
    process.exitCode = 1;
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void startServer();
