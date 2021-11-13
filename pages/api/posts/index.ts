import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig";
import prisma from "../../../lib/prisma"
import { ModelUtil } from "../../../views/ModelView"
import { Post, PostDto } from "../../../views/Post"

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
            sessionWrapper(req.session).then(_ => { postPost() })
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

    function postPost() {
        const { title, content } = req.body
        if (!title || !content) {
            res.status(400).json({ error: 'title and content are required' })
        }
        prisma.post.create({
            data: {
                title,
                content
            }
        }).then((post: Post) => {
            res.status(201).json({ post: new Post(post).toDto() })
        })
    }
}