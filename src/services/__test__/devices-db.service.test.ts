import { DevicesDBService } from "../devices-db.service";
import { pool } from "../../config/db";
import { Device, SnmpV3SecurityLevel, SnmpVersion } from "../../models";

jest.mock("../../config/db", () => ({
    pool: {
        query: jest.fn(),
        connect: jest.fn()
    }
}));

jest.mock("../logger.service", () => ({
    logger: {
        error: jest.fn(),
    },
}));

const mockDevice: Device = {
    id: 1,
    name: "Device 1",
    config: {
        ip: "192.168.1.1",
        port: 161,
        version: SnmpVersion.Version2c,
        community: "public",
        context: "",
        security: {
            level: SnmpV3SecurityLevel.NoAuthNoPriv,
            user: "",
            authProtocol: undefined,
            authKey: undefined,
            privProtocol: undefined,
            privKey: undefined
        }
    },
    oids: [
        {
            oid: "1.3.6.1.2.1.1.1.0",
            name: "sysDescr",
            frequency: 60,
            rules: [1, 2]
        }
    ]
};

describe("DevicesDBService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("getDevices returns devices with oids", async () => {
        (pool.query as jest.Mock)
            .mockResolvedValueOnce({
                rows: [
                    {
                        id: 1,
                        name: "Device 1",
                        ip: "192.168.1.1",
                        port: 161,
                        version: "2c",
                        community: "public",
                        context: undefined,
                        security_level: "noAuthNoPriv",
                        user_name: undefined,
                        auth_protocol: undefined,
                        auth_key: undefined,
                        priv_protocol: undefined,
                        priv_key: undefined
                    }
                ]
            })
            .mockResolvedValueOnce({
                rows: [
                    {
                        oid: "1.3.6.1.2.1.1.1.0",
                        name: "sysDescr",
                        frequency: 60
                    }
                ]
            })
            .mockResolvedValueOnce({
                rows: [
                    { rule_id: 1 },
                    { rule_id: 2 }
                ]
            });

        const devices = await DevicesDBService.getDevices();
        expect(devices).toHaveLength(1);
        expect(devices[0].id).toBe(1);
        expect(devices[0].oids[0].rules).toEqual([1, 2]);
    });

    test("addDevice inserts device and returns id", async () => {
        const mockClient = {
            query: jest.fn()
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValue({ rows: [{ id: 1 }]}),
            release: jest.fn()
        };
        (pool.connect as jest.Mock).mockResolvedValue(mockClient);

        const id = await DevicesDBService.addDevice(mockDevice);
        expect(id).toBe(1);
        expect(mockClient.query).toHaveBeenCalled();
        expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
        expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    });

    test("removeDevice returns true if device deleted", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 1 }] });
        const result = await DevicesDBService.removeDevice(1);
        expect(result).toBe(true);
    });

    test("removeOidsRule returns true if rule deleted", async () => {
        const mockClient = {
            query: jest.fn().mockResolvedValue({}),
            release: jest.fn()
        };
        (pool.connect as jest.Mock).mockResolvedValue(mockClient);

        const result = await DevicesDBService.removeOidsRule(1);
        expect(result).toBe(true);
        expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
        expect(mockClient.query).toHaveBeenCalledWith(
            "DELETE FROM oidsrules WHERE rule_id = $1",
            [1]
        );
        expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    });
});
