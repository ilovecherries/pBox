export class Tag {
    constructor(tagPartial: Partial<Tag> = {}) {
        Object.assign(this, tagPartial);
    }
}