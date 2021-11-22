import Head from 'next/head'
import React, { useEffect } from 'react'
import prisma from '../lib/prisma'
import { Model, ModelUtil } from '../views/ModelView'
import { Post, PostDto } from '../views/Post'

import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import { Badge, ButtonGroup, FloatingLabel, Form, FormGroup, FormLabel, Modal, Row, ToggleButton, ToggleButtonGroup, Navbar, Nav } from 'react-bootstrap'
import { getUser, ironConfig, sessionWrapper } from '../lib/ironconfig'
import { withIronSessionSsr } from 'iron-session/next'
import { Tag } from '../views/Tag'
import { Category } from '../views/Category'
import Navigation from '../components/Navigation'
import { useUser, usePosts } from '../components/swr'
import { ArrowDown, ArrowUp, ArrowDownSquare, ArrowDownSquareFill, Trash } from 'react-bootstrap-icons'

type TagProps = {
    id: number,
    name: string,
    color: string
}

type CategoryProps = {
    id: number,
    name: string
}

type PostProps = {
    id: number,
    title: string,
    content: string,
    score: number,
    tags: TagProps[],
    myScore?: number,
    owner?: boolean,
    category: CategoryProps
}

interface PostsViewProps {
    posts: PostProps[],
    categories: CategoryProps[],
    tags: TagProps[]
}

export const getServerSideProps = withIronSessionSsr(async ({req, res}) =>  {
    let include: any = {
        category: true,
        PostTagRelationship: true
    }

    if (req.session) {
        include.votes = true
    }

    let user = await getUser(req.session)
    if (user && user.operator) {
        include.author = true
    }

    let posts = await Post.getList({
        include        // include: { category: true }
    })
    let tags = await ModelUtil.getList(Tag)
    let categories = await ModelUtil.getList(Category)


    let postProps: PostProps[] = posts.map(p => {
        let props: PostProps = {
            id: p.id,
            title: p.title,
            content: p.content,
            category: {
                name: p.category!.name,
                id: p.category!.id
            },
            score: p.score,
            tags: p.getTags().map(t => { return {
                name: t.name,
                color: t.color,
                id: t.id
            }})
        }
        if (user) {
            props.myScore = p.getScore(user)
            props.owner = p.authorId === user.id
        }
        return props
    })

    return {
        props: {
            posts: postProps,
            tags: tags.map(t => { return {
                id: t.id,
                name: t.name,
                color: t.color
            }}),
            categories: categories.map(c => { return {
                id: c.id,
                name: c.name
            }})
        }
    }
}, ironConfig)

interface PostEntryProps {
    post: PostProps
}

interface VoteHandlerProps {
    postId: number,
    score: number,
    myScore?: number
}

function VoteHandler({ postId, score, myScore }: VoteHandlerProps) {
    const [vote, setVote] = React.useState(myScore)
    const [voteRadio, setVoteRadio] = React.useState(myScore)
    const baseScore = score - (myScore ?? 0)

    useEffect(() => {
        setVote(myScore)
    }, [myScore])

    async function sendVote(score: number) {
        if (myScore !== undefined) {
            let body = { score }
            await fetch(`/api/posts/votes/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }).then(() => {
                setVote(score) 
            }).catch(err => console.error(err))
        }
    }

    async function removeVote() {
        if (myScore !== undefined) {
            await fetch(`/api/posts/votes/${postId}`, {
                method: 'DELETE'
            }).then(() => {
                setVote(0)
            }).catch(err => console.error(err))
        }
    }

    async function onUpvoteClick() {
        if (vote === 1) {
            await removeVote()
        } else {
            await sendVote(1)
        }
    }

    async function onDownvoteClick() {
        if (vote === -1) {
            await removeVote()
        } else {
            await sendVote(-1)
        }
    }

    return (<div className="m-2 float-end">
        <Button className="p-3" variant={vote === 1 ? 'success' : 'outline-success'} onClick={onUpvoteClick}>
            <ArrowUp />
        </Button>
        <div className="text-center">
            {baseScore + (vote ?? 0)}
        </div>
        <Button className="p-3" variant={vote === -1 ? 'danger' : 'outline-danger'} onClick={onDownvoteClick}>
            <ArrowDown />
        </Button>
    </div>)
}

function PostEntry({ post }: PostEntryProps) {
    const { user } = useUser()
    const { mutate } = usePosts()

    const deletePost = async () => {
        await fetch(`/api/posts/${post.id}`, {
            method: 'DELETE'
        }).then(() => {
            mutate()
        }).catch(err => console.error(err))
    }

    return (
        <Row className="bg-white justify-content-between m-2 border">
            <Card.Body className="col-9">
                <Card.Title>{post.title}</Card.Title>
                <Card.Text>
                    <div className="text-secondary">
                        {post.category.name}
                    </div>
                    {post.content}
                    <div>
                        {post.tags.map(t => (
                            <Badge key={t.name} className="m-1" style={{ backgroundColor: t.color }}>
                                {t.name}
                            </Badge>
                        ))}
                    </div>
                    <div>
                        {(post.owner || (user && user.operator)) && <Button variant="outline-danger" className="p-1" onClick={deletePost}>
                            <Trash />
                        </Button>}
                    </div>
                </Card.Text>
            </Card.Body>
            <div className="justify-content-center col-2">
                <VoteHandler postId={post.id} score={post.score} myScore={post.myScore} />
            </div>
        </Row>
    )
}

type PostFormProps = {
    categories: CategoryProps[]
    tags: TagProps[]
}

function PostForm({ categories, tags }: PostFormProps) {
    const { mutate } = usePosts()
    const [show, setShow] = React.useState(false)
    const [title, setTitle] = React.useState('')
    const [content, setContent] = React.useState('')
    const [category, setCategory] = React.useState(0)
    const [tagsSelected, setTagsSelected] = React.useState<number[]>([])

    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)

    const handleSubmit = async () => {
        const data = { title, content, tags: tagsSelected, categoryId: category }
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            setTitle('')
            setContent('')
            setCategory(0)
            setTagsSelected([])
            handleClose()
            mutate()
        } catch (e) {
            console.error(e)
        }
    }

    const titleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value)
    }

    const contentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value)
    }

    const categoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(parseInt(event.target.value))
    }

    const tagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const element = event.target
        const tagId = parseInt(element.id.split('-')[1])
        const checked = element.checked
        if (checked) {
            setTagsSelected([...tagsSelected, tagId])
        } else {
            setTagsSelected(tagsSelected.filter(x => x !== tagId))
        }
    }

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                New Post
            </Button>
        
            <Modal centered show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Category</Form.Label>
                        <Form.Select onChange={categoryChange} defaultValue={0} name="category">
                            <option disabled value={0}>Select a category</option>
                            {categories && categories.map((c) => (
                                <option value={c.id} key={c.id}>{c.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="text" name="title" value={title} onChange={titleChange}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Content</Form.Label>
                        <Form.Control rows={6} as="textarea" name="content" value={content} onChange={contentChange}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Tags</Form.Label>
                        {tags && tags.map((t) => (<span key={t.id}>
                            {/* <Form.Check key={i} type="checkbox" label={t.name} name="tags" value={t.id}/> */}
                            <input onChange={tagChange} type="checkbox" className="btn-check" id={`posttag-${t.id}`} autoComplete="off" />
                            <label className="m-1 btn-sm btn btn-outline-primary" htmlFor={`posttag-${t.id}`}>{t.name}</label>
                        </span>))}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}


export default function PostsView({ categories, tags }: PostsViewProps) {
    const { user } = useUser()
    const { posts, mutate } = usePosts()
    const [filteredPosts, setFilteredPosts] = React.useState(posts)
    const [categoryFilter, setCategoryFilter] = React.useState<number>(0)
    const [tagFilters, setTagFilters] = React.useState<number[]>([])
    const [textFilter, setTextFilter] = React.useState<string>('')

    React.useEffect(() => {
        mutate()
    }, [user, mutate])

    React.useEffect(() => {
        if (!posts) {
            return
        }
        const categoryPosts = posts
            .filter((p: PostProps) => (categoryFilter > 0) ? p.category.id === categoryFilter : true)
        const newPosts = categoryPosts.filter((p: PostProps) => {
            if (tagFilters.length === 0) {
                return true
            }
            return p.tags.some((t: TagProps) => tagFilters.includes(t.id))
        })
        const textPosts = newPosts.filter((p: PostProps) => {
            if (textFilter === '') {
                return true
            }
            const f = textFilter.toLowerCase()
            return p.title.toLowerCase().includes(f) || p.content.toLowerCase().includes(f)
        })
        setFilteredPosts(textPosts)
    }, [posts, tagFilters, categoryFilter, textFilter])

    const handleTagFilterUpdate = (event: React.ChangeEvent<HTMLInputElement>) => { 
        const element = event.target
        const tagId = parseInt(element.id.split('-')[1])
        const checked = element.checked
        if (checked) {
            setTagFilters([...tagFilters, tagId])
        } else {
            setTagFilters(tagFilters.filter(x => x !== tagId))
        }
    }

    const handleTextFilter = (event: React.ChangeEvent<HTMLInputElement>) => { 
        const element = event.target
        setTextFilter(element.value)
    }

    const handleCategoryUpdate = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const element = event.target
        setCategoryFilter(parseInt(element.value))
    }

    return (
        <div>
            <Head>
                <title>pBox</title>
            </Head>
            <Navigation />
            <Container>
                <Form>
                    <Form.Group>
                        <Form.Label>Filter by Text</Form.Label>
                        <Form.Control onChange={handleTextFilter} type="text" placeholder="Search input"/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Filter by Category</Form.Label>
                        <Form.Select defaultValue={0} onChange={handleCategoryUpdate} name="category">
                            <option value={0}></option>
                            {categories && categories.map((c, i) => (
                                <option value={c.id} key={i}>{c.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Filter by Tag</Form.Label>
                        {tags && tags.map((t) => (<span key={t.id}>
                            {/* <Form.Check key={i} type="checkbox" label={t.name} name="tags" value={t.id}/> */}
                            <input onChange={handleTagFilterUpdate} type="checkbox" className="btn-check" id={`tag-${t.id}`} autoComplete="off" />
                            <label className="m-1 btn-sm btn btn-outline-primary" htmlFor={`tag-${t.id}`}>{t.name}</label>
                        </span>))}
                    </Form.Group>
                </Form>
            </Container>
            <Container>
                {user && <PostForm tags={tags} categories={categories}/>}
            </Container>
            <Container>
                { filteredPosts && filteredPosts.slice(0).reverse().map((post: PostProps) => <PostEntry key={post.id} post={post} />) }
            </Container>
        </div>
    )
}