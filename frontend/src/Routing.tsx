import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import { AppContext } from "./App";
import { useContext } from "react";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";
import Overview from "./pages/Overview";

function Routing() {
  const { isLoggedIn } = useContext(AppContext);

  const router = createBrowserRouter([
    {
      path: "/",
      element: isLoggedIn ? <Dashboard /> : <Landing />,
      children: [
        {
          index: true,
          element: <Overview />,
        },
        {
          path: "settings",
          element: <Settings />,
        },
        {
          path: "transactions",
          element: <Transactions />,
        },
      ],
    },
    {
      path: "register",
      element: <Register />,
    },
    {
      path: "login",
      element: <Login />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default Routing;
