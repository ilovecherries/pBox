import { IsModel } from "./ModelView";

export class Category implements IsModel {
    id: number = 0
    name: string = ''

    constructor(categoryPartial: Partial<Category>) {
        Object.assign(this, categoryPartial)
    }
}