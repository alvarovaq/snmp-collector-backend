import { DevicesService } from "./devices.service";
import { OidRecordsService } from "./oid-records.service";
import { SnmpPollingService } from "./snmp-polling.service";
import { UsersService } from "./users.service";
import { AuthService } from "./auth.service";
import { RulesService } from "./rules.service";
import { AlarmsService } from "./alarms.service";

export * from "./snmp-polling.service";
export * from "./devices.service";
export * from "./oid-records.service";
export * from "./logger.service";

const alarmsService = new AlarmsService();
const oidRecordsService = new OidRecordsService();
const snmpPollingService = new SnmpPollingService(oidRecordsService);
const devicesService = new DevicesService(snmpPollingService);
const authService = new AuthService();
const usersService = new UsersService(authService);
const rulesService = new RulesService(devicesService, alarmsService);

snmpPollingService.setRulesService(rulesService);

export {
    devicesService,
    oidRecordsService,
    authService,
    usersService,
    rulesService,
    alarmsService,
};