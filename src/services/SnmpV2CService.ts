import snmp from "net-snmp";

export interface SnmpResult {
  oid: string;
  value?: string;
  error?: string;
}

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
