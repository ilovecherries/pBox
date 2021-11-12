import { HasDto } from "./ModelView"

export interface UserDto {
    id: number
    username: string
    operator: boolean
}

export class User implements UserDto, HasDto<UserDto> {
    public id: number = -1
    public username: string = ""
    public operator: boolean = false
    public hashed_password: string = ""
    public salt: string = ""

    public constructor(userPartial: Partial<User> = {}) {
        Object.assign(this, userPartial);
    }

    toDto(): UserDto {
        return {
            id: this.id,
            username: this.username,
            operator: this.operator
        };
    }
}