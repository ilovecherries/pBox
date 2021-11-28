
import prisma from "../lib/prisma";
import { Model, ModelUtil } from "./ModelView";

export interface CategoryFields {
    name: string
}

export interface CategoryDto extends CategoryFields  {
    id: number
}

export class Category extends Model<CategoryFields, CategoryDto> implements CategoryDto {
    readonly prismaDelegate = prisma.category

    id: number = 0
    name: string = ''

    constructor(categoryPartial: Partial<Category>) {
        super()
        Object.assign(this, categoryPartial)
    }

    toDto(): CategoryDto {
        return {
            id: this.id,
            name: this.name
        }
    }

    public static create(fields: CategoryFields): Promise<Category> {
        return ModelUtil.create(Category, fields)
    }

    edit(fields: Partial<CategoryFields>): Promise<Category> {
        return ModelUtil.edit(Category, fields, this.id)
    }

    delete(): Promise<void> {
        return ModelUtil.delete(Category, this.id)
    }
}