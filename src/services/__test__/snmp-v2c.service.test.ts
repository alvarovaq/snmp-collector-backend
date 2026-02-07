import snmp from "net-snmp";
import { SnmpV2CService } from "../snmp-v2c.service";
import { getSnmpObjType } from "../../utils/snmp";

jest.mock("net-snmp");
jest.mock("../../utils/snmp", () => ({
    getSnmpObjType: jest.fn()
}));

describe("SnmpV2CService", () => {
    let mockSession: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockSession = {
            get: jest.fn(),
            close: jest.fn()
        };

        (snmp.createSession as jest.Mock).mockReturnValue(mockSession);
        (getSnmpObjType as jest.Mock).mockReturnValue("Integer");
    });

    test("creates session and returns SNMP results", async () => {
        const varbinds = [
            {
                oid: "1.3.6.1.2.1.1.1.0",
                value: Buffer.from("test-value"),
                type: 2
            }
        ];

        mockSession.get.mockImplementation((_oids: string[], cb: (error: Error | null, varbinds: any[]) => void) => {
            cb(null, varbinds);
        });

        const service = new SnmpV2CService("127.0.0.1", 161, "public");
        const result = await service.get(["1.3.6.1.2.1.1.1.0"]);

        expect(snmp.createSession).toHaveBeenCalledWith(
            "127.0.0.1",
            "public",
            { port: 161 }
        );

        expect(mockSession.get).toHaveBeenCalledWith(
            ["1.3.6.1.2.1.1.1.0"],
            expect.any(Function)
        );

        expect(mockSession.close).toHaveBeenCalled();

        expect(result).toEqual([
            {
                oid: "1.3.6.1.2.1.1.1.0",
                value: "test-value",
                type: "Integer"
            }
        ]);
    });

    test("returns error varbind when snmp reports varbind error", async () => {
        const varbinds = [
            {
                oid: "1.3.6.1.2.1.1.1.0",
                type: 2
            }
        ];

        (snmp.isVarbindError as jest.Mock).mockReturnValue(true);
        (snmp.varbindError as jest.Mock).mockReturnValue("No such object");

        mockSession.get.mockImplementation((_oids: string[], cb: (error: Error | null, varbinds: any[]) => void) => {
            cb(null, varbinds);
        });

        const service = new SnmpV2CService("127.0.0.1", 161, "public");
        const result = await service.get(["1.3.6.1.2.1.1.1.0"]);

        expect(result).toEqual([
            {
                oid: "1.3.6.1.2.1.1.1.0",
                error: "No such object",
                type: "Integer"
            }
        ]);
    });

    test("rejects when SNMP returns an error", async () => {
        mockSession.get.mockImplementation((_oids: string[], cb: (error: Error | null, varbinds: any[]) => void) => {
            cb(new Error("SNMP error"), []);
        });

        const service = new SnmpV2CService("127.0.0.1", 161, "public");

        await expect(
            service.get(["1.3.6.1.2.1.1.1.0"])
        ).rejects.toThrow("SNMP error");

        expect(mockSession.close).toHaveBeenCalled();
    });

    test("close closes session and clears it", () => {
        const service = new SnmpV2CService("127.0.0.1", 161, "public");
        
        (service as any).session = mockSession;

        service.close();

        expect(mockSession.close).toHaveBeenCalled();
        expect((service as any).session).toBeNull();
    });
});
