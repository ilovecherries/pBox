import { NextApiRequest, NextApiResponse } from "next";
import { ModelUtil } from "../../../views/ModelView";
import { Tag, TagDto } from "../../../views/Tag";
import { getSession, withApiAuthRequired} from '@auth0/nextjs-auth0'
import { getUserInfo } from "../../../lib/auth0";

export default withApiAuthRequired(tagsHandler)

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
            const { operator } = getUserInfo(req, res)
            if (operator === false) {
                res.status(401).json({ error: 'Must be an operator to create tags' })
                return
            }

            postTag()
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