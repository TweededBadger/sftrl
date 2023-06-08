import {
  BrowserRouter as Router,
  Route,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import HexEditor from "./HexEditor";
import CombatTest from "./CombatTest";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/editor",
    element: <HexEditor />,
  },
  {
    path: "/combatTest",
    element: <CombatTest />,
  },
]);

export const Routing = () => {
  return <RouterProvider router={router} />;
};
