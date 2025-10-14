import snmp from "net-snmp";

export interface SnmpResult {
  oid: string;
  value?: string;
  error?: string;
}

export interface SnmpV3Config {
  user: string;
  authProtocol?: "md5" | "sha";
  authKey?: string;
  privProtocol?: "des" | "aes";
  privKey?: string;
  level?: "noAuthNoPriv" | "authNoPriv" | "authPriv";
}

export class SnmpV3Service {
  private ip: string;
  private port: number;
  private context: string;
  private config: SnmpV3Config;
  private session: snmp.Session | null = null;

  constructor(ip: string, port: number, context: string, config: SnmpV3Config) {
    this.ip = ip;
    this.config = config;
    this.port = port;
    this.context = context;
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
        this.config.level === "authPriv"
          ? snmp.SecurityLevel.authPriv
          : this.config.level === "authNoPriv"
          ? snmp.SecurityLevel.authNoPriv
          : snmp.SecurityLevel.noAuthNoPriv,
      name: this.config.user,
    };

    if (user.level === snmp.SecurityLevel.authNoPriv || user.level === snmp.SecurityLevel.authPriv) {
      user.authProtocol =
        this.config.authProtocol === "sha"
          ? snmp.AuthProtocols.sha
          : snmp.AuthProtocols.md5;
      user.authKey = this.config.authKey!;
    }

    if (user.level === snmp.SecurityLevel.authPriv) {
      user.privProtocol =
        this.config.privProtocol === "aes"
          ? snmp.PrivProtocols.aes
          : snmp.PrivProtocols.des;
      user.privKey = this.config.privKey!;
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
