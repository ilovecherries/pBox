import { IronSessionOptions } from "iron-session"
import { ModelUtil } from "../views/ModelView"
import { User } from "../views/User"
import { IronSession } from "iron-session"
import prisma from "./prisma"

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
        Promise.reject(new Error('Not logged in'))
    }

    try {
        const user = await ModelUtil.getOne(User, prisma.user, userId as number)
        return Promise.resolve(user)
    } catch {
        return Promise.reject(new Error('User not found'))
    }
}