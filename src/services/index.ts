import { SnmpResult } from "../models";
import { DevicesService } from "./devices.service";
import { OidRecordsService } from "./oid-records.service";
import { SnmpPollingService } from "./snmp-polling.service";
import { SnmpTrapListenerService } from "./snmp-trap-listener.service";
import { env } from "../config/env";

export * from "./snmp-polling.service";
export * from "./devices.service";
export * from "./oid-records.service";
export * from "./logger.service";

const oidRecordsService = new OidRecordsService();
const snmpPollingService = new SnmpPollingService(oidRecordsService);
const devicesService = new DevicesService(snmpPollingService);
const snmpTrapListenerService = new SnmpTrapListenerService(env.snmp.port);

process.on("SIGINT", () => {
    snmpTrapListenerService.stop();
    process.exit();
});

process.on("SIGTERM", () => {
    snmpTrapListenerService.stop();
    process.exit();
});

export {
    devicesService,
    oidRecordsService
};