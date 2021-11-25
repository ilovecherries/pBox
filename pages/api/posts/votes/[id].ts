import { NextApiRequest, NextApiResponse } from "next";
import { Post } from "../../../../views/Post"
import { VoteScore } from "../../../../views/Vote";
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'

export default withApiAuthRequired(voteHandler)

type StatusData = {
    error?: string,
    score?: number,
    myScore?: number
} 

async function voteHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    const session = getSession(req, res)
    const userId = session!.user.sub

    const id = parseInt(req.query.id as string)

    if (!id) {
        res.status(400).json({ error: "Missing id" })
        return
    }

    await Post.getUnique({
        where: { id: id },
        include: { votes: true }
    }).then(async post => {
        switch (req.method) {
            case "GET":
                await getVote(post)
                break
            case "POST":
                await postVote(post)
                break
            case "DELETE":
                await deleteVote(post)
                break
            default:
                res.status(400).json({ error: "Invalid method" })
            }
    }).catch(() => res.status(404).json({ error: "Post not found" }))



    async function getVote(post: Post) {
        res.status(200).json({
            score: post.score,
            myScore: post.getScore(userId)
        })
    }

    async function postVote(post: Post) {
        const { score } = req.body

        if (!score) {
            res.status(400).json({ error: "Missing score" })
            return
        }

        await post.vote(userId, score).then((vscore: VoteScore) => {
            res.status(200).json({ ...vscore })
        }).catch((e: Error) => res.status(400).json({ error: e.message }))
    }

    async function deleteVote(post: Post) {
        await post.unvote(userId).then((vscore: VoteScore) => {
            res.status(200).json({ ...vscore })
        }).catch((e: Error) => res.status(400).json({ error: e.message }))
    }
}