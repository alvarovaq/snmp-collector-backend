import WebSocket, { WebSocketServer } from "ws";
import { Server } from "http";

export class WebSocketService {
  private static wss: WebSocketServer;
  
  public static init(server: Server): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("[WebSocket] Client connected");

      ws.on("message", (message) => {
        console.log("[WebSocket] Received:", message.toString());
      });

      ws.on("close", () => {
        console.log("[WebSocket] Client disconnected");
      });
    });

    console.log("[WebSocket] Server started");
  }
  
  public static broadcast(data: any): void {
    if (!this.wss) return;

    const message = JSON.stringify(data);
    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
  
  public static sendToClient(ws: WebSocket, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
}
