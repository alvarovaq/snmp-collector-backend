import { pool } from "../config/db";
import { Device, OidConfig, SnmpV3AuthProtocol, SnmpV3PrivProtocol, SnmpV3SecurityLevel, SnmpVersion } from "../models";
import { logger } from "./logger.service";

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
        const devices: Device[] = [];
        for (const row of rows) {
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
            devices.push(device);
        }

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

  public static async addDevice(device: Device): Promise<number> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const result = await client.query(
            "INSERT INTO devices (name) VALUES ($1) RETURNING id",
            [device.name]
        );
        const id = result.rows[0].id;

        if (!id)
            return -1;

        await client.query(
            `INSERT INTO devicesconfig (device_id, ip, port, version, community, context, user_name, security_level, auth_protocol, auth_key, priv_protocol, priv_key)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [id, device.config.ip, device.config.port, device.config.version, device.config.community, device.config.context, device.config.security?.user,
                device.config.security?.level, device.config.security?.authProtocol, device.config.security?.authKey, device.config.security?.privProtocol, device.config.security?.privKey]
        );

        for (const oid of device.oids) {
            await client.query(
                "INSERT INTO oids (device_id, oid, name, frequency) VALUES ($1, $2, $3, $4)",
                [id, oid.oid, oid.name, oid.frequency]
            );
        }

        await client.query("COMMIT");

        return id;
    } catch (err) {
        await client.query("ROLLBACK");
        logger.error("Failed to add device:", "DeviceDBService", err);
    } finally {
        client.release();
    }

    return -1;
  }

  public static async updateDevice(device: Device): Promise<boolean> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        await client.query(
            "UPDATE devices SET name = $1 WHERE id = $2",
            [device.name, device.id]
        );

        await client.query(
            "DELETE FROM devicesconfig WHERE device_id = $1",
            [device.id]
        );

        await client.query(
            "DELETE FROM oids WHERE device_id = $1",
            [device.id]
        );

        await client.query(
            `INSERT INTO devicesconfig (device_id, ip, port, version, community, context, user_name, security_level, auth_protocol, auth_key, priv_protocol, priv_key)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [device.id, device.config.ip, device.config.port, device.config.version, device.config.community, device.config.context, device.config.security?.user,
                device.config.security?.level, device.config.security?.authProtocol, device.config.security?.authKey, device.config.security?.privProtocol, device.config.security?.privKey]
        );

        for (const oid of device.oids) {
            await client.query(
                "INSERT INTO oids (device_id, oid, name, frequency) VALUES ($1, $2, $3, $4)",
                [device.id, oid.oid, oid.name, oid.frequency]
            );
        }

        await client.query("COMMIT");

        return true;
    } catch (err) {
        await client.query("ROLLBACK");
        logger.error("Failed to add device:", "DeviceDBService", err);
    } finally {
        client.release();
    }

    return false;
  }

  public static async removeDevice(device_id: number): Promise<boolean> {
    try {
        const query = `
            UPDATE devices SET deleted_at = $1 WHERE id = $2 RETURNING *
        `;

        const { rows } = await pool.query(query, [new Date(), device_id]);
        return rows.length > 0;
    } catch (err) {
        logger.error("Failed to get oids:", "DevicesDBService", err);
    }

    return false;
  }
}