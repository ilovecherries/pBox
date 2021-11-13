import { IsModel } from "./ModelView"

export class Vote implements IsModel{
    public id: number = 0
    public userId: number = 0
    public postId: number = 0
    public score: number = 0

    constructor(vote: Partial<Vote>) {
        Object.assign(this, vote)
    }
}