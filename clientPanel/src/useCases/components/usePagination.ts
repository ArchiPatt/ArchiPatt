import type {PaginationProps} from "@mantine/core";

const usePagination = (props: PaginationProps) => {

    const { currentPage, totalPages, onPageChange } = props

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const getVisiblePages = () => {
        if (totalPages <= 7) return pages;

        if (currentPage <= 4) {
            return [...pages.slice(0, 5), "...", totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [1, "...", ...pages.slice(totalPages - 5)];
        }

        return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    };

    const visiblePages = getVisiblePages();

    return { currentPage, totalPages, onPageChange, visiblePages };
}

export { usePagination }