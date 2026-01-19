export enum WSEvent {
    UpdateRecords = "UpdateRecords",
    RemoveRecords = "RemoveRecords",
    UpdateDevice = "UpdateDevice",
    RemoveDevice = "RemoveDevice",
    UpdateRule = "UpdateRule",
    RemoveRule = "RemoveRule",
    UpdateAlarm = "UpdateAlarm",
    RemoveAlarm = "RemoveAlarm",
    Other = "Other",
}

export interface WSMessage {
    event: WSEvent;
    data: any;
}