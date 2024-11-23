// import { URLSearchParams } from 'url'

type Props = {
    searchParams: Promise<{ accountId?: string }>
}

export const revalidate = 600

export default async function AccountingPage(props: Props) {
    return <></>
}
