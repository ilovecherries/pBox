import type { NextApiRequest, NextApiResponse } from 'next'
import { ironConfig } from '../../../lib/ironconfig'
import { withIronSessionApiRoute } from "iron-session/next";
import prisma from '../../../lib/prisma'
import { User, UserDto } from '../../../views/User'

export default withIronSessionApiRoute(userHandler, ironConfig)

type StatusData = {
    error?: string
    user?: UserDto
}

function userHandler(
    req: any,
    res: NextApiResponse<StatusData>
) {
    const userId = req.session.userId as number

    if (userId === undefined) {
        res.status(401).json({ error: 'not logged in' })
        return
    }

    prisma.user.findUnique({
        where: {
            id: req.session.userId
        }
    }).then((user: Partial<User> | null) => {
        if (user == null) {
            res.status(404).json({error: "user not found"});
        }

        let dto = new User(user as Partial<User>).toDto()
        res.json({user: dto})
    })
}
