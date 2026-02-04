import { RulesService } from "../rules.service";
import { RulesDBService } from "../rules-db.service";
import { WebSocketService } from "../websocket.service";
import { DevicesService } from "../devices.service";
import { AlarmsService } from "../alarms.service";
import { Rule, Operator, Severity, WSEvent } from "../../models";
import { logger } from "../logger.service";
import { checkRule } from "../../utils/rules";
import { SnmpPollingService } from "../snmp-polling.service";
import { OidRecordsService } from "../oid-records.service";

jest.mock("../rules-db.service");
jest.mock("../websocket.service");
jest.mock("../logger.service");
jest.mock("../devices.service");
jest.mock("../alarms.service");
jest.mock("../../utils/rules");

describe("RulesService", () => {
    let service: RulesService;
    let oidRecordsService: jest.Mocked<OidRecordsService>;
    let snmpPollingService: jest.Mocked<SnmpPollingService>;
    let devicesService: jest.Mocked<DevicesService>;
    let alarmsService: jest.Mocked<AlarmsService>;

    beforeEach(() => {
        (RulesDBService.getRules as jest.Mock).mockResolvedValue([]);
        oidRecordsService = new OidRecordsService() as jest.Mocked<OidRecordsService>;
        snmpPollingService = new SnmpPollingService(oidRecordsService) as jest.Mocked<SnmpPollingService>;
        devicesService = new DevicesService(snmpPollingService) as jest.Mocked<DevicesService>;
        alarmsService = new AlarmsService() as jest.Mocked<AlarmsService>;
        service = new RulesService(devicesService, alarmsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should load rules on creation", async () => {
        (RulesDBService.getRules as jest.Mock).mockResolvedValue([
            { id: 1, name: "R1", operator: Operator.GREATER_THAN, threshold: "5", severity: Severity.CRITICAL }
        ]);

        service = new RulesService(devicesService, alarmsService);
        await new Promise(process.nextTick); // wait async loadRules

        const rules = service.getRules();
        expect(rules).toHaveLength(1);
        expect(rules[0].id).toBe(1);
    });

    it("should add a new rule and broadcast", async () => {
        (RulesDBService.addRule as jest.Mock).mockResolvedValue(10);

        const rule: Rule = { id: 0, name: "Test", operator: Operator.EQUAL, threshold: "1", severity: Severity.MINOR };
        const added = await service.addRule(rule);

        expect(added).toEqual({ ...rule, id: 10 });
        expect(service.getRule(10)).toEqual({ ...rule, id: 10 });
        expect(WebSocketService.broadcast).toHaveBeenCalledWith({
            event: WSEvent.UpdateRule,
            data: { ...rule, id: 10 }
        });
        expect(logger.info).toHaveBeenCalled();
    });

    it("should return undefined if addRule fails", async () => {
        (RulesDBService.addRule as jest.Mock).mockResolvedValue(-1);

        const rule: Rule = { id: 0, name: "Fail", operator: Operator.EQUAL, threshold: "1", severity: Severity.INFO };
        const added = await service.addRule(rule);

        expect(added).toBeUndefined();
        expect(WebSocketService.broadcast).not.toHaveBeenCalled();
    });

    it("should update existing rule and broadcast", async () => {
        const rule: Rule = { id: 1, name: "R1", operator: Operator.EQUAL, threshold: "1", severity: Severity.INFO };
        service["rules"].set(1, rule);

        (RulesDBService.updateRule as jest.Mock).mockResolvedValue(true);

        const updatedRule = { ...rule, name: "Updated" };
        const result = await service.updateRule(updatedRule);

        expect(result).toEqual(updatedRule);
        expect(service.getRule(1)).toEqual(updatedRule);
        expect(WebSocketService.broadcast).toHaveBeenCalledWith({
            event: WSEvent.UpdateRule,
            data: updatedRule
        });
    });

    it("should return undefined when updating non-existent rule", async () => {
        const result = await service.updateRule({ id: 99, name: "X", operator: Operator.EQUAL, threshold: "0", severity: Severity.INFO });
        expect(result).toBeUndefined();
        expect(WebSocketService.broadcast).not.toHaveBeenCalled();
    });

    it("should remove existing rule and broadcast", async () => {
        const rule: Rule = { id: 1, name: "R1", operator: Operator.EQUAL, threshold: "1", severity: Severity.INFO };
        service["rules"].set(1, rule);
        (RulesDBService.removeRule as jest.Mock).mockResolvedValue(true);

        const removed = await service.removeRule(1);

        expect(removed).toBe(true);
        expect(service.getRule(1)).toBeUndefined();
        expect(devicesService.removeRule).toHaveBeenCalledWith(1);
        expect(WebSocketService.broadcast).toHaveBeenCalledWith({
            event: WSEvent.RemoveRule,
            data: 1
        });
    });

    it("should return false when removing non-existent rule", async () => {
        const removed = await service.removeRule(99);
        expect(removed).toBe(false);
        expect(WebSocketService.broadcast).not.toHaveBeenCalled();
    });

    it("should check value and add alarm if rule satisfied", async () => {
        const rule: Rule = { id: 1, name: "R1", operator: Operator.EQUAL, threshold: "5", severity: Severity.CRITICAL };
        service["rules"].set(1, rule);
        devicesService.getRules.mockReturnValue([1]);
        alarmsService.findAlarm.mockReturnValue(undefined);
        (checkRule as jest.Mock).mockReturnValue(true);

        service.checkValue("5", 1, "oid1");

        expect(alarmsService.addAlarm).toHaveBeenCalled();
    });

    it("should remove alarm if rule not satisfied", async () => {
        const rule: Rule = { id: 1, name: "R1", operator: Operator.EQUAL, threshold: "5", severity: Severity.CRITICAL };
        service["rules"].set(1, rule);
        devicesService.getRules.mockReturnValue([1]);
        alarmsService.findAlarm.mockReturnValue(123);
        (checkRule as jest.Mock).mockReturnValue(false);

        service.checkValue("0", 1, "oid1");

        expect(alarmsService.removeAlarm).toHaveBeenCalledWith(123);
    });
});
