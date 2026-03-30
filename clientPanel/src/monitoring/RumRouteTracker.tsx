import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { sendRumNavigation } from "./rum";

export function RumRouteTracker() {
    const loc = useLocation();
    useEffect(() => {
        sendRumNavigation(loc.pathname + loc.search);
    }, [loc.pathname, loc.search]);
    return null;
}
