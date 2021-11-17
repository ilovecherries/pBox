import prisma from "../lib/prisma"
import { IsModel, Model, ModelUtil } from "./ModelView"

export interface VoteFields {
    score: number
}

export interface VoteScore extends VoteFields {
    myScore: number
}

export interface VoteDto {}

export class Vote extends Model<VoteFields, VoteDto> implements VoteFields {
    readonly prismaDelegate = prisma.vote

    public id: number = 0
    public userId: number = 0
    public postId: number = 0
    public score: number = 0

    constructor(fields: Partial<Vote>) {
        super()
        Object.assign(this, fields)
    }

    edit(fields: Partial<VoteFields>): Promise<Vote> {
        return ModelUtil.edit(Vote, fields, this.id)
    }
    delete(): Promise<void> {
        return ModelUtil.delete(Vote, this.id)
    }

    toDto(): VoteDto {
        return {}
    }
}