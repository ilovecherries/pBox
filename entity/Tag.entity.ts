import { Length, MaxLength } from "class-validator";
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post.entity";

@Entity()
@ObjectType()
export class Tag extends BaseEntity {
    @Field(type => Int)
    @PrimaryGeneratedColumn()
    readonly id!: number

    @Field()
    @MaxLength(20)
    @Column()
    title!: string

    @Field()
    @Length(4, 7)
    @Column()
    color!: string

    @ManyToMany(() => Post, post => post.tags)
    posts!: Post[]
}