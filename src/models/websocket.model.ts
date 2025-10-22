export enum WSEvent {
    UpdateRecord = 0,
    Other
}

export interface WSMessage {
    event: WSEvent;
    data: any
}