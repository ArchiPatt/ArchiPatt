import { Group, Button } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const getVisiblePages = () => {
        if (totalPages <= 7) return pages;

        if (currentPage <= 4) {
            return [...pages.slice(0, 5), '...', totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [1, '...', ...pages.slice(totalPages - 5)];
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    const visiblePages = getVisiblePages();

    return (
        <Group spacing="xs" position="center">
            <Button
                variant="outline"
                compact
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <IconChevronLeft size={16} />
            </Button>

            {visiblePages.map((page, index) =>
                page === '...' ? (
                    <Button key={`ellipsis-${index}`} variant="subtle" disabled compact>
                        ...
                    </Button>
                ) : (
                    <Button
                        key={page}
                        variant={currentPage === page ? 'filled' : 'outline'}
                        // color={currentPage === page ? 'blue' : undefined}
                        compact
                        onClick={() => onPageChange(page as number)}
                    >
                        {page}
                    </Button>
                )
            )}

            <Button
                variant="outline"
                compact
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <IconChevronRight size={16} />
            </Button>
        </Group>
    );
}

export { Pagination }