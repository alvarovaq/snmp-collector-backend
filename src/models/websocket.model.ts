export enum WSEvent {
    UpdateRecord = "UpdateRecord",
    RemoveRecord = "RemoveRecord",
    UpdateDevice = "UpdateDevice",
    RemoveDevice = "RemoveDevice",
    Other = "Other"
}

export interface WSMessage {
    event: WSEvent;
    data: any
}