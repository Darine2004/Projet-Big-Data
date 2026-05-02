import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import PipelinePage from "./pages/PipelinePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/pipeline",
    Component: PipelinePage,
  },
], { basename: "/Projet-Big-Data" });
