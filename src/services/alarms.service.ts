import { Alarm, Rule, WSMessage, WSEvent } from "../models";
import { ruleToString } from "../utils/rules";
import { AlarmsDBService } from "./alarms-db.service";
import { logger } from "./logger.service";
import { WebSocketService } from "./websocket.service";

export class AlarmsService {
    private alarms: Map<number, Alarm> = new Map();

    constructor() {
        AlarmsDBService.closeAlarms();
    }

    public getAlarms(): Alarm[] {
        return Array.from(this.alarms.values());
    }

    public getAlarm(alarmId: number): Alarm | undefined {
        return this.alarms.get(alarmId);
    }

    public makeAlarm(deviceId: number, oid: string, rule: Rule): Alarm {
        const alarm: Alarm = {
            id: -1,
            deviceId: deviceId,
            oid: oid,
            ruleId: rule.id,
            severity: rule.severity,
            message: ruleToString(rule),
            date: new Date(),
            closedAt: null,
            readed: false
        };
        
        return alarm;
    }

    public findAlarm(deviceId: number, oid: string, ruleId: number): number | undefined {
        const alarm = [...this.alarms.values()].find(alarm => alarm.deviceId === deviceId && alarm.oid === oid && alarm.ruleId === ruleId);
        return alarm?.id;
    }

    public async addAlarm(alarm: Alarm): Promise<Alarm | undefined> {
        const id = await AlarmsDBService.addAlarm(alarm);
        if (id === -1)
            return undefined;

        const newAlarm = { ...alarm, id: id };
        this.alarms.set(id, newAlarm);

        const msg: WSMessage = {
            event: WSEvent.UpdateAlarm,
            data: newAlarm
        };
        WebSocketService.broadcast(msg);

        return newAlarm;
    }

    public async removeAlarm(alarmId: number): Promise<boolean> {
        if (!this.alarms.has(alarmId))
            return false;

        const ok = await AlarmsDBService.removeAlarm(alarmId);
        if (!ok)
            return false;

        const msg: WSMessage = {
            event: WSEvent.RemoveAlarm,
            data: alarmId
        };
        WebSocketService.broadcast(msg);

        this.alarms.delete(alarmId);
        return true;
    }

    public async readAlarm(alarmId: number, readed: boolean): Promise<Alarm | undefined> {
        const alarm = this.alarms.get(alarmId);
        if (!alarm)
            return undefined;

        alarm.readed = readed;
        const ok = await AlarmsDBService.updateReaded(alarmId, readed);
        if (!ok)
            return undefined;

        this.alarms.set(alarmId, alarm);

        return alarm;
    }
}