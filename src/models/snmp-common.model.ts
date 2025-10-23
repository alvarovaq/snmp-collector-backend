export enum SnmpObjType {
	Boolean = "Boolean",
	Integer = "Integer",
	BitString = "BitString",
	OctetString = "OctetString",
	Null = "Null",
	OID = "OID",
	IpAddress = "IpAddress",
	Counter = "Counter",
	Gauge = "Gauge",
	TimeTicks = "TimeTicks",
	Opaque = "Opaque",
	Counter64 = "Counter64",
  NoSuchObject = "NoSuchObject",
  NoSuchInstance = "NoSuchInstance",
  EndOfMibView = "EndOfMibView",
  Error = "Error",
}

export interface SnmpResult {
  oid: string;
  value?: string;
  error?: string;
  type: SnmpObjType;
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
