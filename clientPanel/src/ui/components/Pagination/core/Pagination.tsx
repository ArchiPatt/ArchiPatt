import { Group, Button } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type {PaginationProps} from "../types/PaginationProps.ts";
import {usePagination} from "../../../../useCases/components/usePagination.ts";

const Pagination = (props: PaginationProps) => {

    const { currentPage, totalPages, onPageChange, visiblePages } = usePagination(props);

    return (
        <Group gap="xs" justify="center">
            <Button
                variant="outline"
                size="compact-xs"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <IconChevronLeft size={16} />
            </Button>

            {visiblePages.map((page, index) =>
                page === "..." ? (
                    <Button key={`ellipsis-${index}`} variant="subtle" disabled size="compact-xs">
                        ...
                    </Button>
                ) : (
                    <Button
                        key={page}
                        variant={currentPage === page ? "filled" : "outline"}
                        size="compact-xs"
                        onClick={() => onPageChange(page as number)}
                    >
                        {page}
                    </Button>
                )
            )}

            <Button
                variant="outline"
                size="compact-xs"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <IconChevronRight size={16} />
            </Button>
        </Group>
    );
};

export { Pagination };
