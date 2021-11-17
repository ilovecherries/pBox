
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig";
import prisma from "../../../lib/prisma";
import { ModelUtil } from "../../../views/ModelView";
import { Category, CategoryDto } from "../../../views/Category";

export default withIronSessionApiRoute(tagsHandler, ironConfig)

type StatusData = {
    error?: string,
    categories?: CategoryDto[],
    category?: CategoryDto
}

function tagsHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    switch (req.method) {
        case "GET":
            getCategories()
            break
        case 'POST':
            sessionWrapper(req.session).then(user => {
                if (user.operator === false) {
                    res.status(401).json({ error: 'Must be an operator to create categories' })
                    return
                }

                postCategory()
            })
            .catch(e => res.status(401).json({ error: e.message }))
            break
        default:
            res.status(405).end()
    }

    function getCategories() {
        ModelUtil.getList(Category).then((categories: Category[]) => {
            res.status(201).json({ categories: categories.map(c => c.toDto()) })
        })
    }

    async function postCategory() {
        const { name } = req.body
        
        if (!name) {
            res.status(400).json({ error: "name is required" })
            return
        }

        if (await prisma.category.findUnique({ where: { name } }) !== null) {
            res.status(400).json({ error: "category with this name already exists" })
            return
        }

        const category = await Category.create({ name })
        res.status(200).json({ category: category.toDto() })
    }
}