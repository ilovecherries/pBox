import prisma from "../lib/prisma";
import { Category, CategoryDto } from "./Category";
import { HasDto, IsModel, Model, ModelUtil } from "./ModelView";
import PostTagRelationship from "./PostTagRelationship";
import { Tag, TagDto } from "./Tag";
import { User, UserDto } from "./User";
import { Vote, VoteScore } from "./Vote";

export interface PostFields {
    title: string
    content: string
    authorId: number
    categoryId: number
    tags: number[]
    score: number
}

export interface PostDto {
    title: string
    content: string
    id: number
    tags?: TagDto[]
    score: number
    author?: UserDto
    category?: CategoryDto
}

export interface PostAuthDto extends PostDto {
    myScore: number
    owner?: boolean
}

export class Post extends Model<PostFields, PostDto> {
    readonly prismaDelegate: any = prisma.post

    id: number = 0
    title: string = ''
    authorId: number = 0
    categoryId: number = 0
    content: string = ''
    score: number = 0
    postTagRelationships?: PostTagRelationship[]
    votes?: Vote[]
    author?: User
    category?: Category

    get tags(): Tag[] {
        return this.postTagRelationships?.map(x => new Tag(x.tag)) ?? []
    }

    constructor(fields: Partial<Post>) {
        super()
        Object.assign(this, fields)

        if (this.postTagRelationships !== undefined) {
            this.postTagRelationships = this.postTagRelationships.map(
                (relationship) => new PostTagRelationship(relationship)
            )
        }

        // FIXME: this doesn't work at the moment because Prisma returns a promise
        // of the votes. We'll find a way to handle that later on.
        this.votes = this.votes?.map(
            (vote) => new Vote(vote)
        )

        if (this.author !== undefined) {
            this.author = new User(this.author)
        }

        if (this.category !== undefined) {
            this.category = new Category(this.category)
        }
    }

    static async verifyFields(fields: Partial<PostFields>) {
        if (fields.title !== undefined) { 
            const post = await prisma.post.findUnique({ where: { title: fields.title }})
            if (post !== null) {
                throw new Error("post with this title already exists")
            }
        }

        if (fields.authorId !== undefined) {
            const user = await prisma.user.findUnique({ where: { id: fields.authorId }})
            if (user === null) {
                throw new Error("user with this id does not exist")
            }
        }

        if (fields.categoryId !== undefined) {
            const category = await prisma.category.findUnique({ where: { id: fields.categoryId }})
            if (category === null) {
                throw new Error("category with this id does not exist")
            }
        }

        if (fields.tags !== undefined) {
            const foundTags = await prisma.tag.findMany({ where: { id: {in: fields.tags }} })
            if (foundTags === null || foundTags.length !== fields.tags.length) {
                throw new Error("one or more tags with these ids does not exist")
            }
        }
    }


    public static async create(fields: PostFields): Promise<Post> {
        await Post.verifyFields(fields)
        let tags = fields.tags
        let data = {
            author: { connect: { id: fields.authorId } },
            category: { connect: { id: fields.categoryId } },
            title: fields.title,
            content: fields.content,
            score: fields.score
        }
        const post = await ModelUtil.create(Post, data);
        tags.map(async (tagId) => {
            await PostTagRelationship.create({
                postId: post.id,
                tagId
            });
        });
        return post;
    }

    async edit(fields: Partial<PostFields>): Promise<Post> {
        await Post.verifyFields(fields)
        let tags = fields.tags
        let data: any = {
            title: fields.title,
            content: fields.content,
            score: fields.score
        }

        if (fields.authorId !== undefined) {
            data.author = { connect: { id: fields.authorId } }
        }

        if (fields.categoryId !== undefined) {
            data.category = { connect: { id: fields.categoryId } }
        }

        const post = await ModelUtil.edit(Post, data, this.id)

        if (tags !== undefined) {
            await ModelUtil.deleteMany(PostTagRelationship, { postId: this.id })
            tags.map(async tagId => {
                await PostTagRelationship.create({
                    postId: post.id,
                    tagId
                })
            })
        }
        return post
    }

    delete(): Promise<void> {
        return ModelUtil.delete(Post, this.id)
    }

    toDto(): PostDto {
        let dto: PostDto = {
            id: this.id,
            title: this.title,
            content: this.content,
            score: this.score
        }

        dto.tags = this.tags.map(x => x.toDto())
        dto.author = this.author?.toDto()
        dto.category = this.category?.toDto()

        return dto
    }

    getScore(user: User): number {
        return this.votes?.find(x => x.userId === user.id)?.score ?? 0
    }

    async vote(user: User, score: number): Promise<VoteScore> {
        if (score !== 1 && score !== -1) {
            throw new Error("score must be 1 or -1")
        }

        const oldVote: Vote | undefined = this.votes!.find(x => x.userId === user.id)

        if (oldVote !== undefined && oldVote.score !== score) {
            console.log("editing")
            const scoreChange = this.score + score * 2
            console.log(this.score, scoreChange, oldVote.score, score)
            await ModelUtil.edit(Vote, { score }, {
                where: {
                    userId_postId: {
                        userId: user.id, 
                        postId: this.id
                    } 
                }
            })
            const p = await this.edit({ score: scoreChange })
            console.log(p)

            return { score: scoreChange, myScore: score }
        } else if (oldVote === undefined) {
            console.log("creating")
            const scoreChange = this.score + score
            console.log(this.score, scoreChange, score)
            await ModelUtil.create(Vote, { 
                postId: this.id, 
                userId: user.id, 
                score
            })
            await this.edit({ score: scoreChange })
            return { score: scoreChange, myScore: score }
        } else {
            console.log("no change")
            console.log(this.score, oldVote.score, score)
            return { score: this.score, myScore: score }
        }
    }

    async unvote(user: User): Promise<VoteScore> {
        const oldVote: Vote | undefined = this.votes!.find(x => x.userId === user.id)

        if (oldVote !== undefined) {
            const scoreChange = this.score - oldVote.score
            await ModelUtil.delete(Vote, {
                where: {
                    userId_postId: {
                        userId: user.id, 
                        postId: this.id
                    } 
                }
            })
            await this.edit({ score: scoreChange })
            return { score: scoreChange, myScore: 0 }
        } else {
            return { score: this.score, myScore: 0 }
        }
    }

    toAuthDto(user: User): PostAuthDto { 
        let dto: any = this.toDto()

        if (dto.author !== undefined) {
            const owner = dto.author.id === user.id
            dto.owner = owner
            if (user.operator === false) {
                dto.author = undefined
            }
        }

        dto.myScore = this.getScore(user)

        return dto
    }
}