import prisma from "../../../lib/prisma"
import { withIronSessionApiRoute } from "iron-session/next"
import { NextApiRequest, NextApiResponse } from "next"
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig"
import { Category, CategoryDto } from '../../../views/Category'
import { ModelUtil } from "../../../views/ModelView"

export default withIronSessionApiRoute(categoryHandler, ironConfig)

type StatusData = {
    error?: string,
    category?: CategoryDto
}

async function categoryHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    const id = parseInt(req.query.id as string)
    
    if (!id) {
        res.status(400).json({ error: "No id provided" })
        return
    }

    if (req.method === "GET") {
        getCategory()
        return
    }

    sessionWrapper(req.session).then(user => {
        if (user.operator === false) {
            res.status(403).json({ error: "Not an operator" })
            return
        }

        switch (req.method) {
            case 'PUT':
                putCategory()
                break
            case "DELETE":
                deleteCategory()
                break
            default:
                res.status(405).json({ error: "Method not allowed" })
        }

    })
    .catch(e => res.status(401).json({ error: e.message }))

    function getCategory() {
        ModelUtil.getUnique(Category, id).then((category: Category) => {
            res.status(200).json({ category: category.toDto() })
        })
    }

    function putCategory() {
        ModelUtil.getUnique(Category, id).then(async (category: Category) => {
            const name: string = req.body.name

            if (name !== undefined && name !== category.name &&
                await prisma.category.findUnique({ where: { name } }) !== null) {
                    res.status(400).json({ error: "Category with that name already exists" })
                    return
            }

            category.edit({ name }).then(category => {
                res.status(200).json({ category: category.toDto() })
            })
        })
    }

    function deleteCategory() {
        ModelUtil.getUnique(Category, id).then((category: Category) => {
            category.delete().then(() => {
                res.status(200).end()
            })
        })
    }
}