import WebSocket, { WebSocketServer } from "ws";
import { Server } from "http";
import { WSMessage } from "../models";
import { logger } from "./logger.service";

export class WebSocketService {
  private static wss: WebSocketServer;
  
  public static init(server: Server): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on("connection", (ws: WebSocket) => {
      logger.info("Client connected", "WebSocket");

      ws.on("message", (message) => {
        logger.info(`Received: ${message.toString()}`, "WebSocket");
      });

      ws.on("close", () => {
        logger.info("Client disconnected", "WebSocket");
      });
    });

    logger.info("Server started", "WebSocket");
  }
  
  public static broadcast(msg: WSMessage): void {
    if (!this.wss) return;

    const message = JSON.stringify(msg);
    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
  
  public static sendToClient(ws: WebSocket, msg: WSMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }
}
