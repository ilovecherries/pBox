import { IronSessionOptions } from "iron-session";

export const ironConfig: IronSessionOptions = {
    cookieName: 'pbox_session',
    password: process.env.ironKey as string
}