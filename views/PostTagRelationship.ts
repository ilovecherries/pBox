import prisma from "../lib/prisma";
import { IsModel } from "./ModelView";
import { Tag } from "./Tag";
import { Post } from "./Post";

export default class PostTagRelationship implements IsModel {
    public id: number = -1
    public postId: number = -1
    public tagId: number = -1

    constructor(postId: number, tagId: number) {
        this.postId = postId
        this.tagId = tagId
    }

    static findTagsFromPostId(postId: number): Promise<Tag[]> {
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

    static findPostsFromTagId(tagId: number | number[]): Promise<Post[]> {
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
}