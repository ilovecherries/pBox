import prisma from "../../../lib/prisma"
import { withIronSessionApiRoute } from "iron-session/next"
import { NextApiRequest, NextApiResponse } from "next"
import { ironConfig } from "../../../lib/ironconfig"
import { Tag } from '../../../views/Tag'
import { ModelUtil } from "../../../views/ModelView"
import { User } from "../../../views/User"

export default withIronSessionApiRoute(tagHandler, ironConfig)

type StatusData = {
    error?: string,
    tag?: Tag
}

async function tagHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    const { id } = req.query
    if (!id) {
        res.status(400).json({ error: "No id provided" })
        return
    }

    if (req.method === "GET") {
        getTag()
        return
    }

    const { userId } = req.session

    if (userId === undefined) {
        res.status(401).json({ error: "Not logged in" })
        return
    }

    const user = await prisma.user.findUnique({where: {id: userId}})
    .then((user: Partial<User> | null) => {
        if (user === null) {
            res.status(401).json({ error: "Not logged in" })
            return
        }

        return new User(user)
    }) as User

    if (user.operator === false) {
        res.status(403).json({ error: "Not an operator" })
        return
    }

    function getTag() {
        ModelUtil.getOne(Tag, prisma.tag, Number(id)).then((tag: Tag) => {
            res.status(200).json({ tag })
        })
    }
}