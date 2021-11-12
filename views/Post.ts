import { HasDto } from "./ModelView";
import { Tag } from "./Tag";
import { User } from "./User";

export interface PostData {
    title: string
    content: string
}

export interface PostDto extends PostData {
    id: number
}

export class Post implements PostData, HasDto<PostDto> {
    public id: number = 0
    public title: string = ''
    public content: string = ''
    public author: User | undefined
    public tags: Tag[] | undefined
    public score: number = 0

    constructor(postPartial: Partial<Post> = {}) {
        Object.assign(this, postPartial);
    }

    public toDto(): PostDto {
        return {
            id: this.id,
            title: this.title,
            content: this.content
        }
    }
}