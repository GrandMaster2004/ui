import { Outlet } from "react-router-dom";
import { LandingNavbar, LandingFooter } from "../components/LandingChrome.jsx";

export const LandingLayout = ({ user, onLogout }) => {
  return (
    <div className="landing landing--shell">
      <LandingNavbar />
      <div className="landing__page-content">
        <Outlet />
      </div>
      <LandingFooter />
    </div>
  );
};
