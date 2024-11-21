export const shortDateFormat = (date: Date | undefined) => {
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Bangkok', // Set time zone to Bangkok
        localeMatcher: 'best fit',
    }).format(date)
}

export const fullDateFormat = (date: Date | undefined) => {
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Bangkok', // Set time zone to Bangkok
        localeMatcher: 'best fit',
    }).format(date)
}
