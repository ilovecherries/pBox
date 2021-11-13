import { IsModel } from "./ModelView";

export class Tag implements IsModel {
    public id: number = -1
    public name: string = ''

    constructor(tagPartial: Partial<Tag> = {}) {
        Object.assign(this, tagPartial)
    }
}