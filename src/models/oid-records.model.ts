import { SnmpObjType } from "./snmp-common.model";

export interface OidRecord {
    deviceId: number;
    oid: string;
    value?: string;
    error?: string;
    type: SnmpObjType;
    date: Date;
}