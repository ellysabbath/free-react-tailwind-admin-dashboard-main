import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";

import BasicTables from "./pages/Tables/BasicTables";
import PasswordResetRequest from './components/auth/PasswordResetRequest';
import OTPVerification from './components/auth/OTPVerification';
import PasswordResetConfirm from './components/auth/PasswordResetConfirm';
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import LandingPage from "./pages/landing";
import SubjectsPage from "./components/tables/BasicTables//SubjectsPage";
import ResultsPage from "./components/tables/BasicTables/ResultsPage";
import AcademicYear from "./components/tables/BasicTables/AcademicYear";
import SemestersPage from "./components/tables/BasicTables/SemestersPage";
import MyResults from "./components/tables/BasicTables/MyResults";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route index path="/" element={<LandingPage/>}/>
          <Route element={<AppLayout />}>
            <Route index path="/dashboard" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/blank" element={<Blank />} />
            
            {/* Forms */}
            <Route path="/accounts" element={<BasicTables />} />

            {/* Tables */}
            <Route path="/semesters" element={<BasicTables />} />
            <Route path="/year/semester/results" element={<ResultsPage />} />
            <Route path="/year/semester" element={<SemestersPage />} />
            <Route path="/year/subjects/" element={<SubjectsPage />} />
             <Route path="/year" element={<AcademicYear />} />


            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/results" element={<MyResults />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

        // Add these routes
<Route path="/reset-password" element={<PasswordResetRequest />} />
<Route path="/reset-password-verify" element={<OTPVerification />} />
<Route path="/reset-password-confirm" element={<PasswordResetConfirm />} />

          

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
