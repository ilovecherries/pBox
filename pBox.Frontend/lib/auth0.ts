import { getSession } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'

interface UserInfoOutput {
    userId: string
    operator: boolean
}

export function getUserInfo(req: NextApiRequest, res: NextApiResponse): UserInfoOutput {
    const session = getSession(req, res)
    const user = session!.user
    return {
        userId: user.sub,
        operator: user[`${process.env['AUTH0_BASE_URL']}.Operator`] ?? false
    }
}