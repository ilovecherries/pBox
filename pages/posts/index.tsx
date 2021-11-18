import Head from 'next/head'
import React from 'react'
import prisma from '../../lib/prisma'
import { ModelUtil } from '../../views/ModelView'
import { Post, PostDto } from '../../views/Post'

import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import { Badge, Row } from 'react-bootstrap'

type TagProps = {
    id: number,
    name: string,
    color: string
}

type PostProps = {
    id: number,
    title: string,
    content: string,
    category: string,
    score: number,
    tags: TagProps[]
}

interface PostsViewProps {
    posts: PostProps[]
}

export async function getStaticProps() {
    let posts = await ModelUtil.getList(Post, {
        include: { category: true, PostTagRelationship: true }
    })
    posts = await Promise.all(posts.map(async post => {
        await post.loadTags()
        return post
    }))
    console.log(posts.map(p => p.getTags()))

    return {
        props: {
            posts: posts.map(p => {
                return {
                    id: p.id,
                    title: p.title,
                    content: p.content,
                    category: p.category!.name,
                    score: p.score,
                    tags: p.getTags().map(t => { return {
                        name: t.name,
                        color: t.color,
                        id: t.id
                    }})
                }
            }),
        }
    }
}

interface PostEntryProps {
    post: PostProps
}

function PostEntry({ post }: PostEntryProps) {
    return (
        <Row className="justify-content-between m-2 border">
            <Card.Body className="col-9">
                <Card.Title>{post.title}</Card.Title>
                <Card.Text>
                    <div className="text-secondary">
                        {post.category}
                    </div>
                    {post.content}
                    <div>
                        {post.tags.map(t => (
                            <Badge key={t.name} className="m-1" style={{ backgroundColor: t.color }}>
                                {t.name}
                            </Badge>
                        ))}
                    </div>
                </Card.Text>
            </Card.Body>
            <div className="justify-content-center col-2">
                <Row>
                    <Button className="">
                        +
                    </Button>
                </Row>
                <Row className="justify-content-center fs-5">
                    {post.score}
                </Row>
                <Row>
                    <Button className="">
                        -
                    </Button>
                </Row>
            </div>
        </Row>
    )
}

export default function PostsView({ posts }: PostsViewProps) {
    return (
        <div>
            <Head>
                <title>Posts</title>
            </Head>
            <h1>Posts</h1>
            <Container>
                { posts && posts.map(post => <PostEntry key={post.id} post={post} />) }
            </Container>
        </div>
    )
}