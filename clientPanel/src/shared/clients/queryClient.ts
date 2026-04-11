import {QueryClient} from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            retryDelay: (attempt) => 80 * 2 ** attempt + Math.floor(Math.random() * 40),
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        },
    },
});

export { queryClient }
