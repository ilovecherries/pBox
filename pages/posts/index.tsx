import Head from 'next/head'
import React from 'react'
import prisma from '../../lib/prisma'
import { ModelUtil } from '../../views/ModelView'
import { Post, PostDto } from '../../views/Post'

import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'

interface PostsViewProps {
    posts: PostDto[]
}

export async function getStaticProps() {
    const posts = await ModelUtil.getList(Post, prisma.post)

    return {
        props: {
            posts: posts.map(p => p.toDto()),
        }
    }
}

interface PostEntryProps {
    post: PostDto
}

function PostEntry({ post }: PostEntryProps) {
    return (
        <Card>
            <Card.Body>
                <Card.Title>{post.title}</Card.Title>
                <Card.Text>{post.content}</Card.Text>
            </Card.Body>
        </Card>
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