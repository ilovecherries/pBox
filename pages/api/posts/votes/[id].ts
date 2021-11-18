import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { ironConfig, sessionWrapper } from "../../../../lib/ironconfig";
import { Post } from "../../../../views/Post"
import { User } from "../../../../views/User";
import { VoteScore } from "../../../../views/Vote";

export default withIronSessionApiRoute(voteHandler, ironConfig);

type StatusData = {
    error?: string,
    score?: number,
    myScore?: number
} 

async function voteHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    const id = parseInt(req.query.id as string)

    if (!id) {
        res.status(400).json({ error: "Missing id" })
        return
    }

    let post: Post
    
    try {
        post = await Post.getUnique({
            where: { id: id },
            include: { votes: true }
        })
        await sessionWrapper(req.session).then(async (user: User) => {
            switch (req.method) {
                case "GET":
                    await getVoteAuthorized (user)
                    break
                case "POST":
                    await postVote(user)
                    break
                case "DELETE":
                    await deleteVote(user)
                    break
                default:
                    res.status(400).json({ error: "Invalid method" })
            }
        }).catch(async () => {
            await getVote()
        })
    } catch (e) {
        res.status(404).json({ error: "Post not found" })
    }



    async function getVote() {
        res.status(200).json({score: post.score})
    }

    async function getVoteAuthorized(user: User) {
        res.status(200).json({ 
            score: post.score, 
            myScore: post.getScore(user) 
        })    
    }


    async function postVote(user: User) {
        const { score } = req.body

        if (!score) {
            res.status(400).json({ error: "Missing score" })
            return
        }

        await post.vote(user, score).then((vscore: VoteScore) => {
            res.status(200).json({ ...vscore })
        }).catch((e: Error) => res.status(400).json({ error: e.message }))
    }

    async function deleteVote(user: User) {
        await post.unvote(user).then((vscore: VoteScore) => {
            res.status(200).json({ ...vscore })
        }).catch((e: Error) => res.status(400).json({ error: e.message }))
    }
}