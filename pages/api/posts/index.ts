import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig";
import { ModelUtil } from "../../../views/ModelView"
import { Post, PostAuthDto, PostDto } from "../../../views/Post"
import { User } from "../../../views/User";

export default withIronSessionApiRoute(postsHandler, ironConfig);

type StatusData = {
    error?: string,
    posts?: PostDto[] | PostAuthDto[],
    post?: PostDto | PostAuthDto
}

async function postsHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    switch (req.method) {
        case 'GET':
            await getPosts()
            break
        case 'POST':
            try {
                const user = await sessionWrapper(req.session)
                postPost(user)
            } catch (e: any) {
                res.status(401).json({ error: e.message })
            }
            break
        default:
            res.status(405).end()
    }

    async function getPosts() {
        let posts: Post[] = []
        try {
            const user = await sessionWrapper(req.session)
            posts = await ModelUtil.getList(Post, { include: { votes: true, PostTagRelationship: true, author: true, category: true } })
            res.status(200).json({ posts: posts.map(p => p.toAuthDto(user)) })
        } catch (e) {
            posts = await ModelUtil.getList(Post, { include: { category: true }}) 
            res.status(200).json({ posts: posts.map(p => p.toDto()) })
        }
    }

    async function postPost(user: User) {
        const { title, content, categoryId, tags } = req.body

        if (!title || !content || !categoryId || !tags) {
            res.status(400).json({ error: 'title, content, tags and categoryId are required' })
            return
        }

        await Post.create({
            title,
            content,
            authorId: user.id,
            categoryId,
            tags
        }).then((post: Post) => {
            res.status(201).json({ post: post.toAuthDto(user) })
        }).catch((e: Error) => {
            res.status(400).json({ error: e.message })
        })
    }
}