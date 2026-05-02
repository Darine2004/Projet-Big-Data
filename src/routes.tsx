import { createBrowserRouter } from 'react-router-dom'
import LandingPage from './app/pages/LandingPage'
import Dashboard from './app/pages/Dashboard'

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage
  },
  {
    path: "/dashboard",
    Component: Dashboard
  }
], {
  basename: '/Projet-Big-Data'
})
