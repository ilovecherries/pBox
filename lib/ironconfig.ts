import { IronSessionOptions } from "iron-session"
import { ModelUtil } from "../views/ModelView"
import { User } from "../views/User"
import { IronSession } from "iron-session"
import useSWR from 'swr'

declare module "iron-session" {
    interface IronSessionData {
        userId?: number
    }
}

export const ironConfig: IronSessionOptions = {
    cookieName: 'pbox_session',
    password: process.env.ironKey as string
}

export async function sessionWrapper(session: IronSession): Promise<User> {
    const { userId } = session

    if (userId === undefined) {
        throw new Error('Not logged in')
    }

    return ModelUtil.getUnique(User, userId as number)
}

export async function getUser(session: IronSession): Promise<User | undefined> {
    if (session === undefined) {
        return undefined
    }

    const { userId } = session

    if (userId === undefined) {
        return undefined
    }

    return ModelUtil.getUnique(User, userId as number).catch(() => undefined)
}
