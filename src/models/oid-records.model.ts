export interface OidRecord {
    deviceId: number;
    oid: string;
    value?: string;
    error?: string;
    timestamp: number;
}