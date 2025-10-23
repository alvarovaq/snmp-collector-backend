import { SnmpResult } from "../models";
import { DevicesService } from "./devices.service";
import { OidRecordsService } from "./oid-records.service";
import { SnmpPollingService } from "./snmp-polling.service";

export * from "./snmp-polling.service";
export * from "./devices.service";
export * from "./oid-records.service";
export * from "./logger.service";

const oidRecordsService = new OidRecordsService();
const snmpPollingService = new SnmpPollingService(oidRecordsService);
const devicesService = new DevicesService(snmpPollingService);

export {
    devicesService,
    oidRecordsService
};