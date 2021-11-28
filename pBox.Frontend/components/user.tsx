import { UserProfile } from "@auth0/nextjs-auth0"

export default function isOp(user: UserProfile | undefined): boolean {
    const key = `${window.location.protocol}//${window.location.host}.Operator`
    if (user) {
        const l = window.location
        return user[key] as boolean ?? false
    }
    return false
}