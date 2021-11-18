import prisma from "../../../lib/prisma"
import { withIronSessionApiRoute } from "iron-session/next"
import { NextApiRequest, NextApiResponse } from "next"
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig"
import { Tag, TagDto } from '../../../views/Tag'
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
        await getTag()
        return
    }

    await sessionWrapper(req.session).then(async user => {
        if (user.operator === false) {
            res.status(403).json({ error: "Not an operator" })
            return
        }

        switch (req.method) {
            case 'PUT':
                await putTag()
                break
            case "DELETE":
                await deleteTag()
                break
            default:
                res.status(405).json({ error: "Method not allowed" })
        }

    })
    .catch(e => res.status(401).json({ error: e.message }))

    async function getTag() {
        await ModelUtil.getUnique(Tag, id).then((tag: Tag) => {
            res.status(200).json({ tag: tag.toDto() })
        })
    }

    async function putTag() {
        await ModelUtil.getUnique(Tag, id).then(async (tag: Tag) => {
            const {name, color} = req.body

            const updatedTag = await tag.edit({ name, color })
            res.status(200).json({ tag: updatedTag.toDto() })
        })
    }

    async function deleteTag() {
        await ModelUtil.getUnique(Tag, id).then((tag: Tag) => {
            tag.delete().then(() => {
                res.status(201).json({ tag: tag.toDto() })
            })
        })
    }
}