import useSWR from "swr"

const fetcher = async (query: string) => {
    const data = await fetch('https://localhost:7123/graphql/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query })
    })
    return data.json()
}

export function usePosts() {
    const query = `{
        posts {
            id
            title
            content
            category {
                id
                name
            }
            tags {
                id
                name
                color
            }
        }
    }`

    const { data: { posts, errors }, mutate } = useSWR(query, fetcher)

    return { posts, mutate, errors }
}

export function useCategories() {
    const query = `{
        categories {
            id
            name
        }
    }`

    const { data: { categories, errors }, mutate } = useSWR(query, fetcher)

    return { categories, mutate, errors }
}

export function useTags() {
    const fetcher = async (url: string) => {
        const res = await fetch(url)
        if (!res.ok) {
            const { error } = await res.json()
            throw error
        }
        const { tags } = await res.json()
        return tags
    }

    const { data: tags, mutate, error } = useSWR('/api/tags', fetcher)

    return { tags, mutate, error }
}