import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ironConfig, sessionWrapper } from "../../../lib/ironconfig";
import { ModelUtil } from "../../../views/ModelView";
import { User, UserDto } from "../../../views/User";

export default withIronSessionApiRoute(usersHandler, ironConfig)

type StatusData = {
    error?: string,
    users?: UserDto[]
}

async function usersHandler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    // getting the users should be an admin only action as the
    // intent is to have the users be anonymous
    if (req.method === 'GET') {
        await sessionWrapper(req.session).then(user => {
            if (user.operator === false) {
                res.status(403).json({ error: 'not authorized' })
                return
            }

            ModelUtil.getList(User).then((users: User[]) => {
                res.status(200).json({ users: users.map(u => u.toDto()) })
            })
        })
        .catch(e => res.status(401).json({ error: e.message }))
    } else {
        res.status(405).json({
            error: 'Not found'
        })
    }
}

