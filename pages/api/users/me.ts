import type { NextApiRequest, NextApiResponse } from 'next'
import { ironConfig, sessionWrapper } from '../../../lib/ironconfig'
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
    sessionWrapper(req.session).then(user => {
        switch (req.method) {
            case 'GET':
                getUser()
                break
            case 'POST':
                putUser()
                break
            case 'DELETE':
                deleteUser()
                break
            default:
                res.status(405).json({ error: "Method not allowed" })
        }

        function getUser() {
            res.status(200).json({ user: user.toDto() })
        }

        function putUser() {
            const { username } = req.body
            prisma.user.update({
                where: {id: user.id},
                data: {
                    username: username ?? user.username, 
                }
            }).then((user: Partial<User> | null) => {
                if (user === null) {
                    res.status(404).json({ error: "User not found" })
                    return
                }

                res.status(200).json({ user: new User(user).toDto() })
            })
        }

        function deleteUser() {
            user.delete().then(() => {
                res.status(201).json({ user: user.toDto() })
            });
        }
    })
    .catch(e => res.status(401).json({ error: e.message }))
}
