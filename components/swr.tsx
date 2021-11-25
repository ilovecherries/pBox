import useSWR from "swr"

export function usePosts() {
    const fetcher = async (url: string) => {
        const res = await fetch(url)
        if (!res.ok) {
            const { error } = await res.json()
            throw error
        }
        const { posts } = await res.json()
        return posts
    }

    const { data: posts, mutate, error } = useSWR('/api/posts', fetcher)

    return { posts, mutate, error }
}

export function useCategories() {
    const fetcher = async (url: string) => {
        const res = await fetch(url)
        if (!res.ok) {
            const { error } = await res.json()
            throw error
        }
        const { categories } = await res.json()
        return categories
    }

    const { data: categories, mutate, error } = useSWR('/api/categories', fetcher)

    return { categories, mutate, error }
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