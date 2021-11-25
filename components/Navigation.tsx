import React from "react"
import { Container, Nav, Navbar } from "react-bootstrap"
import { useUser } from '@auth0/nextjs-auth0'
import isOp from "./user"

export default function Navigation() {
    const { user } = useUser()

    return (
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="/">
                    pBox
                </Navbar.Brand>
                <Navbar.Collapse>
                    <Nav>
                        {user && isOp(user) && <>
                            <Nav.Item>
                                <Nav.Link href="/config">Configure</Nav.Link>
                            </Nav.Item>
                        </>}
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Collapse className="justify-content-end">
                    <Nav>
                        {!user && <>
                            <Nav.Link href="/api/auth/login">Log In</Nav.Link>
                        </>}
                        {user && <>
                            <Navbar.Text>Signed in as: {user.name}</Navbar.Text>
                            <Nav.Link href="/api/auth/logout">Log Out</Nav.Link>
                        </>}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}