import { Arg, Query, Resolver, ResolverInterface } from "type-graphql"
import { Post } from "./Post.entity"

@Resolver(of => Post)
export class PostResolver implements ResolverInterface<Post> {
    @Query(returns => Post, { nullable: true })
    async post(@Arg("id") id: number): Promise<Post | undefined> {
        return Post.findOne(id)
    }

    @Query(returns => [Post])
    async posts(): Promise<Post[]> {
        return Post.find()
    }
}