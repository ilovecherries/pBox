import prisma from "../lib/prisma";
import { HasDto, IsModel, ModelUtil } from "./ModelView";
import { User } from "./User";
import { Vote } from "./Vote";

export interface PostData {
    title: string
    content: string
}

export interface PostDto extends PostData {
    id: number
}

export interface PostAuthDto extends PostDto {
    myScore: number
}

export class Post implements PostData, HasDto<PostDto>, IsModel {
    public id: number = 0
    public title: string = ''
    public content: string = ''
    public author: User | undefined
    public score: number = 0

    constructor(postPartial: Partial<Post> = {}) {
        Object.assign(this, postPartial);
    }

    public toDto(): PostDto {
        return {
            id: this.id,
            title: this.title,
            content: this.content
        }
    }

    static getManyWithMyScore(posts: Post[], user: User): PostAuthDto[] {
        return ModelUtil.getList(Vote, prisma.vote, {
            where: { 
                userId: user.id,
                postId: { in: posts.map(p => p.id) } 
            },
        })
        .then(votes => posts.map(post => {
            const postAuthDto: PostAuthDto = {
                id: post.id,
                title: post.title,
                content: post.content,
                myScore: votes.find(v => v.postId === post.id)?.score ?? 0
            }

            return postAuthDto
        }))
    }
}