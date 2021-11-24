import { Length } from "class-validator";
import { Arg, Field, Int, ObjectType, Query, Resolver, ResolverInterface } from "type-graphql";
import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post.entity";

@Entity()
@ObjectType()
export class Category extends BaseEntity {
    @Field(type => Int)
    @PrimaryGeneratedColumn()
    readonly id!: number

    @Field()
    @Length(10, 80)
    @Index({ unique: true })
    @Column()
    name!: string

    @OneToMany(() => Post, post => post.category)
    posts!: Post[]
}