import express from "express";
import devicesRouter from "./routes/devices.routes";
import oidRecordsRouter from "./routes/oid-records.routes";
import { env } from "./config/env";

const app = express();
app.use(express.json());

// Ruta base
app.get("/", (_, res) => res.send("🚀 SNMP API funcionando correctamente"));

// Rutas
app.use("/api/devices", devicesRouter);
app.use("/api/oidRecords", oidRecordsRouter);

app.listen(env.port, () => console.log(`✅ Servidor en http://localhost:${env.port}`));
