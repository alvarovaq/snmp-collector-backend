import { devicesService } from "./services";
import { Device, SnmpV3AuthProtocol, SnmpV3PrivProtocol, SnmpV3SecurityLevel, SnmpVersion } from "./models";

export function initializeServices() {
    const device01: Device = {
        id: -1,
        name: "Device01",
        config: {
            ip: "localhost",
            port: 16101,
            version: SnmpVersion.Version2c,
            community: "public"
        },
        oids: [
            { name: "sysDescr", oid: "1.3.6.1.2.1.1.1.0", frequency: 30 },
            { name: "sysObjectID", oid: "1.3.6.1.2.1.1.2.0", frequency: 30 },
            { name: "sysUpTime", oid: "1.3.6.1.2.1.1.3.0", frequency: 20 },
            { name: "ifPhysAddress_2", oid: "1.3.6.1.2.1.2.2.1.6.2", frequency: 30 },
            { name: "ipNetToMediaPhysAddress", oid: "1.3.6.1.2.1.4.22.1.3.2.192.21.54.7", frequency: 30 },
        ]
    };

    const device02: Device = {
        id: -1,
        name: "Device02",
        config: {
            ip: "localhost",
            port: 16102,
            version: SnmpVersion.Version3,
            context: "public",
            security: {
                user: "user2",
                level: SnmpV3SecurityLevel.NoAuthNoPriv
            }
        },
        oids: [
            { name: "sysDescr", oid: "1.3.6.1.2.1.1.1.0", frequency: 30 },
            { name: "sysObjectID", oid: "1.3.6.1.2.1.1.2.0", frequency: 30 },
            { name: "sysUpTime", oid: "1.3.6.1.2.1.1.3.0", frequency: 15 },
            { name: "ifPhysAddress_2", oid: "1.3.6.1.2.1.2.2.1.6.2", frequency: 30 },
            { name: "ipNetToMediaPhysAddress", oid: "1.3.6.1.2.1.4.22.1.3.2.192.21.54.7", frequency: 30 },
        ]
    };

    const device03: Device = {
        id: -1,
        name: "Device03",
        config: {
            ip: "localhost",
            port: 16103,
            version: SnmpVersion.Version3,
            context: "public",
            security: {
                user: "user3",
                level: SnmpV3SecurityLevel.AuthNoPriv,
                authProtocol: SnmpV3AuthProtocol.MD5,
                authKey: "authpass"
            }
        },
        oids: [
            { name: "sysDescr", oid: "1.3.6.1.2.1.1.1.0", frequency: 30 },
            { name: "sysObjectID", oid: "1.3.6.1.2.1.1.2.0", frequency: 30 },
            { name: "sysUpTime", oid: "1.3.6.1.2.1.1.3.0", frequency: 10 },
            { name: "ifPhysAddress_2", oid: "1.3.6.1.2.1.2.2.1.6.2", frequency: 30 },
            { name: "ipNetToMediaPhysAddress", oid: "1.3.6.1.2.1.4.22.1.3.2.192.21.54.7", frequency: 30 },
        ]
    };

    const device04: Device = {
        id: -1,
        name: "Device04",
        config: {
            ip: "localhost",
            port: 16104,
            version: SnmpVersion.Version3,
            context: "public",
            security: {
                user: "user4",
                level: SnmpV3SecurityLevel.AuthPriv,
                authProtocol: SnmpV3AuthProtocol.SHA,
                authKey: "authpass",
                privProtocol: SnmpV3PrivProtocol.AES,
                privKey: "privpass"
            }
        },
        oids: [
            { name: "sysDescr", oid: "1.3.6.1.2.1.1.1.0", frequency: 30 },
            { name: "sysObjectID", oid: "1.3.6.1.2.1.1.2.0", frequency: 30 },
            { name: "sysUpTime", oid: "1.3.6.1.2.1.1.3.0", frequency: 10 },
            { name: "ifPhysAddress_2", oid: "1.3.6.1.2.1.2.2.1.6.2", frequency: 30 },
            { name: "ipNetToMediaPhysAddress", oid: "1.3.6.1.2.1.4.22.1.3.2.192.21.54.7", frequency: 30 },
        ]
    };

    devicesService.addDevice(device01);
    devicesService.addDevice(device02);
    devicesService.addDevice(device03);
    devicesService.addDevice(device04);
}