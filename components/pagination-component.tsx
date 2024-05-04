import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

type Props = {
    page: string
    limit: string
    numberOfPage: number
}

export default function PaginationComponent({
    page,
    limit,
    numberOfPage,
}: Props) {
    return (
        <Pagination className="mt-4">
            <PaginationContent>
                {page !== '1' && (
                    <PaginationItem>
                        <PaginationPrevious
                            href={`?page=${+page - 1}&limit=${limit}`}
                        />
                    </PaginationItem>
                )}
                {Array.from({
                    length: numberOfPage,
                }).map((_, index) => (
                    <PaginationItem key={index}>
                        <PaginationLink
                            isActive={+page === index + 1}
                            href={`?page=${index + 1}&limit=${limit}`}
                        >
                            {index + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                {page !== String(numberOfPage) && (
                    <PaginationItem>
                        <PaginationNext
                            href={`?page=${+page + 1}&limit=${limit}`}
                        />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    )
}
