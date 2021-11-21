import useSWR from "swr"

export default function useUser() {
    const fetcher = async (...args: any[]) => {
        const res = await fetch(...args)
        if (!res.ok) {
            const { error } = await res.json()
            throw error
        }
        const { user } = await res.json()
        return user
    }

    const { data: user, mutate, error } = useSWR('/api/users/me', fetcher)

    return { user, mutate, error }
}
