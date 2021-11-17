import { isValidHexColor } from "../lib/color";
import prisma from "../lib/prisma";
import { HasDto, IsModel, ModelUtil, Model } from "./ModelView";

export interface TagFields {
    name: string,
    color: string,
}

export interface TagDto extends TagFields {
    id: number
}

export class Tag extends Model<TagFields, TagDto> implements TagDto {
    public id: number = 0
    public name: string = ''
    public color: string = ''

    constructor(fields: Partial<TagFields> = {}) {
        super()
        Object.assign(this, fields)
    }

    toDto(): TagDto {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
        }
    }

    public static create(fields: TagFields): Promise<Tag> {
        return ModelUtil.create(Tag, fields)
    }

    edit(fields: Partial<TagFields>): Promise<Tag> {
        return ModelUtil.edit(Tag, fields, this.id)
    }

    delete(): Promise<void> {
        return ModelUtil.delete(Tag, this.id)
    }
}