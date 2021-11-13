import prisma from "../../../lib/prisma"
import { withIronSessionApiRoute } from "iron-session/next"
import { NextApiRequest, NextApiResponse } from "next"
import { ironConfig } from "../../../lib/ironconfig"
import { User, UserDto } from "../../../views/User"

export default withIronSessionApiRoute(userHandler, ironConfig)

type StatusData = {
    error?: string,
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
        res.status(401).json({error: "Not logged in"})
    }

    const authUser = await prisma.user.findUnique({where: {id: userId}})

    if (authUser === null) {
        res.status(403).json({error: "User not found"})
        return
    }

    const authUserD = new User(authUser)

    if (authUser.operator === false) {
        res.status(403).json({error: "User is not an operator"})
        return
    }

    const id = parseInt(req.query.id as string)

    if (!id) {
        res.status(400).json({ error: "Missing id" })
        return
    }

    const user = await prisma.user.findUnique({where: {id: id}})

    if (user === null) {
        res.status(404).json({error: "User not found"})
        return
    }

    const userD = new User(user)

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
        res.status(200).json({user: userD.toDto()})
    }

    function putUser() {
        const { username, operator } = req.body
        prisma.user.update({
            where: {id},
            data: {
                username: username ?? userD.username, 
                operator: operator ?? userD.operator
            }
        }).then((user: Partial<User> | null) => {
            if (user === null) {
                res.status(404).json({error: "User not found"})
                return
            }

            res.status(200).json({user: new User(user).toDto()})
        })
    }

    function deleteUser() {
        userD.delete().then(() => {
            res.status(201).json({user: userD.toDto()})
        });
    }
}