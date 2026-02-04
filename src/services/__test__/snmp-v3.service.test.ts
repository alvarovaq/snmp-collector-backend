import snmp from "net-snmp";
import { SnmpV3Service } from "../snmp-v3.service";
import { SnmpV3AuthProtocol, SnmpV3PrivProtocol, SnmpV3SecurityLevel } from "../../models";
import { getSnmpObjType } from "../../utils/snmp";

jest.mock("net-snmp");
jest.mock("../../utils/snmp", () => ({
    getSnmpObjType: jest.fn()
}));

describe("SnmpV3Service", () => {
    let mockSession: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockSession = {
            get: jest.fn(),
            close: jest.fn()
        };

        (snmp.createV3Session as jest.Mock).mockReturnValue(mockSession);
        (getSnmpObjType as jest.Mock).mockReturnValue("Integer");
        (snmp.isVarbindError as jest.Mock).mockReturnValue(false);
    });

    test("creates v3 session with authPriv and returns results", async () => {
        mockSession.get.mockImplementation(
            (_oids: string[], cb: (err: Error | null, vbs: any[]) => void) => {
                cb(null, [
                    {
                        oid: "1.3.6.1.2.1.1.1.0",
                        value: Buffer.from("value"),
                        type: 2
                    }
                ]);
            }
        );

        const service = new SnmpV3Service(
            "127.0.0.1",
            161,
            "",
            {
                level: SnmpV3SecurityLevel.AuthPriv,
                user: "user",
                authProtocol: SnmpV3AuthProtocol.SHA,
                authKey: "authKey",
                privProtocol: SnmpV3PrivProtocol.AES,
                privKey: "privKey"
            }
        );

        const result = await service.get(["1.3.6.1.2.1.1.1.0"]);

        expect(snmp.createV3Session).toHaveBeenCalledWith(
            "127.0.0.1",
            expect.objectContaining({
                level: snmp.SecurityLevel.authPriv,
                name: "user",
                authProtocol: snmp.AuthProtocols.sha,
                authKey: "authKey",
                privProtocol: snmp.PrivProtocols.aes,
                privKey: "privKey"
            }),
            expect.objectContaining({
                version: snmp.Version3,
                port: 161
            })
        );

        expect(mockSession.close).toHaveBeenCalled();

        expect(result).toEqual([
            {
                oid: "1.3.6.1.2.1.1.1.0",
                value: "value",
                type: "Integer"
            }
        ]);
    });

    test("returns varbind error when SNMP reports error", async () => {
        (snmp.isVarbindError as jest.Mock).mockReturnValue(true);
        (snmp.varbindError as jest.Mock).mockReturnValue("No such object");

        mockSession.get.mockImplementation(
            (_oids: string[], cb: (err: Error | null, vbs: any[]) => void) => {
                cb(null, [
                    { oid: "1.3.6.1.2.1.1.1.0", type: 2 }
                ]);
            }
        );

        const service = new SnmpV3Service(
            "127.0.0.1",
            161,
            "",
            {
                level: SnmpV3SecurityLevel.NoAuthNoPriv,
                user: "user"
            }
        );

        const result = await service.get(["1.3.6.1.2.1.1.1.0"]);

        expect(result).toEqual([
            {
                oid: "1.3.6.1.2.1.1.1.0",
                error: "No such object",
                type: "Integer"
            }
        ]);
    });

    test("rejects when SNMP get fails", async () => {
        mockSession.get.mockImplementation(
            (_oids: string[], cb: (err: Error | null, vbs: any[]) => void) => {
                cb(new Error("SNMP error"), []);
            }
        );

        const service = new SnmpV3Service(
            "127.0.0.1",
            161,
            "",
            {
                level: SnmpV3SecurityLevel.NoAuthNoPriv,
                user: "user"
            }
        );

        await expect(
            service.get(["1.3.6.1.2.1.1.1.0"])
        ).rejects.toThrow("SNMP error");

        expect(mockSession.close).toHaveBeenCalled();
    });

    test("close closes session and clears it", () => {
        const service = new SnmpV3Service(
            "127.0.0.1",
            161,
            "",
            {
                level: SnmpV3SecurityLevel.NoAuthNoPriv,
                user: "user"
            }
        );

        (service as any).session = mockSession;

        service.close();

        expect(mockSession.close).toHaveBeenCalled();
        expect((service as any).session).toBeNull();
    });
});
