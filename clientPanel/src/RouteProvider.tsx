import { Route, Routes } from "react-router-dom";
import {LINK_PATHS} from "./shared/constants/LINK_PATHS.ts";
import {Header} from "./ui/components/Header";
import {MainPage} from "./ui/pages/MainPage/MainPage.tsx";
import {ProfilePage} from "./ui/pages/ProfilePage/ProfilePage.tsx";
import {OpenCreditPage} from "./ui/pages/OpenCreditPage/OpenCreditPage.tsx";
import {AccountDetailPage} from "./ui/pages/AccountDetailPage/AccountDetailPage.tsx";
import {CreditDetailPage} from "./ui/pages/CreditDetailPage/CreditDetailPage.tsx";
import {NotFoundPage} from "./ui/pages/NotFoundPage/NotFoundPage.tsx";



const RouteProvider = () => {
    return (
        <Routes>
            <Route path={LINK_PATHS.MAIN} element={<Header />}>
                <Route index element={<MainPage />} />
                <Route path={LINK_PATHS.PROFILE} element={<ProfilePage />} />
                <Route path={LINK_PATHS.OPEN_CREDIT} element={<OpenCreditPage />} />
                <Route path={LINK_PATHS.ACCOUNT_DETAIL} element={<AccountDetailPage />} />
                <Route path={LINK_PATHS.CREDIT_DETAIL} element={<CreditDetailPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export { RouteProvider };
