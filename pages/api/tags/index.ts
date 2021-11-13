import { NextApiRequest, NextApiHandler, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { ModelUtil } from "../../../views/ModelView";
import { Tag } from "../../../views/Tag";
import { User } from "../../../views/User";

type StatusData = {
    error?: string,
    tags?: Tag[]
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
): NextApiHandler {
    switch (req.method) {
        case "GET":
            getTags()
            break
        default:
            res.status(405).end()
    }

    function getTags() {
        ModelUtil.getList(Tag, prisma.tag).then((tags: Tag[]) => {
            res.status(200).json({ tags })
        })
    }
}