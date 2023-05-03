
import { BrowserRouter as Router, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import HexEditor from "./HexEditor";


const router = createBrowserRouter([
    {
      path: "/",
      element: <App/>,
    },
    {
      path: "/editor",
      element: <HexEditor />,
    },
  ]);

export const Routing    = () => {

    return (
        <RouterProvider router={router} />
    )
    }
