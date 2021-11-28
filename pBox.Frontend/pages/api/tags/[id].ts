import { NextApiRequest, NextApiResponse } from "next"
import { Tag, TagDto } from '../../../views/Tag'
import { ModelUtil } from "../../../views/ModelView"
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { getUserInfo } from "../../../lib/auth0"

export default withApiAuthRequired(tagHandler)

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

    if (req.method === 'GET') {
        await getTag()
        return
    }

    const {userId, operator} = getUserInfo(req, res)

    if (!operator) {
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