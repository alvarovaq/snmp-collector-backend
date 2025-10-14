import { Router, Request, Response } from "express";
import { SnmpV2CService } from "../services/SnmpV2CService";
import { SnmpV3Service, SnmpV3Config } from "../services/SnmpV3Service";

const router = Router();

router.get("/v2c", async (req: Request, res: Response) => {
  const ip: string = "127.0.0.1";
  const port: number = 16101;
  const community: string = "public";
  const oid: string = "1.3.6.1.2.1.1.1.0";

  try {
    const snmpService = new SnmpV2CService(ip, port, community);
    const result = await snmpService.get(oid);
    res.json({ ip, oid, result });
  } catch (error: any) {
    console.error("❌ Error SNMP:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get("/v3", async (req: Request, res: Response) => {
  const ip: string = "127.0.0.1";
  const port: number = 16102;
  const context: string = "public";
  const oid: string = "1.3.6.1.2.1.1.1.0";

  const config: SnmpV3Config = {
    user: "userSHA",
    authProtocol: "sha",
    authKey: "authpass",
    level: "authPriv",
    privProtocol: "aes",
    privKey: "privpass"
  };

  try {
    const snmpService = new SnmpV3Service(ip, port, context, config);
    const result = await snmpService.get(oid);
    res.json({ ip, oid, result });
  } catch (error: any) {
    console.error("❌ Error SNMP:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
