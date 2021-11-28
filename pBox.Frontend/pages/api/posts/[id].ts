import { NextApiRequest, NextApiResponse } from "next"
import { Post, PostAuthDto, PostDto } from "../../../views/Post"
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { getUserInfo } from "../../../lib/auth0"

export default withApiAuthRequired(postHandler)

type StatusData = {
    error?: string,
    post?: PostDto | PostAuthDto
}

async function postHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    const id = parseInt(req.query.id as string)
    
    if (!id) {
        res.status(400).json({ error: "No id provided" })
        return
    }

    if (req.method === "GET") {
        getPost()
        return
    }

    const {userId, operator} = getUserInfo(req, res)

    switch (req.method) {
        case 'PUT':
            await putPost()
            break
        case "DELETE":
            await deletePost()
            break
        default:
            res.status(405).json({ error: "Method not allowed" })
    }

    async function getPost() {
        const post = await Post.getUnique({ 
            where: {id}, 
            include: { votes: true, PostTagRelationship: true, category: true }
        })
        res.status(200).json({ post: post.toAuthDto(userId, false) })
    }

    async function putPost() {
        await Post.getUnique( {
            where: {id},
            include: { votes: true, PostTagRelationship: true, category: true }
        }).then(async post => {
            if (post.authorId !== userId && !operator) {
                res.status(403).json({ error: "Not authorized" })
                return
            }
            let { title, content, categoryId, tags } = req.body
            await post.edit({ title, content, categoryId, tags })
            .then(async post => {
                res.status(200).json({ post: post.toAuthDto(userId, false) })
            })
            .catch(e => res.status(400).json({ error: e.message }))
        })
    }

    async function deletePost() {
        await Post.getUnique(id).then((post: Post) => {
            if (post.authorId !== userId && !operator) {
                res.status(403).json({ error: "Not authorized" })
                return
            }
            post.delete().then(() => {
                res.status(200).end()
            })
        })
    }
}