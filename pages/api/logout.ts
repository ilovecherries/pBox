import type { NextApiRequest, NextApiResponse } from 'next'
import { ironConfig, sessionWrapper } from '../../lib/ironconfig'
import { withIronSessionApiRoute } from "iron-session/next";
import { User, UserDto } from '../../views/User'
import { login } from '../../lib/auth';

export default withIronSessionApiRoute(logoutHandler, ironConfig)

type StatusData = {
    error?: string
    user?: UserDto
}

async function logoutHandler(
    req: any, 
    res: NextApiResponse<StatusData>
) {
    if (req.method !== 'POST') {
        res.status(405).end()
        return
    }

    await sessionWrapper(req.session).then(async () => {
        await req.session.destroy()
        res.status(200).end()
    }).catch((e: Error) => { res.status(401).json({ error: e.message }) })
}