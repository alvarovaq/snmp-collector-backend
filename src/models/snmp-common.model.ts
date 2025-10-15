export interface SnmpResult {
  oid: string;
  value?: string;
  error?: string;
}

export enum SnmpVersion {
  Version2c = 2,
  Version3 = 3,
}

export enum SnmpV3AuthProtocol {
  MD5 = "md5",
  SHA = "sha",
}

export enum SnmpV3PrivProtocol {
  DES = "des",
  AES = "aes",
}

export enum SnmpV3SecurityLevel {
  NoAuthNoPriv = "noAuthNoPriv",
  AuthNoPriv = "authNoPriv",
  AuthPriv = "authPriv",
}

export interface SnmpV3Security {
  user: string;
  authProtocol?: SnmpV3AuthProtocol;
  authKey?: string;
  privProtocol?: SnmpV3PrivProtocol;
  privKey?: string;
  level?: SnmpV3SecurityLevel;
}