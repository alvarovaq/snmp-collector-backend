import { AlarmsService } from "../alarms.service";
import { AlarmsDBService } from "../alarms-db.service";
import { WebSocketService } from "../websocket.service";
import { Alarm, Rule, Severity, WSEvent } from "../../models";

jest.mock("../alarms-db.service", () => ({
    AlarmsDBService: {
        addAlarm: jest.fn(),
        removeAlarm: jest.fn(),
        updateReaded: jest.fn(),
        closeAlarms: jest.fn()
    }
}));

jest.mock("../websocket.service", () => ({
    WebSocketService: {
        broadcast: jest.fn()
    }
}));

describe("AlarmsService", () => {
    let service: AlarmsService;

    const rule: Rule = {
        id: 1,
        severity: Severity.MAJOR
    } as Rule;

    const baseAlarm: Alarm = {
        id: -1,
        deviceId: 10,
        oid: "1.3.6",
        ruleId: 1,
        severity: Severity.MAJOR,
        message: "rule",
        date: new Date(),
        closedAt: null,
        readed: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AlarmsService();
    });

    it("should create an alarm from rule", () => {
        const alarm = service.makeAlarm(10, "1.3.6", rule);

        expect(alarm.deviceId).toBe(10);
        expect(alarm.oid).toBe("1.3.6");
        expect(alarm.ruleId).toBe(1);
        expect(alarm.severity).toBe(Severity.MAJOR);
        expect(alarm.readed).toBe(false);
    });

    it("should add alarm and broadcast", async () => {
        (AlarmsDBService.addAlarm as jest.Mock).mockResolvedValue(5);

        const result = await service.addAlarm(baseAlarm);

        expect(result?.id).toBe(5);
        expect(service.getAlarm(5)).toBeDefined();
        expect(WebSocketService.broadcast).toHaveBeenCalledWith({
            event: WSEvent.UpdateAlarm,
            data: expect.objectContaining({ id: 5 })
        });
    });

    it("should not add alarm if db fails", async () => {
        (AlarmsDBService.addAlarm as jest.Mock).mockResolvedValue(-1);

        const result = await service.addAlarm(baseAlarm);

        expect(result).toBeUndefined();
        expect(service.getAlarms()).toHaveLength(0);
    });

    it("should remove alarm and broadcast", async () => {
        (AlarmsDBService.addAlarm as jest.Mock).mockResolvedValue(3);
        (AlarmsDBService.removeAlarm as jest.Mock).mockResolvedValue(true);

        await service.addAlarm(baseAlarm);
        const result = await service.removeAlarm(3);

        expect(result).toBe(true);
        expect(service.getAlarm(3)).toBeUndefined();
        expect(WebSocketService.broadcast).toHaveBeenCalledWith({
            event: WSEvent.RemoveAlarm,
            data: 3
        });
    });

    it("should not remove non existing alarm", async () => {
        const result = await service.removeAlarm(99);

        expect(result).toBe(false);
    });

    it("should mark alarm as readed", async () => {
        (AlarmsDBService.addAlarm as jest.Mock).mockResolvedValue(7);
        (AlarmsDBService.updateReaded as jest.Mock).mockResolvedValue(true);

        await service.addAlarm(baseAlarm);
        const alarm = await service.readAlarm(7, true);

        expect(alarm?.readed).toBe(true);
    });

    it("should return undefined when reading non existing alarm", async () => {
        const result = await service.readAlarm(1, true);

        expect(result).toBeUndefined();
    });

    it("should find alarm by device, oid and rule", async () => {
        (AlarmsDBService.addAlarm as jest.Mock).mockResolvedValue(8);

        await service.addAlarm(baseAlarm);
        const id = service.findAlarm(10, "1.3.6", 1);

        expect(id).toBe(8);
    });
});
