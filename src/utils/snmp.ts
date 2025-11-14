import { SnmpObjType } from "../models";

export function getSnmpObjType(type: number): SnmpObjType {
    switch (type) {
        case 1:
            return SnmpObjType.Boolean;
        case 2:
            return SnmpObjType.Integer;
        case 3:
            return SnmpObjType.BitString;
        case 4:
            return SnmpObjType.OctetString;
        case 5:
            return SnmpObjType.Null;
        case 6:
            return SnmpObjType.OID;
        case 64:
            return SnmpObjType.IpAddress;
        case 65:
            return SnmpObjType.Counter;
        case 66:
            return SnmpObjType.Gauge;
        case 67:
            return SnmpObjType.TimeTicks;
        case 68:
            return SnmpObjType.Opaque;
        case 70:
            return SnmpObjType.Counter64;
        case 128:
            return SnmpObjType.NoSuchObject;
        case 129:
            return SnmpObjType.NoSuchInstance;
        case 130:
            return SnmpObjType.EndOfMibView;
        default:
            return SnmpObjType.OctetString;
    }
}