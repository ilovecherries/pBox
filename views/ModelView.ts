export interface HasDto<T> {
    toDto(): T
}

export abstract class Model<T, U> {
    readonly prismaDelegate: any

    public id: number = 0

    // constructor(partial: any) {
    //     Object.assign(this, partial)
    // }

    abstract edit(fields: Partial<T>): Promise<Model<T, U>>
    abstract delete(): Promise<void>

    abstract toDto(): U
}

export interface IsModel<T, U, V> {
    id: number

    readonly prismaDelegate: any

    edit(fields: U): Promise<T>
}

export class ModelUtil {
    public static getList<V, U, T extends Model<U, V>>(
        ctor: new (p: Partial<T>) => T,
        options: any = {}
    ): Promise<T[]> {
        const v = new ctor({})

        if (v.prismaDelegate.findMany === undefined) {
            throw new Error('v.prismaDelegate needs to be a Prisma delegate')
        }

        return v.prismaDelegate.findMany(options)
            .then((models: Partial<T>[]) => 
                models.map(model => new ctor(model)))
    }

    public static create<V, U, T extends Model<U, V>>(
        ctor: new (p: Partial<T>) => T,
        data: any,
        options: any = {}
    ): Promise<T> {
        const v = new ctor({})

        if (v.prismaDelegate.create === undefined) {
            throw new Error('v.prismaDelegate needs to be a Prisma delegate')
        }
        Object.assign(options, {data})

        return v.prismaDelegate.create(options)
            .then((model: Partial<T>) => new ctor(model))
    }

    static transformOptions(options: any) {
        if (!isNaN(options)) {
            options = { where: { id: options } }
        }

        return options
    }

    public static async edit<V, X, T extends Model<V, X>>(
        ctor: new (p: Partial<T>) => T,
        o: any,
        options: any
    ): Promise<T> {
        const v = new ctor({})

        if (v.prismaDelegate.update === undefined) {
            throw new Error('v.prismaDelegate needs to be a Prisma delegate')
        }

        options = ModelUtil.transformOptions(options)
        Object.assign(options, {data: o})

        const model = await v.prismaDelegate.update(options)

        if (model === null) {
            throw new Error(`${ctor.toString()} not found`)
        }

        return new ctor(model as Partial<T>)
    }

    public static delete<U, V, T extends Model<U, V>>(
        ctor: new (p: Partial<T>) => T,
        options: any
    ): Promise<void> {
        const v = new ctor({})

        if (v.prismaDelegate.delete === undefined) {
            throw new Error('v.prismaDelegate needs to be a Prisma delegate')
        }

        options = ModelUtil.transformOptions(options)

        return v.prismaDelegate.delete(options)
    }

    public static deleteMany<U, V, T extends Model<U, V>>(
        ctor: new (p: Partial<T>) => T,
        options: any
    ): Promise<void> {
        const v = new ctor({})

        if (v.prismaDelegate.deleteMany === undefined) {
            throw new Error('v.prismaDelegate needs to be a Prisma delegate')
        }

        options = ModelUtil.transformOptions(options)

        return v.prismaDelegate.deleteMany(options)
    }

    public static async getUnique<U, V, T extends Model<U, V>>(
        ctor: new (p: Partial<T>) => T,
        options: any
    ): Promise<T> {
        const v = new ctor({})

        if (v.prismaDelegate.findUnique === undefined) {
            throw new Error('v.prismaDelegate needs to be a Prisma delegate')
        }

        options = ModelUtil.transformOptions(options)

        const model = await v.prismaDelegate.findUnique(options)

        if (model === null) {
            throw new Error(`${ctor.toString()} not found`)
        }

        return new ctor(model as Partial<T>)
    }
}