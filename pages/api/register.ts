import type { NextApiRequest, NextApiResponse } from 'next'
import { register } from "../../lib/auth";
import { User, UserDto } from '../../views/User';

type StatusData = {
    error?: string
    user?: UserDto
}

export default function registerHandler(
    req: NextApiRequest, 
    res: NextApiResponse<StatusData>
) {
    if (req.method !== 'POST') {
        res.status(405).end()
        return
    }

    const { username, password } = req.body;

    if (!username || !password)
    {
        res.status(400).send({error: 'Missing username or password'});
        return;
    }

    register(username, password)
    .then((user: User) => {
        const dto = user.toDto();
        res.status(201).send({user: dto});
    })
    .catch((err: Error) => {res.status(400).send({error: err.message})});
}