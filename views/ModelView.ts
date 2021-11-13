import { rejects } from "assert"

export interface HasDto<T> {
    toDto(): T
}

export interface IsModel {
    id: number
}

export class ModelUtil {
    public static getList<T extends IsModel>(
        ctor: new (p: Partial<T>) => T,
        delegate: any,
        options: any = {}
    ): Promise<T[]> {
        if (delegate.findMany === undefined) {
            throw new Error('delegate needs to be a Prisma delegate')
        }

        return delegate.findMany(options)
            .then((models: Partial<T>[]) => 
                models.map(model => new ctor(model)))
    }

    public static getOne<T extends IsModel>(
        ctor: new (p: Partial<T>) => T,
        delegate: any,
        id: number
    ): Promise<T> {
        if (delegate.findUnique === undefined) {
            throw new Error('delegate needs to be a Prisma delegate')
        }

        return delegate.findUnique({ where: { id } })
            .then((model: Partial<T> | null) => {
                if (model === null) {
                    Promise.reject(new Error(`${ctor.toString()} not found`))
                }

                new ctor(model as T)
            })
    }
}