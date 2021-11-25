import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { Post, PostAuthDto, PostDto } from "../../../views/Post"
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'
import { getUserInfo } from "../../../lib/auth0";

export default withApiAuthRequired(postsHandler)

type StatusData = {
    error?: string,
    posts?: PostDto[] | PostAuthDto[],
    post?: PostDto | PostAuthDto
}

async function postsHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    const {userId, operator} = getUserInfo(req, res)

    switch (req.method) {
        case 'GET':
            await getPosts()
            break
        case 'POST':
            postPost()
            break
        default:
            res.status(405).end()
    }

    async function getPosts() {
        res.status(200).json({
            posts: (await Post.getList({ include: { votes: true, category: true, PostTagRelationship: true } }))
                .map(p => p.toAuthDto(userId, operator))
        })
    }

    async function postPost() {
        const { title, content, categoryId, tags } = req.body

        if (!title || !content || !categoryId || !tags) {
            res.status(400).json({ error: 'title, content, tags and categoryId are required' })
            return
        }

        await Post.create({
            title,
            content,
            authorId: userId,
            categoryId,
            tags,
            score: 0
        }).then(async (post: Post) => {
            res.status(201).json({ post: post.toAuthDto(userId, operator) })
        }).catch((e: Error) => {
            res.status(400).json({ error: e.message })
        })
    }
}