import express from "express";
import snmpRouter from "./routes/snmp";

const app = express();
app.use(express.json());

// Ruta base
app.get("/", (_, res) => res.send("🚀 SNMP API funcionando correctamente"));

// Rutas
app.use("/api/snmp", snmpRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor en http://localhost:${PORT}`));
