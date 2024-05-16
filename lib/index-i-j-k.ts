type IndexIJK = {
    i: number
    j: number
    k: number
}

export function indexIJK(
    current: IndexIJK,
    array4D: Array<Array<Array<any>>>
): number {
    // console.log(current)
    // console.log(array4D)
    let index = 0

    for (let i = 0; i < array4D.length; i++) {
        for (let j = 0; j < array4D[i].length; j++) {
            for (let k = 0; k < array4D[i][j].length; k++) {
                console.log(current, i, j, k)
                if (i === current.i && j === current.j && k === current.k)
                    return index
                index++
            }
        }
    }

    return index
}

export function lengthOfArray4D(array4D: Array<Array<Array<any>>>): number {
    let length = 0

    for (let i = 0; i < array4D.length; i++) {
        for (let j = 0; j < array4D[i].length; j++) {
            for (let k = 0; k < array4D[i][j].length; k++) {
                length++
            }
        }
    }

    return length
}
