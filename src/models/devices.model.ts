import { SnmpV3Security, SnmpVersion } from "./snmp-common.model";

export interface OidConfig
{
    name: string;
    oid: string;
    frequency: number;
    rules: number[];
}

export interface DeviceConfig
{
    ip: string;
    port: number;
    version: SnmpVersion;
    community?: string;
    context?: string;
    security?: SnmpV3Security;
}

export interface Device
{
    id: number;
    name: string;
    config: DeviceConfig;
    oids: OidConfig[];
}