import type { NextApiRequest, NextApiResponse } from 'next'
import { ironConfig, sessionWrapper } from '../../../lib/ironconfig'
import { withIronSessionApiRoute } from "iron-session/next";
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
    let user: User
    try {
        user = await sessionWrapper(req.session)

        switch (req.method) {
            case 'GET':
                getUser()
                break
            case 'PUT':
                await putUser()
                break
            case 'DELETE':
                await deleteUser()
                break
            default:
                res.status(405).json({ error: "Method not allowed" })
        }
    }
    catch (e: any) {
        res.status(401).json({ error: e.message })
    }

    function getUser() {
        res.status(200).json({ user: user.toDto() })
    }

    async function putUser() {
        const { username } = req.body
        try {
            const updatedUser = await user.edit({
                username, 
            })

            res.status(200).json({ user: updatedUser.toDto() })
        } catch (e) {
            console.error(e)
            res.status(500).json({ error: "Internal server error" })
        }
    }

    async function deleteUser() {
        try {
            await user.delete()
            res.status(201).end()
        } catch (e) {
            console.error(e)
            res.status(500).json({ error: "Internal server error" })
        }
    }
}
