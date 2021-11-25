import prisma from "../../../lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"
import { Category, CategoryDto } from '../../../views/Category'
import { ModelUtil } from "../../../views/ModelView"
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'

export default withApiAuthRequired(categoryHandler)

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

    const session = getSession(req, res)
    const operator = false
    if (operator === false) {
        res.status(401).json({ error: 'Must be an operator to create tags' })
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