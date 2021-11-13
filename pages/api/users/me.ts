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

async function userHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    if (req.method !== "GET" && 
        req.method !== "PUT" &&
        req.method !== "DELETE") {
            res.status(405).json({ error: "Method not allowed" })
    } 

    const { userId } = req.session

    if (userId === undefined) {
        res.status(401).json({ error: 'not logged in' })
        return
    }

    const user = await prisma.user.findUnique({where: {id: userId}})

    if (user === null) {
        res.status(403).json({error: "user not found"});
    }

    const userD = new User(user as Partial<User>)

    if (req.method === "GET") {
        res.status(200).json({user: userD.toDto()})
    } else if (req.method === "PUT") {
        const { username } = req.body
        prisma.user.update({
            where: {id: userId},
            data: {
                username: username ?? userD.username, 
            }
        }).then((user: Partial<User> | null) => {
            if (user === null) {
                res.status(404).json({error: "User not found"})
                return
            }

            res.status(200).json({user: new User(user).toDto()})
        })
    } else if (req.method === "DELETE") {
        userD.delete().then(() => {
            res.status(201).json({user: userD.toDto()})
        });
    }

    let dto = new User(user as Partial<User>).toDto()
    res.json({user: dto})
}