import { resolve } from "path/posix"
import prisma from "../lib/prisma"
import { HasDto } from "./ModelView"

export interface UserDto {
    id: number
    username: string
    operator: boolean
}

export class User implements UserDto, HasDto<UserDto> {
    public id: number = -1
    public username: string = ""
    public operator: boolean = false
    public hashed_password: string = ""
    public salt: string = ""

    public constructor(userPartial: Partial<User> = {}) {
        Object.assign(this, userPartial);
    }

    toDto(): UserDto {
        return {
            id: this.id,
            username: this.username,
            operator: this.operator
        };
    }

    delete(): Promise<void> {
        // when we delete the user, we also want to delete the
        // user's posts and votes
        return prisma.post.deleteMany({where: {authorId: this.id}}).then(() => {
            prisma.vote.deleteMany({where: {userId: this.id}}).then(() => {
                prisma.user.delete({where: {id: this.id}}).then(() => {
                    Promise.resolve()
                })
            })
        })
    }
}