import { Field, ID, InputType, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@InputType()
export class RegisterUserInput {
    @Field()
    username: string

    @Field()
    password: string
}

@Entity()
@ObjectType()
export class User extends BaseEntity {
    @Field(type => ID)
    @PrimaryGeneratedColumn()
    readonly id: number

    @Field()
    @Column()
    username: string

    @Field()
    @Column()
    operator: boolean

    @Column()
    password: string

    @Column()
    salt: string
}