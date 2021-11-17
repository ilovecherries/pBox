import { resolve } from "path/posix"
import prisma from "../lib/prisma"
import { HasDto, Model, ModelUtil } from "./ModelView"

export interface UserFields {
    username: string
    operator: boolean
    password: string
}

export interface UserDto {
    id: number
    username: string
    operator: boolean
}

export class User extends Model<UserFields, UserDto> implements UserDto {
    readonly prismaDelegate = prisma.user

    public id: number = -1
    public username: string = ""
    public operator: boolean = false
    public hashed_password: string = ""
    public salt: string = ""

    public constructor(fields: Partial<User> = {}) {
        super()
        Object.assign(this, fields)
    }

    toDto(): UserDto {
        return {
            id: this.id,
            username: this.username,
            operator: this.operator
        }
    }

    edit(fields: Partial<UserFields>): Promise<User> {
        return ModelUtil.edit(User, this.id, fields)
    }

    delete(): Promise<void> {
        return ModelUtil.delete(User, this.id)
    }
}