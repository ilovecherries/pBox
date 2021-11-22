import Head from "next/head"
import React from "react"
import { Container, Col, Row, Form, Button } from "react-bootstrap"
import Navigation from "../components/Navigation"
import { useTags, useUser, useCategories } from "../components/swr"
import { Category } from "../views/Category"
import { ModelUtil } from "../views/ModelView"
import { Tag } from "../views/Tag"

type TagProps = {
    id: number,
    name: string,
    color: string
}

type CategoryProps = {
    id: number,
    name: string
}

interface ConfigViewProps {
    tags: TagProps[],
    categories: CategoryProps[]
}

export default function ConfigView() {
    const { user } = useUser()
    const tagSWR = useTags()
    const { tags } = tagSWR, mutateTags = tagSWR.mutate
    const categorySWR = useCategories()
    const { categories } = categorySWR, mutateCategories = categorySWR.mutate

    const [categoryName, setCategoryName] = React.useState("")
    const [tagName, setTagName] = React.useState("")
    const [tagColor, setTagColor] = React.useState("")

    const onTagSubmit = async () => {
        const name = tagName, color = '#FFF'
        const response = await fetch("/api/tags", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, color })
        })
        mutateTags()
        setTagName('')
        setTagColor('')
    }

    const onCategorySubmit = async () => {
        const name = categoryName
        const response = await fetch("/api/categories", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name })
        })
        mutateCategories()
        setCategoryName('')
    }

    if (!(user && user.operator)) {
        return(<>
            <Head>
                <title>pBox - Configuration</title>
            </Head>
            <Navigation />
            <Container>
                <p>You do not have access to this page.</p>
            </Container>
        </>)
    }

    return (<>
        <Head>
            <title>pBox - Configuration</title>
        </Head>
        <Navigation />
        <Container>
            <h1>Configuration</h1>
            <Container>
                <h2>Categories</h2>
                <Row>
                    <Form.Control type="text" placeholder="Category name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
                    <Button variant="primary" onClick={onCategorySubmit}>Add</Button>
                </Row>
                {categories && categories.map((c: CategoryProps) => (<>
                    <Row key={c.id}>
                        <Col>
                            {c.name}
                        </Col>
                    </Row>
                </>))}
                <h2>Tags</h2>
                <Row>
                    <Form.Control type="text" placeholder="Tag name" value={tagName} onChange={(e) => setTagName(e.target.value)} />
                    <Button variant="primary" onClick={onTagSubmit}>Add</Button>
                </Row>
                {tags && tags.map((t: TagProps) => (<>
                    <Row key={t.id}>
                        <Col>
                            {t.name}
                        </Col>
                    </Row>
                </>))}
            </Container>
        </Container>
    </>)
}