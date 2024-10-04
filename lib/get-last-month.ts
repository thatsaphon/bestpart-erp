import { startOfMonth } from 'date-fns'

export const getLastMonth = () => {
    const lastMonth = new Date()
    lastMonth.setDate(0)
    return startOfMonth(lastMonth)
}
