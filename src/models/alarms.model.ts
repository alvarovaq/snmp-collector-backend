import { Severity } from "./rules.model";

export interface Alarm {
    id: number;
    ruleId: number;
    deviceId: number;
    oid: string;
    severity: Severity;
    message: string;
    date: Date;
    closedAt: Date | null;
    readed: boolean;
}