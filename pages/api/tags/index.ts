import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig";
import prisma from "../../../lib/prisma";
import { ModelUtil } from "../../../views/ModelView";
import { Tag } from "../../../views/Tag";

export default withIronSessionApiRoute(tagsHandler, ironConfig)

type StatusData = {
    error?: string,
    tags?: Tag[],
    tag?: Tag
}

function tagsHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    switch (req.method) {
        case "GET":
            getTags()
            break
        case 'POST':
            sessionWrapper(req.session).then(user => {
                if (user.operator === false) {
                    res.status(401).json({ error: 'Must be an operator to create tags' })
                    return
                }

                postTag()
            })
            .catch(e => res.status(401).json({ error: e.message }))
        default:
            res.status(405).end()
    }

    function getTags() {
        ModelUtil.getList(Tag, prisma.tag).then((tags: Tag[]) => {
            res.status(200).json({ tags })
        })
    }

    async function postTag() {
        const { name, color} = req.body
        
        if (!name || !color) {
            res.status(400).json({ error: "name and color are required" })
            return
        }

        if (await prisma.tag.findUnique({ where: { name } }) !== null) {
            res.status(400).json({ error: "tag with this name already exists" })
            return
        }

        prisma.tag.create({
            data: {
                name: req.body.name,
                color: req.body.color,
            }
        }).then((tag: Partial<Tag>) => {
            const tagD = new Tag(tag)
            res.status(200).json({ tag: tagD })
        })
    }
}