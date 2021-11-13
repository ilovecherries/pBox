import { IronSessionOptions } from "iron-session";

declare module "iron-session" {
    interface IronSessionData {
        userId?: number
    }
}


export const ironConfig: IronSessionOptions = {
    cookieName: 'pbox_session',
    password: process.env.ironKey as string
}