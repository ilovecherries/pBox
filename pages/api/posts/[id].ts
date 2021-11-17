import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next"
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig"
import { ModelUtil } from "../../../views/ModelView"
import { Post, PostAuthDto, PostDto } from "../../../views/Post"
import { User } from "../../../views/User";

export default withIronSessionApiRoute(postHandler, ironConfig);

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

    let user: User

    try {
        user = await sessionWrapper(req.session)
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
        return
    } catch (e) {
        res.status(401).json({ error: "Not logged in" })
    }

    res.status(200).json({ error: "OK" })

    async function getPost() {
        try {
            const user = await sessionWrapper(req.session)
            const post = await ModelUtil.getUnique(Post, { 
                where: {id}, 
                include: { author: true, votes: true, PostTagRelationship: true, category: true }
            })
            res.status(200).json({ post: post.toAuthDto(user) })
        }
        catch (e) {
            const post = await ModelUtil.getUnique(Post, { 
                where: {id}, 
                include: { category: true, PostTagRelationship: true }
            })
            res.status(200).json({ post: post.toDto() })
        }
    }

    async function putPost() {
        await ModelUtil.getUnique(Post, {
            where: {id},
            include: { author: true, votes: true, PostTagRelationship: true, category: true }
        }).then(post => {
            if (post.author!.id !== user.id && !user.operator) {
                res.status(403).json({ error: "Not authorized" })
            }
            let { title, content, categoryId, tags } = req.body
            post.edit({ title, content, categoryId, tags })
            .then(post => {
                res.status(200).json({ post: post.toDto() })
            })
            .catch(e => res.status(400).json({ error: e.message }))
        })
    }

    async function deletePost() {
        await ModelUtil.getUnique(Post, id).then((post: Post) => {
            post.delete().then(() => {
                res.status(200).end()
            })
        })
    }
}