import { Dashboard } from '@/components/dashboard'

export default async function Home() {
    return (
        <div className="p-5">
            <h1 className="mb-5 text-3xl font-bold underline">
                Welcome to BestPart Alai
            </h1>
            <Dashboard />
        </div>
    )
}
