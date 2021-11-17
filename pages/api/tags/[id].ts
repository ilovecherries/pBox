import prisma from "../../../lib/prisma"
import { withIronSessionApiRoute } from "iron-session/next"
import { NextApiRequest, NextApiResponse } from "next"
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig"
import { Tag } from '../../../views/Tag'
import { ModelUtil } from "../../../views/ModelView"

export default withIronSessionApiRoute(tagHandler, ironConfig)

type StatusData = {
    error?: string,
    tag?: TagDto
}

async function tagHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    const id = parseInt(req.query.id as string)
    
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

        switch (req.method) {
            case 'PUT':
                putTag()
                break
            case "DELETE":
                deleteTag()
                break
            default:
                res.status(405).json({ error: "Method not allowed" })
        }

    })
    .catch(e => res.status(401).json({ error: e.message }))

    function getTag() {
        ModelUtil.getUnique(Tag, id).then((tag: Tag) => {
            res.status(200).json({ tag: tag.toDto() })
        })
    }

    function putTag() {
        ModelUtil.getUnique(Tag, id).then(async (tag: Tag) => {
            const name: string = req.body.name
            const color: string = req.body.color

            if (name !== undefined && name !== tag.name &&
                await prisma.tag.findUnique({ where: { name } }) !== null) {
                    res.status(400).json({ error: "Tag with that name already exists" })
                    return
            }

            const updatedTag = await tag.edit({ name, color })
            res.status(200).json({ tag: updatedTag.toDto() })
        })
    }

    function deleteTag() {
        ModelUtil.getUnique(Tag, id).then((tag: Tag) => {
            tag.delete().then(() => {
                res.status(201).json({ tag: tag.toDto() })
            })
        })
    }
}