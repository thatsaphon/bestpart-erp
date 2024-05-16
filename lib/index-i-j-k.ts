
type IndexIJK = {
    i: number,
    j: number,
    k: number
}

export function indexIJK(current: IndexIJK, length: IndexIJK) {
    let i = 0

    for (let i = 0;i < length.i;i++) {
        for (let j = 0;j < length.j;j++) {
            for (let k = 0;k < length.k;k++) {
                if (i === current.i, j === current.j, k === current.k) break
                i++
            }
        }
    }
    return i
}