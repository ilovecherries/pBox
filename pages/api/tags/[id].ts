import prisma from "../../../lib/prisma"
import { withIronSessionApiRoute } from "iron-session/next"
import { NextApiRequest, NextApiResponse } from "next"
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig"
import { Tag } from '../../../views/Tag'
import { ModelUtil } from "../../../views/ModelView"

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

    sessionWrapper(req.session).then(user => {
        if (user.operator === false) {
            res.status(403).json({ error: "Not an operator" })
            return
        }

        res.status(405).json({ error: "Method not allowed" })
    })
    .catch(e => res.status(401).json({ error: e.message }))

    function getTag() {
        ModelUtil.getOne(Tag, prisma.tag, Number(id)).then((tag: Tag) => {
            res.status(200).json({ tag })
        })
    }
}