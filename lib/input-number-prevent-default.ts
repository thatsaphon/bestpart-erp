import React from 'react'

export const inputNumberPreventDefault = (
    e: React.KeyboardEvent<HTMLElement>
) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') e.preventDefault()
}
