export function createQueryString(
    currentSearchParams: URLSearchParams | string,
    name: string,
    value: string | null
) {
    const params = new URLSearchParams(currentSearchParams)
    if (value) params.set(name, value)
    if (!value) params.delete(name)

    return params.toString()
}

export function deleteKeyFromQueryString(
    currentSearchParams: URLSearchParams | string,
    name: string
) {
    const params = new URLSearchParams(currentSearchParams)
    params.delete(name)

    return params.toString()
}
