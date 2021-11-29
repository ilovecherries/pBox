import React from "react"
import { Container, Nav, Navbar } from "react-bootstrap"
import isOp from "./user"
import { useAuth0 } from "@auth0/auth0-react"

export default function Navigation() {
    const { loginWithRedirect, logout, user } = useAuth0()

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
                            <Nav.Link onClick={() => loginWithRedirect({ returnTo: window.location.origin })} href="#">Log In</Nav.Link>
                        </>}
                        {user && <>
                            <Navbar.Text>Signed in as: {user.name}</Navbar.Text>
                            <Nav.Link onClick={() => logout({ returnTo: window.location.origin })} href="#">Log Out</Nav.Link>
                        </>}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}