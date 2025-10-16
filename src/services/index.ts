import { DevicesService } from "./devices.service";
import { SnmpPollingService } from "./snmp-polling.service";
import { Device, SnmpVersion } from "../models";

const snmpPollingService = new SnmpPollingService((deviceId, oid, results) => {
    console.log(`[${deviceId}] (${oid}): `, results);
});
const devicesService = new DevicesService(snmpPollingService);

export {
    devicesService
};