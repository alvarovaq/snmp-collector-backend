import { SnmpObjType } from "./snmp-common.model";

export interface OidRecordsReq {
    deviceId: number;
    oid: string;
    start: Date;
    end: Date;
}

export interface OidRecordID {
    deviceId: number;
    oid: string;
}

export interface OidRecord {
    deviceId: number;
    oid: string;
    value?: string;
    error?: string;
    type: SnmpObjType;
    date: Date;
}