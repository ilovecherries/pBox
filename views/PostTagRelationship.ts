import prisma from "../lib/prisma";
import { IsModel, Model, ModelUtil } from "./ModelView";
import { Tag } from "./Tag";
import { Post } from "./Post";
import { PathOrFileDescriptor } from "fs";

export interface PTRFields {
    postId: number
    tagId: number
}

export interface PTRDto {

}

export default class PostTagRelationship extends Model<PTRFields, PTRDto> implements PTRFields {
    readonly prismaDelegate = prisma.postTagRelationship

    public id: number = -1
    public postId: number = -1
    public post?: Post
    public tagId: number = -1
    public tag?: Tag

    constructor(fields: Partial<PostTagRelationship>) {
        super()
        Object.assign(this, fields)

        if (this.post !== undefined) {
            this.post = new Post(this.post)
        }

        if (this.tag !== undefined) {
            this.tag = new Tag(this.tag)
        }
    }

    public static findTagsFromPostId(postId: number): Promise<Tag[]> {
        return prisma.postTagRelationship.findMany({
            where: {
                postId: postId
            },
            include: {
                tag: true
            }
        })
        .then((relationships: any[]) => {
            return relationships.map(r => new Tag(r.tag))
        })
    }

    public static findPostsFromTagId(tagId: number | number[]): Promise<Post[]> {
        let tagQuery: any = tagId;
        if (tagId instanceof Array) {
            tagQuery = { in: tagId }
        }
        return prisma.postTagRelationship.findMany({
            where: {
                tagId: tagQuery
            },
            include: {
                post: true
            }
        })
        .then((relationships: any[]) => {
            return relationships.map(r => new Post(r.post))
        })
    }

    static findTagsFromPost(post: Post): Promise<Tag[]> {
        return PostTagRelationship.findTagsFromPostId(post.id)
    }

    static findPostsFromTag(tag: Tag): Promise<Post[]> {
        return this.findPostsFromTagId(tag.id)
    }

    public static create(fields: Partial<PTRFields>): Promise<PostTagRelationship> {
        return ModelUtil.create(PostTagRelationship, fields)
    }

    edit(fields: Partial<PTRFields>): Promise<Model<PTRFields, PTRDto>> {
        return ModelUtil.edit(PostTagRelationship, fields, this.id)
    }

    delete(): Promise<void> {
        return ModelUtil.delete(PostTagRelationship, this.id)
    }

    toDto(): PTRDto {
        return {}
    }
}