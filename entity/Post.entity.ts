import { Field, Int, ObjectType } from "type-graphql"
import { Length, MaxLength } from "class-validator"
import { BaseEntity, Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Category } from "./Category.entity"
import { Tag } from "./Tag.entity"

@Entity()
@ObjectType()
export class Post extends BaseEntity {
    @Field(type => Int)
    @PrimaryGeneratedColumn()
    readonly id!: number

    @Field()
    @MaxLength(30)
    @Column()
    title!: string

    @Field()
    @Length(30, 300)
    @Column()
    content!: string

    @Field()
    categoryId!: number

    @ManyToOne(() => Category, category => category.posts)
    category!: Category

    @ManyToMany(() => Tag, tag => tag.posts)
    tags!: Tag[]

    @Field(type => Int)
    @Column()
    score!: number
}
