import Head from "next/head"
import React from "react"
import { Container, Col, Row } from "react-bootstrap"
import Navigation from "../components/Navigation"
import useUser from "../components/useUser"
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

export const getStaticProps = async () => {
    const tags = await ModelUtil.getList(Tag)
    const categories = await ModelUtil.getList(Category)

    return {
        props: {
            tags: tags.map(t => {
                return {
                    id: t.id,
                    name: t.name,
                    color: t.color
                }
            }),
            categories: categories.map(c => {
                return {
                    id: c.id,
                    name: c.name
                }
            })
        }
    }
}

export default function ConfigView({categories, tags}: ConfigViewProps) {
    const { user } = useUser()

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
                {categories && categories.map(c => (<>
                    <Row key={c.id}>
                        <Col>
                            {c.name}
                        </Col>
                    </Row>
                </>))}
            </Container>
        </Container>
    </>)
}