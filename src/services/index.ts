import { SnmpResult } from "../models";
import { DevicesService } from "./devices.service";
import { OidRecordsService } from "./oid-records.service";
import { SnmpPollingCallback, SnmpPollingService } from "./snmp-polling.service";

export * from "./snmp-polling.service";
export * from "./devices.service";
export * from "./oid-records.service";
export * from "./logger.service";

const oidRecordsService = new OidRecordsService();

const onNewValue: SnmpPollingCallback = (deviceId: number, oid: string, result: SnmpResult): void => {
    oidRecordsService.setValue(deviceId, oid, result);
};

const snmpPollingService = new SnmpPollingService(onNewValue);
const devicesService = new DevicesService(snmpPollingService);

export {
    devicesService,
    oidRecordsService
};