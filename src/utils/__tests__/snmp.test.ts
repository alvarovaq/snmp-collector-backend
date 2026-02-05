import { getSnmpObjType } from "../snmp";
import { SnmpObjType } from "../../models";

describe("getSnmpObjType", () => {
    it("should return correct SnmpObjType for known types", () => {
        expect(getSnmpObjType(1)).toBe(SnmpObjType.Boolean);
        expect(getSnmpObjType(2)).toBe(SnmpObjType.Integer);
        expect(getSnmpObjType(3)).toBe(SnmpObjType.BitString);
        expect(getSnmpObjType(4)).toBe(SnmpObjType.OctetString);
        expect(getSnmpObjType(5)).toBe(SnmpObjType.Null);
        expect(getSnmpObjType(6)).toBe(SnmpObjType.OID);
        expect(getSnmpObjType(64)).toBe(SnmpObjType.IpAddress);
        expect(getSnmpObjType(65)).toBe(SnmpObjType.Counter);
        expect(getSnmpObjType(66)).toBe(SnmpObjType.Gauge);
        expect(getSnmpObjType(67)).toBe(SnmpObjType.TimeTicks);
        expect(getSnmpObjType(68)).toBe(SnmpObjType.Opaque);
        expect(getSnmpObjType(70)).toBe(SnmpObjType.Counter64);
        expect(getSnmpObjType(128)).toBe(SnmpObjType.NoSuchObject);
        expect(getSnmpObjType(129)).toBe(SnmpObjType.NoSuchInstance);
        expect(getSnmpObjType(130)).toBe(SnmpObjType.EndOfMibView);
    });

    it("should return OctetString for unknown type", () => {
        expect(getSnmpObjType(999)).toBe(SnmpObjType.OctetString);
        expect(getSnmpObjType(-1)).toBe(SnmpObjType.OctetString);
        expect(getSnmpObjType(0)).toBe(SnmpObjType.OctetString);
    });
});
