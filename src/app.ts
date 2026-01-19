import express from "express";
import cors from "cors";
import http from "http";
import devicesRouter from "./routes/devices.routes";
import oidRecordsRouter from "./routes/oid-records.routes";
import usersRouter from "./routes/users.routes";
import authRouter from "./routes/auth.routes";
import rulesRouter from "./routes/rules.routes";
import AlarmsRouter from "./routes/alarms.routes";
import { env } from "./config/env";
import { WebSocketService } from "./services/websocket.service";

const app = express();

app.use(
    cors({
        origin: "*"
    })
);

app.use(express.json());

// Ruta base
app.get("/", (_, res) => res.send("🚀 SNMP API funcionando correctamente"));

// Rutas
app.use("/api/devices", devicesRouter);
app.use("/api/oidRecords", oidRecordsRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/rules", rulesRouter);
app.use("/api/alarms", AlarmsRouter);

const server = http.createServer(app);
WebSocketService.init(server);

server.listen(env.port, () => console.log(`✅ Servidor en http://localhost:${env.port}`));