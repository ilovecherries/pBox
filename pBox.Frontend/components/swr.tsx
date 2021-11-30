import useSWR from "swr"

const fetcher = async (query: string) => {
    const res = await fetch('https://localhost:7123/graphql/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query })
    })
    return res.json()
}

export function usePosts() {
    const query = `{
        posts {
            id
            title
            content
            score
            myScore
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

    const { data, mutate } = useSWR(query, fetcher)
    console.log(data)

    return { posts: data?.data?.posts, mutate, errors: data?.data?.errors }
}

export function useMyScore() {
    const query = `{
        posts {
            id
            myScore
        }
    }`

    const { data, mutate } = useSWR(query, fetcher)
    console.log(data)

    return { posts: data?.data?.posts, mutate, errors: data?.data?.errors }
}

export function useCategories() {
    const query = `{
        categories {
            id
            name
        }
    }`

    const { data, mutate } = useSWR(query, fetcher)

    return { categories: data?.data?.categories, mutate, errors: data?.data?.errors }
}

export function useTags() {
    const query = `{
        tags {
            id
            name
            color
        }
    }`

    const { data, mutate } = useSWR(query, fetcher)

    return { tags: data?.data?.tags, mutate, errors: data?.data?.errors }
}