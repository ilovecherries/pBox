import { Field, InputType, Int, ObjectType } from "type-graphql"
import { Length, MaxLength } from "class-validator"
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@InputType()
class NewPostInput {
    @Field()
    @MaxLength(30)
    title: string

    @Field()
    @Length(30, 300)
    content: string

    @Field(type => Int)
    categoryId: number

    @Field({ nullable: true })
    tags?: number[]
}

@Entity()
@ObjectType()
class Post extends BaseEntity {
    @Field(type => Int)
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @MaxLength(30)
    @Column()
    title: string

    @Field()
    @Length(30, 300)
    @Column()
    content: string

    @Field(type => Int)
    @Column()
    categoryId: number

    @Field(type => [Int])
    @Column()
    tags: number[]

    @Field(type => Int)
    @Column()
    score: number
}