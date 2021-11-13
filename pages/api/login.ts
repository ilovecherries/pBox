import type { NextApiRequest, NextApiResponse } from 'next'
import { ironConfig } from '../../lib/ironconfig'
import { withIronSessionApiRoute } from "iron-session/next";
import { User, UserDto } from '../../views/User'
import { login } from '../../lib/auth';

export default withIronSessionApiRoute(loginHandler, ironConfig)

type StatusData = {
    error?: string
    user?: UserDto
}

function loginHandler(
    req: any, 
    res: NextApiResponse<StatusData>
) {
    if (req.method !== 'POST') {
        res.status(405).end()
        return
    }

    const { username, password } = req.body;

    if (username === undefined || password === undefined) {
        res.status(400).json({ error: 'username and password required' })
        return
    }

    login(username, password)
    .then(async (user: User | undefined) => {
        if (user === undefined) {
            res.status(401).json({ error: 'invalid username or password' })
        }

        req.session.userId = user!.id;
        await req.session.save();
        const dto = user!.toDto()
        res.status(200).json({ user: dto })
    })
    .catch((err: Error) => {res.status(400).json({ error: err.message })});
}