import WebSocket, { WebSocketServer } from "ws";
import { WebSocketService } from "../websocket.service";
import { logger } from "../logger.service";
import { WSEvent, WSMessage } from "../../models";

jest.mock("ws");
jest.mock("../logger.service", () => ({
    logger: { info: jest.fn() }
}));

describe("WebSocketService", () => {
    let mockServer: any;
    let mockWss: any;
    let mockClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockServer = {};
        mockClient = { readyState: WebSocket.OPEN, send: jest.fn() };
        mockWss = { clients: new Set([mockClient]), on: jest.fn() };
        (WebSocketServer as unknown as jest.Mock).mockImplementation(() => mockWss);
    });

    test("init crea WebSocketServer y logea", () => {
        WebSocketService.init(mockServer as any);
        expect(WebSocketServer).toHaveBeenCalledWith({ server: mockServer });
        expect(mockWss.on).toHaveBeenCalledWith("connection", expect.any(Function));
        expect(logger.info).toHaveBeenCalledWith("Server started", "WebSocket");
    });

    test("broadcast envia mensaje a clientes abiertos", () => {
        WebSocketService.init(mockServer as any);
        const msg = { event: WSEvent.Other, data: { a: 1 } };
        WebSocketService.broadcast(msg);
        expect(mockClient.send).toHaveBeenCalledWith(JSON.stringify(msg));
    });

    test("broadcast no envia mensaje a clientes cerrados", () => {
        mockClient.readyState = WebSocket.CLOSED;
        WebSocketService.init(mockServer as any);
        WebSocketService.broadcast({ event: WSEvent.Other, data: {} });
        expect(mockClient.send).not.toHaveBeenCalled();
    });

    test("sendToClient envia mensaje si el socket esta abierto", () => {
        const ws: any = { readyState: WebSocket.OPEN, send: jest.fn() };
        WebSocketService.sendToClient(ws, { event: WSEvent.Other, data: 1 });
        expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ event: WSEvent.Other, data: 1 }));
    });

    test("sendToClient no envia si el socket no esta abierto", () => {
        const ws: any = { readyState: WebSocket.CLOSED, send: jest.fn() };
        WebSocketService.sendToClient(ws, { event: WSEvent.Other, data: 1 });
        expect(ws.send).not.toHaveBeenCalled();
    });
});
