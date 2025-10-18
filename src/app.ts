import express from "express";
import snmpRouter from "./routes/snmp";
import { env } from "./config/env";

const app = express();
app.use(express.json());

// Ruta base
app.get("/", (_, res) => res.send("🚀 SNMP API funcionando correctamente"));

// Rutas
app.use("/api/snmp", snmpRouter);

app.listen(env.port, () => console.log(`✅ Servidor en http://localhost:${env.port}`));
