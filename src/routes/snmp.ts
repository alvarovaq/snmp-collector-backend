import { Router, Request, Response } from "express";
import { SnmpV2CService, SnmpV3Service } from "../services";
import { SnmpV3AuthProtocol, SnmpV3PrivProtocol, SnmpV3Security, SnmpV3SecurityLevel } from "../models";

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

router.get("/v3/2", async (req: Request, res: Response) => {
  const ip: string = "127.0.0.1";
  const port: number = 16102;
  const context: string = "public";
  const oid: string = "1.3.6.1.2.1.1.1.0";

  const security: SnmpV3Security = {
    user: "user2",
    level: SnmpV3SecurityLevel.NoAuthNoPriv
  };

  try {
    const snmpService = new SnmpV3Service(ip, port, context, security);
    const result = await snmpService.get(oid);
    res.json({ ip, oid, result });
  } catch (error: any) {
    console.error("❌ Error SNMP:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get("/v3/3", async (req: Request, res: Response) => {
  const ip: string = "127.0.0.1";
  const port: number = 16103;
  const context: string = "public";
  const oid: string = "1.3.6.1.2.1.1.1.0";

  const security: SnmpV3Security  = {
    user: "user3",
    authProtocol: SnmpV3AuthProtocol.MD5,
    authKey: "authpass",
    level: SnmpV3SecurityLevel.AuthNoPriv
  };

  try {
    const snmpService = new SnmpV3Service(ip, port, context, security);
    const result = await snmpService.get(oid);
    res.json({ ip, oid, result });
  } catch (error: any) {
    console.error("❌ Error SNMP:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get("/v3/4", async (req: Request, res: Response) => {
  const ip: string = "127.0.0.1";
  const port: number = 16104;
  const context: string = "public";
  const oid: string = "1.3.6.1.2.1.1.1.0";

  const security: SnmpV3Security = {
    user: "user4",
    authProtocol: SnmpV3AuthProtocol.SHA,
    authKey: "authpass",
    level: SnmpV3SecurityLevel.AuthPriv,
    privProtocol: SnmpV3PrivProtocol.AES,
    privKey: "privpass"
  };

  try {
    const snmpService = new SnmpV3Service(ip, port, context, security);
    const result = await snmpService.get(oid);
    res.json({ ip, oid, result });
  } catch (error: any) {
    console.error("❌ Error SNMP:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
