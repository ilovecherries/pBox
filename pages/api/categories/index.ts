
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig";
import prisma from "../../../lib/prisma";
import { ModelUtil } from "../../../views/ModelView";
import { Category } from "../../../views/Category";

export default withIronSessionApiRoute(tagsHandler, ironConfig)

type StatusData = {
    error?: string,
    categories?: Category[],
    category?: Category
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
        ModelUtil.getList(Category, prisma.category).then((categories: Category[]) => {
            res.status(200).json({ categories })
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

        prisma.category.create({
            data: {
                name: req.body.name,
            }
        }).then((category: Partial<Category>) => {
            const categoryD = new Category(category)
            res.status(200).json({ category: categoryD })
        })
    }
}