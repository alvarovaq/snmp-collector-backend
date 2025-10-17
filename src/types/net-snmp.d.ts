declare module "net-snmp" {
  export const Version1: number;
  export const Version2c: number;
  export const Version3: number;

  export const SecurityLevel: {
    noAuthNoPriv: number;
    authNoPriv: number;
    authPriv: number;
  };

  export const AuthProtocols: {
    md5: number;
    sha: number;
  };

  export const PrivProtocols: {
    des: number;
    aes: number;
  };

  export interface Varbind {
    oid: string;
    value: any;
    type: number;
  }

  export interface Options {
    version?: number;
    port?: number;
    retries?: number;
    timeout?: number;
    transport?: string;
    idBitsSize?: number;
    context?: string;
    security?: {
      level?: number;
      userName?: string;
      authProtocol?: number;
      authKey?: string;
      privProtocol?: number;
      privKey?: string;
    };
  }

  export interface V3User {
    name: string;
    level: SecurityLevel;
    authProtocol?: AuthProtocols;
    authKey?: string;
    privProtocol?: PrivProtocols;
    privKey?: string;
  }


  export type Session = {
    get(oids: string[], callback: (error: Error | null, varbinds: Varbind[]) => void): void;
    close(): void;
  };

  export function createSession(
    host: string,
    communityOrUser: string,
    options?: Options
  ): Session;

  export function createV3Session(host: string, options?: Options): Session;
  export function createV3Session(host: string, user: V3User, options?: Options): Session;

  export function isVarbindError(varbind: Varbind): boolean;
  export function varbindError(varbind: Varbind): string;
}
