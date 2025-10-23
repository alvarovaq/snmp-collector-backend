export enum WSEvent {
    UpdateRecords = "UpdateRecords",
    RemoveRecords = "RemoveRecords",
    UpdateDevice = "UpdateDevice",
    RemoveDevice = "RemoveDevice",
    Other = "Other"
}

export interface WSMessage {
    event: WSEvent;
    data: any
}