import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig";
import prisma from "../../../lib/prisma"
import { ModelUtil } from "../../../views/ModelView"
import { Post, PostDto } from "../../../views/Post"
import { User } from "../../../views/User";

export default withIronSessionApiRoute(postsHandler, ironConfig);

type StatusData = {
    error?: string,
    posts?: PostDto[],
    post?: PostDto
}

function postsHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    switch (req.method) {
        case 'GET':
            getPosts()
            break
        case 'POST':
            sessionWrapper(req.session).then(user => { postPost(user) })
            .catch(e => res.status(401).json({ error: e.message }))
            break
        default:
            res.status(405).end()
    }

    function getPosts() {
        ModelUtil.getList(Post, prisma.post).then((posts: Post[]) => {
            res.status(200).json({ posts })
        })
    }

    async function postPost(user: User) {
        const { title, content, categoryId } = req.body

        if (!title || !content || !categoryId) {
            res.status(400).json({ error: 'title, content and categoryId are required' })
        }

        if (await prisma.post.findUnique({ where: { title } }) !== null) {
            res.status(400).json({ error: "post with this title already exists" })
            return
        }

        prisma.post.create({
            data: {
                title,
                content,
                authorId: user.id,
                score: 0,
                categoryId
            }
        }).then((post: Partial<Post>) => {
            res.status(201).json({ post: new Post(post).toDto() })
        })
    }
}