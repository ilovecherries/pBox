import prisma from "../lib/prisma";
import { Category, CategoryDto } from "./Category";
import { Model, ModelUtil } from "./ModelView";
import PostTagRelationship from "./PostTagRelationship";
import { Tag, TagDto } from "./Tag";
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
    authorId?: string
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
    authorId: string = ''
    categoryId: number = 0
    content: string = ''
    score: number = 0
    PostTagRelationship?: PostTagRelationship[]
    votes?: Vote[]
    category?: Category
    private _tags?: Tag[]

    get tags(): Tag[] {
        return this.PostTagRelationship?.map(x => new Tag(x.tag)) ?? []
    }

    constructor(fields: Partial<Post>) {
        super()
        Object.assign(this, fields)

        if (this.PostTagRelationship !== undefined) {
            this.PostTagRelationship = this.PostTagRelationship.map(
                (relationship) => new PostTagRelationship(relationship)
            )
        }

        // FIXME: this doesn't work at the moment because Prisma returns a promise
        // of the votes. We'll find a way to handle that later on.
        this.votes = this.votes?.map(
            (vote) => new Vote(vote)
        )

        if (this.category !== undefined) {
            this.category = new Category(this.category)
        }
    }

    getTags(): Tag[] {
        if (this._tags === undefined) {
            throw new Error("tags not loaded. run loadsTags before getting tags")
        }
        return this._tags
    }

    async loadTags(): Promise<void> {
        // if (this.PostTagRelationship -== undefined) {
        //     throw new Error("post tag relationships aren't in this post view")
        // }
        const relationships: PostTagRelationship[] = await ModelUtil.getList(PostTagRelationship, {
            where: {
                postId: this.id,
            },
            include: { tag: true }
        })
        this._tags = relationships.map(x => new Tag(x.tag))
    }

    static async getUnique(options: any): Promise<Post> {
        const post = await ModelUtil.getUnique(Post, options)
        if (post.PostTagRelationship !== undefined) {
            await post.loadTags()
        }
        return post
    }

    static async getList(options: any): Promise<Post[]> {
        const posts = await ModelUtil.getList(Post, options)
        const loadedPosts = await Promise.all(posts.map(async (post: Post) => {
            if (post.PostTagRelationship !== undefined) {
                await post.loadTags()
            }
            return post
        }))
        return loadedPosts
    }


    static async verifyFields(fields: Partial<PostFields>) {
        if (fields.title !== undefined) { 
            const post = await prisma.post.findUnique({ where: { title: fields.title }})
            if (post !== null) {
                throw new Error("Post with this title already exists")
            }
        }

        if (fields.categoryId !== undefined) {
            const category = await prisma.category.findUnique({ where: { id: fields.categoryId }})
            if (category === null) {
                throw new Error("Category with this id does not exist")
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
            authorId: fields.authorId,
            category: { connect: { id: fields.categoryId } },
            title: fields.title,
            content: fields.content,
            score: fields.score
        }
        const post = await ModelUtil.create(Post, data);
        await prisma.$transaction(tags.map((t) =>
            prisma.postTagRelationship.create({
                data: {
                    post: { connect: { id: post.id } },
                    tag: { connect: { id: t } }
                }
            })
        ))
        await post.loadTags()
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

        if (fields.categoryId !== undefined) {
            data.category = { connect: { id: fields.categoryId } }
        }

        const post = await ModelUtil.edit(Post, data, this.id)

        if (tags !== undefined) {
            await prisma.$transaction([
                prisma.postTagRelationship.deleteMany({
                    where: {
                        postId: this.id
                    }
                }),
                ...tags.map((t) =>
                prisma.postTagRelationship.create({
                    data: {
                        post: { connect: { id: post.id } },
                        tag: { connect: { id: t } }
                    }
                })
            )])
        }
        await post.loadTags()
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
            score: this.score,
        }

        dto.tags = this.getTags().map(x => x.toDto())

        dto.category = this.category?.toDto()

        return dto
    }

    getScore(userId: string): number {
        return this.votes?.find(x => x.userId === userId)?.score ?? 0
    }

    async vote(userId: string, score: number): Promise<VoteScore> {
        if (score !== 1 && score !== -1) {
            throw new Error("score must be 1 or -1")
        }

        const oldVote: Vote | undefined = this.votes!.find(x => x.userId === userId)

        if (oldVote !== undefined && oldVote.score !== score) {
            const scoreChange = this.score + score * 2
            await ModelUtil.edit(Vote, { score }, {
                where: {
                    userId_postId: {
                        userId: userId, 
                        postId: this.id
                    } 
                }
            })
            const p = await this.edit({ score: scoreChange })

            return { score: scoreChange, myScore: score }
        } else if (oldVote === undefined) {
            const scoreChange = this.score + score
            await ModelUtil.create(Vote, { 
                postId: this.id, 
                userId: userId, 
                score
            })
            await this.edit({ score: scoreChange })
            return { score: scoreChange, myScore: score }
        } else {
            return { score: this.score, myScore: score }
        }
    }

    async unvote(userId: string): Promise<VoteScore> {
        const oldVote: Vote | undefined = this.votes!.find(x => x.userId === userId)

        if (oldVote !== undefined) {
            const scoreChange = this.score - oldVote.score
            await ModelUtil.delete(Vote, {
                where: {
                    userId_postId: {
                        userId: userId, 
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

    toAuthDto(userId: string, operator: boolean): PostAuthDto { 
        let dto: any = this.toDto()

        if (this.authorId !== undefined) {
            const owner = this.authorId === userId
            dto.owner = owner
            if (operator) {
                dto.authorId = this.authorId
            }
        }

        dto.myScore = this.getScore(userId)

        return dto
    }
}