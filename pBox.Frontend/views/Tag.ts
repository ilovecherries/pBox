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
    readonly prismaDelegate = prisma.tag

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

    static async verifyFields(fields: Partial<TagFields>) {
        if (fields.name !== undefined) { 
            const post = await prisma.tag.findUnique({ where: { name: fields.name }})
            if (post !== null) {
                throw new Error("tag with this name already exists")
            }
        }
    }

    public static async create(fields: TagFields): Promise<Tag> {
        await Tag.verifyFields(fields)
        return ModelUtil.create(Tag, fields)
    }

    async edit(fields: Partial<TagFields>): Promise<Tag> {
        await Tag.verifyFields(fields)
        return ModelUtil.edit(Tag, fields, this.id)
    }

    delete(): Promise<void> {
        return ModelUtil.delete(Tag, this.id)
    }
}