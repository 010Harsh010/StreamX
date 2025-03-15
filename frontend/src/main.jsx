import { createRoot } from "react-dom/client";
import "./index.css";
import React from "react";
import { Provider } from "react-redux";
import Layout from "./Component/Layout.jsx";
import Videogrid from "./Component/VideoGrid/Videogrid.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { SidebarProvider } from "./contextApi/SidebarContext.jsx";
import VideoPlayer from "./Component/VideoGrid/Videplayer.jsx";
import { VideoIdProvider } from "./contextApi/VideoidContext.jsx";
import { LoginProvider } from "./contextApi/LoginContext.jsx";
import { VideoListProvider } from "./contextApi/VideolistContext.jsx";
import { store } from "./app/store.js";
import LikedVideos from "./Component/VideoGrid/VideoLiked.jsx";
import History from "./pages/History.jsx";
import { Content } from "./pages/Mycontent.jsx";
import Subscriber from "./pages/Subscriber.jsx";
import Collection from "./pages/Collection.jsx";
import Setting from "./pages/Setting.jsx";
import Channel from "./pages/Channel.jsx";
import Notfound from "./pages/Notfound.jsx";
import Tweets from "./pages/Tweets.jsx";
import Support from "./pages/Support.jsx";
import PrivacyPolicy from "./pages/Policy.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SocketProvider from "./contextApi/SocketContext.jsx";
import Live from "./pages/Live.jsx";
import GoLive from "./pages/GoLive.jsx";
import LoginWrapper from "./Component/LoginWrapper.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Videogrid />,
      },
      {
        path: "/login",
        element: (
          <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
            <Login />
          </GoogleOAuthProvider>
        ),
      },
      {
        path: "/register",
        element: (
          <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
            <Register />
          </GoogleOAuthProvider>
        ),
      },
      {
        path: "/key-video",
        element: <VideoPlayer />,
      },
      {
        path: "/likedcomponent",
        element: <LoginWrapper>
          <LikedVideos />
        </LoginWrapper>,
      },
      {
        path: "/user-history",
        element: <LoginWrapper>
          <History />
        </LoginWrapper>,
      },
      {
        path: "/content",
        element: <LoginWrapper>
          <Content />
        </LoginWrapper>,
      },
      {
        path: "/subscriber-user",
        element: <LoginWrapper>
          <Subscriber />
        </LoginWrapper>,
      },
      {
        path: "/playlist",
        element: <LoginWrapper>
          <Collection />
        </LoginWrapper>,
      },
      {
        path: "/setting",
        element: <LoginWrapper>
          <Setting />
        </LoginWrapper>,
      },
      {
        path: "/Searchuser/:userId",
        element: <Channel />,
      },
      {
        path: "/tweets",
        element: <Tweets />,
      },
      {
        path: "/live/:roomId",
        element: <LoginWrapper>
          <Live />
        </LoginWrapper>,
      },
      {
        path: "/golive/:roomId/:type",
        element: <LoginWrapper>
          <GoLive />
        </LoginWrapper>,
      },
      {
        path: "/support",
        element: (
          <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
            <Support />
          </GoogleOAuthProvider>
        ),
      },
      {
        path: "*",
        element: <Notfound />,
      },
      {
        path: "/policy",
        element: <PrivacyPolicy />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <SocketProvider>
      <VideoListProvider>
        <LoginProvider>
          <SidebarProvider>
            <VideoIdProvider>
              <RouterProvider router={router} />
            </VideoIdProvider>
          </SidebarProvider>
        </LoginProvider>
      </VideoListProvider>
    </SocketProvider>
  </Provider>
);
