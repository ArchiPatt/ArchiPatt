import {LINK_PATHS} from "../constants/LINK_PATHS.ts";

function ErrorFallback({ error }: { error: Error }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 40,
            }}
        >
            <h2>Something went wrong</h2>
            <p>{error.message}</p>
            <Link to={LINK_PATHS.MAIN} />
        </div>
    );
}

export { ErrorFallback }
