import snmp from "net-snmp";
import { SnmpResult, SnmpV3AuthProtocol, SnmpV3PrivProtocol, SnmpV3Security, SnmpV3SecurityLevel } from "../models";

export class SnmpV3Service {
  private ip: string;
  private port: number;
  private context: string;
  private security: SnmpV3Security;
  private session: snmp.Session | null = null;

  constructor(ip: string, port: number, context: string, security: SnmpV3Security) {
    this.ip = ip;
    this.port = port;
    this.context = context;
    this.security = security;
  }

  private createSession() {
    if (this.session) return;

    const options: snmp.Options = {
      version: snmp.Version3,
      port: this.port,
      timeout: 5000,
      retries: 1,
      context: this.context
    };

    const user: snmp.V3User = {
      level:
        this.security.level === SnmpV3SecurityLevel.AuthPriv
          ? snmp.SecurityLevel.authPriv
          : this.security.level === SnmpV3SecurityLevel.AuthNoPriv
          ? snmp.SecurityLevel.authNoPriv
          : snmp.SecurityLevel.noAuthNoPriv,
      name: this.security.user,
    };

    if (user.level === snmp.SecurityLevel.authNoPriv || user.level === snmp.SecurityLevel.authPriv) {
      user.authProtocol =
        this.security.authProtocol === SnmpV3AuthProtocol.SHA
          ? snmp.AuthProtocols.sha
          : snmp.AuthProtocols.md5;
      user.authKey = this.security.authKey!;
    }

    if (user.level === snmp.SecurityLevel.authPriv) {
      user.privProtocol =
        this.security.privProtocol === SnmpV3PrivProtocol.AES
          ? snmp.PrivProtocols.aes
          : snmp.PrivProtocols.des;
      user.privKey = this.security.privKey!;
    }

    this.session = snmp.createV3Session(this.ip, user, options);
  }

  public async get(oid: string): Promise<SnmpResult[]> {
    return new Promise((resolve, reject) => {
      this.createSession();

      if (!this.session) {
        return reject(new Error("No se pudo crear la sesión SNMP"));
      }

      this.session.get([oid], (error: Error | null, varbinds: snmp.Varbind[]) => {
        if (error) {
          this.close();
          return reject(error);
        }

        const results: SnmpResult[] = varbinds.map((vb: snmp.Varbind) => {
          if (snmp.isVarbindError(vb)) {
            return { oid: vb.oid, error: snmp.varbindError(vb) };
          } else {
            return { oid: vb.oid, value: vb.value.toString() };
          }
        });

        this.close();
        resolve(results);
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
