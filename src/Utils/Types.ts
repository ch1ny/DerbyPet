export enum UmasMapActionTypes {
    ADD_INTO_UMA_MUSUMES_LIST,
    REMOVE_FROM_UMA_MUSUMES_LIST,
    INIT_UMA_MUSUMES_LIST
}
export interface UmasMapPayloadPic {
    url: string,
    modify: boolean
}
export interface UmasMapPayloadAudio {
    click: string,
    start: string
}
export interface UmasMapPayload {
    key: string,
    label?: string,
    pic?: [UmasMapPayloadPic, UmasMapPayloadPic],
    audio?: UmasMapPayloadAudio
}