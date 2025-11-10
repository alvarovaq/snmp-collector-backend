declare module "net-snmp" {
  import { EventEmitter } from "events";
  import * as dgram from "dgram";

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

  export interface TrapRemoteInfo {
    address: string;
    port: number;
    family: string;
    size?: number;
  }

  export interface NotificationPdu {
    varbinds: Varbind[];
  }

  export interface Notification {
    version: number;
    community?: string;
    pdu: NotificationPdu;
    transport: string;
    rinfo: TrapRemoteInfo;
  }

  export interface ReceiverOptions {
    port?: number;
    disableAuthorization?: boolean;
    transport?: "udp4" | "udp6";
  }

  export interface Receiver extends EventEmmiter {
    close(callback?: () => void): void;
    on(event: "listening", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "trap", listener: (msg: Buffer, rinfo: any) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
  }

  export function createReceiver(options: ReceiverOptions, callback: (error: Error | null, notification: Notification) => void): Receiver;
}
