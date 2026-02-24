import { Route, Routes } from "react-router-dom";
import {LINK_PATHS} from "../../../../constants/LINK_PATHS.ts";
import {Header} from "../../../../components/Header";
import {MainPage} from "../../../../pages/MainPage";
import {ProfilePage} from "../../../../pages/ProfilePage";
import {OpenAccountPage} from "../../../../pages/OpenAccountPage";
import {OpenCreditPage} from "../../../../pages/OpenCreditPage";
import {AccountDetailPage} from "../../../../pages/AccountDetailPage";
import {NotFoundPage} from "../../../../pages/NotFoundPage";


const RouteProvider = () => {
    return (
        <Routes>
            <Route path={LINK_PATHS.MAIN} element={<Header />}>
                <Route index element={<MainPage />} />
                <Route path={LINK_PATHS.PROFILE} element={<ProfilePage />} />
                <Route path={LINK_PATHS.OPEN_ACCOUNT} element={<OpenAccountPage />} />
                <Route path={LINK_PATHS.OPEN_CREDIT} element={<OpenCreditPage />} />
                <Route path={LINK_PATHS.ACCOUNT_DETAIL} element={<AccountDetailPage />} />
                <Route path={LINK_PATHS.CREDIT_DETAIL} element={<AccountDetailPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export { RouteProvider };
