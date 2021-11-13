import { getIronSession } from "iron-session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ironConfig } from "../../../lib/ironconfig";
import prisma from "../../../lib/prisma";
import { User, UserDto } from "../../../views/User";

export default withIronSessionApiRoute(usersHandler, ironConfig)

type StatusData = {
    error?: string,
    users?: UserDto[]
}

function usersHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    // getting the users should be an admin only action as the
    // intent is to have the users be anonymous
    if (req.method === 'GET') {
        const userId = req.session.userId

        if (userId === undefined) {
            res.status(401).json({ error: 'not logged in' })
            return
        }

        prisma.user.findUnique({where: { id: userId }})
        .then((user: Partial<User> | null) => {
            if (user === null) {
                res.status(403).json({ error: 'user not found' })
                return
            }

            const userD = new User(user);

            if (userD.operator === false) {
                res.status(403).json({ error: 'not authorized' })
                return
            }

            prisma.user.findMany().then((users: Array<Partial<User>>) => {
                const userDtos: UserDto[] = users.map((user: Partial<User>) => 
                    new User(user).toDto()
                )
                res.status(200).json({
                    users: userDtos
                })
            })
        })

    } else {
        res.status(405).json({
            error: 'Not found'
        })
    }
}

