import { pool } from "../config/db";
import { Device, OidConfig, SnmpV3AuthProtocol, SnmpV3PrivProtocol, SnmpV3SecurityLevel, SnmpVersion } from "../models";
import { logger } from "./";

export class DevicesDBService {
  public static async getDevices(): Promise<Device[]> {
    try {
        const query = `
            SELECT d.id, d.name, dc.ip, dc.port, dc.version, dc.community, dc.context, dc.security_level,
            dc.user_name, dc.auth_protocol, dc.auth_key, dc.priv_protocol, dc.priv_key
            FROM devices d
            INNER JOIN devicesconfig as dc on dc.device_id = d.id
            WHERE d.deleted_at IS NULL
            ORDER BY d.id;
        `;

        const { rows } = await pool.query(query);
        const devices: Device[] = await Promise.all(
            rows.map(async (row: any) => {
                const device: Device = {
                    id: row.id,
                    name: row.name,
                    config: {
                        ip: row.ip,
                        port: row.port,
                        version: row.version as SnmpVersion ?? SnmpVersion.Version2c,
                        community: row.community,
                        context: row.context,
                        security: {
                            level: row.security_level as SnmpV3SecurityLevel ?? SnmpV3SecurityLevel.NoAuthNoPriv,
                            user: row.user_name ?? "",
                            authProtocol: row.auth_protocol as SnmpV3AuthProtocol,
                            authKey: row.auth_key,
                            privProtocol: row.priv_protocol as SnmpV3PrivProtocol,
                            privKey: row.priv_key,
                        },
                    },
                    oids: await this.getOids(row.id),
                };
                return device;
            })
        );

        return devices;
    } catch (err) {
        logger.error("Failed to get devices:", "DevicesDBService", err);
    }

    return [];
  }

  public static async getOids(device_id: number): Promise<OidConfig[]> {
    try {
        const query = `
            SELECT oid, name, frequency
            FROM oids
            WHERE device_id = $1
        `;

        const { rows } = await pool.query(query, [device_id]);
        return rows.map((row: any) => {
            const oidConfig: OidConfig = {
                oid: row.oid,
                name: row.name,
                frequency: row.frequency
            };
            return oidConfig;
        });
    } catch (err) {
        logger.error("Failed to get oids:", "DevicesDBService", err);
    }

    return [];
  }
}