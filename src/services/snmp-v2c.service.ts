import snmp from "net-snmp";
import { SnmpResult } from "../models";
import { getSnmpObjType } from "../utils/snmp.utils";

export class SnmpV2CService {
  private ip: string;
  private port: number;
  private community: string;
  private session: snmp.Session | null = null;

  constructor(ip: string, port: number, community: string) {
    this.ip = ip;
    this.community = community;
    this.port = port;
  }

  private createSession() {
    if (!this.session) {
      const options: snmp.Options = { port: this.port };
      this.session = snmp.createSession(this.ip, this.community, options);
    }
  }

  public async get(oid: string): Promise<SnmpResult> {
    return new Promise((resolve, reject) => {
      this.createSession();

      if (!this.session) {
        return reject(new Error("No se pudo crear la sesión SNMP"));
      }

      this.session.get([oid], (error: Error | null, varbinds: snmp.Varbind[]) => {
        this.close();

        if (error) {
          return reject(error);
        }

        const vb = varbinds?.[0];
        if (!vb) {
          return reject(new Error("No varbinds returned"));
        }
        
        if (snmp.isVarbindError(vb)) {
          return resolve({ oid: vb.oid, error: snmp.varbindError(vb), type: getSnmpObjType(vb.type) });
        }
        
        return resolve({ oid: vb.oid, value: vb.value.toString(), type: getSnmpObjType(vb.type) });
      });
    });
  }

  public close() {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
  }
}
