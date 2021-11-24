import { Arg, Query, Resolver, ResolverInterface } from "type-graphql"
import { Category } from "./Category.entity"

@Resolver(of => Category)
export class CategoryResolver implements ResolverInterface<Category> {
    @Query(returns => Category, { nullable: true })
    async Category(@Arg("id") id: number): Promise<Category | undefined> {
        return Category.findOne(id)
    }

    @Query(returns => [Category])
    async Categories(): Promise<Category[]> {
        return Category.find()
    }
}