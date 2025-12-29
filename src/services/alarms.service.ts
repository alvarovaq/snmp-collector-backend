import { Alarm, Rule, WSMessage, WSEvent } from "../models";
import { ruleToString } from "../utils/rules";
import { logger } from "./logger.service";
import { WebSocketService } from "./websocket.service";

export class AlarmsService {
    private alarms: Map<number, Alarm> = new Map();
    private id: number = 0;

    constructor() {
        this.loadAlarms();
    }

    private async loadAlarms(): Promise<void> {
        logger.info("Loading alarms from BBDD", "AlarmsService");
        
        //TODO: Cargar alarmas de BBDD
        const alarms = [];

        logger.info(`${alarms.length} alarms loaded`, "AlarmsService");
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

    public addAlarm(alarm: Alarm): Alarm | undefined {
        const newAlarm = { ...alarm, id: this.id };
        this.alarms.set(this.id, newAlarm);
        this.id = this.id + 1;
        
        //TODO: Modificar en BBDD

        const msg: WSMessage = {
            event: WSEvent.UpdateAlarm,
            data: newAlarm
        };
        WebSocketService.broadcast(msg);

        return newAlarm;
    }

    public removeAlarm(alarmId: number): boolean {
        if (!this.alarms.has(alarmId))
            return false;

        //TODO: Modificar en BBDD

        const msg: WSMessage = {
            event: WSEvent.RemoveAlarm,
            data: alarmId
        };
        WebSocketService.broadcast(msg);

        this.alarms.delete(alarmId);
        return true;
    }
}