import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig";
import prisma from "../../../lib/prisma";
import { ModelUtil } from "../../../views/ModelView";
import { Tag } from "../../../views/Tag";

export default withIronSessionApiRoute(tagsHandler, ironConfig)

type StatusData = {
    error?: string,
    tags?: TagDto[],
    tag?: TagDto
}

async function tagsHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    switch (req.method) {
        case "GET":
            await getTags()
            break
        case 'POST':
            await sessionWrapper(req.session).then(user => {
                if (user.operator === false) {
                    res.status(401).json({ error: 'Must be an operator to create tags' })
                    return
                }

                postTag()
            })
            .catch(e => res.status(401).json({ error: e.message }))
            break
        default:
            res.status(405).end()
    }

    async function getTags() {
        await ModelUtil.getList(Tag).then((tags: Tag[]) => {
            res.status(200).json({ tags: tags.map(t => t.toDto()) })
        })
    }

    async function postTag() {
        const { name, color} = req.body
        
        if (!name || !color) {
            res.status(400).json({ error: "name and color are required" })
            return
        }

        await Tag.create({ name, color }).then(tag => {
            res.status(200).json({ tag: tag.toDto() })
        }).catch(e => res.status(400).json({ error: e.message }))
    }
}