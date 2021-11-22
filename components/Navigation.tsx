import React from "react"
import { Button, Container, Form, Modal, Nav, Navbar } from "react-bootstrap"
import { useUser } from "./swr"

interface UserFormModalProps {
    title: string,
    submit: string,
    show: boolean,
    onHide: () => void,
    onSubmit: (username: string, password: string) => Promise<Response>
}

function UserFormModal({title, submit, onSubmit, show, onHide}: UserFormModalProps) {
    const { mutate } = useUser()
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")

    const usernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
    }

    const passwordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const onSubmitClick = async () => {
        await onSubmit(username, password)
        onHide()
        // window.location.reload()
        mutate()
    }

    return (<>
        <Modal centered show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" name="username" value={username} onChange={usernameChange}/>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" name="password" value={password} onChange={passwordChange}/>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={onSubmitClick}>
                    {submit}
                </Button>
            </Modal.Footer>
        </Modal>
    </>)
}

export default function Navigation() {
    const { user, mutate } = useUser()
    const [showLogin, setShowLogin] = React.useState(false)
    const [showRegister, setShowRegister] = React.useState(false)

    const handleShowLogin = () => setShowLogin(true)
    const handleHideLogin = () => setShowLogin(false)
    const handleShowRegister = () => setShowRegister(true)
    const handleHideRegister = () => setShowRegister(false)

    const handleLogout = async () => {
        await fetch('/api/logout', {
            method: 'POST'
        }).then(res => res.text())
        mutate(null)
    }

    const login = (username: string, password: string) => {
        return fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
    }

    const register = (username: string, password: string) => {
        return fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
    }

    return (
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="/">
                    pBox
                </Navbar.Brand>
                <Navbar.Collapse>
                    <Nav>
                        {user && user.operator && <>
                            <Nav.Item>
                                <Nav.Link href="/config">Configure</Nav.Link>
                            </Nav.Item>
                        </>}
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Collapse className="justify-content-end">
                    <Nav>
                        {!user && <>
                            <Nav.Link onClick={handleShowRegister} href="#signup">Sign Up</Nav.Link>
                            <UserFormModal title="Sign Up" submit="Register" show={showRegister} onHide={handleHideRegister} onSubmit={register}/>
                            <Nav.Link onClick={handleShowLogin} href="#login">Log In</Nav.Link>
                            <UserFormModal title="Log In" submit="Login" show={showLogin} onHide={handleHideLogin} onSubmit={login}/>
                        </>}
                        {user && <>
                            <Navbar.Text>Signed in as: {user.username}</Navbar.Text>
                            <Nav.Link onClick={handleLogout} href="#logout">Log Out</Nav.Link>
                        </>}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}