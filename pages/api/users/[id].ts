import prisma from "../../../lib/prisma"
import { withIronSessionApiRoute } from "iron-session/next"
import { NextApiRequest, NextApiResponse } from "next"
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig"
import { User, UserDto } from "../../../views/User"
import { ModelUtil } from "../../../views/ModelView"

export default withIronSessionApiRoute(userHandler, ironConfig)

type StatusData = {
    error?: string,
    user?: UserDto
}

async function userHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    sessionWrapper(req.session).then(async authUser => {
        const id = parseInt(req.query.id as string)

        if (!id) {
            res.status(400).json({ error: "Missing id" })
            return
        }

        if (authUser.operator === false) {
            res.status(403).json({error: "User is not an operator"})
            return
        }

        let user: User

        try {
            user = await ModelUtil.getUnique(User, id)
        } catch {
            res.status(404).json({ error: "User not found" })
            return
        }

        switch (req.method) {
            case 'GET':
                getUser()
                break
            case 'PUT':
                putUser()
                break
            case 'DELETE':
                deleteUser()
                break
            default:
                res.status(405).json({ error: "Method not allowed" })
        }

        function getUser() {
            res.status(200).json({user: user.toDto()})
        }

        async function putUser() {
            const { username, operator } = req.body

            if (username !== undefined && username !== user.username &&
                await prisma.user.findUnique({ where: { username: user.username } }) !== null) {
                    res.status(400).json({ error: "User with that username already exists" })
                    return
            }

            user.edit({
                username: username ?? user.username, 
                operator: operator ?? user.operator
            }).then((user) => {
                res.status(200).json({user: user.toDto()})
            })
        }

        function deleteUser() {
            user.delete().then(() => {
                res.status(201).json({user: user.toDto()})
            });
        }
    })
    .catch(e => res.status(401).json({ error: e.message }))
}