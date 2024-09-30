import React from 'react'

export const inputNumberPreventDefault = (
    e: React.KeyboardEvent<HTMLElement>
) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') e.preventDefault()
}

export const onFocusPreventDefault = (
    e: React.FocusEvent<HTMLInputElement, Element>
) => {
    e.target.addEventListener(
        'wheel',
        function (e) {
            e.preventDefault()
        },
        { passive: false }
    )
}
