import { useQuery } from "@tanstack/react-query";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Loading from "./components/Loading";
import Signup from "./Pages/Signup";
import Home from "./Pages/Home/Home";
import Signin from "./Pages/Signin";
import { useAuthUser } from "./Context/authUserContext";
import { useWebsocket } from "./Context/Websocket";
import Layout from "./Pages/Layout";
import FindFriends from "./Pages/FindFriends/FindFriends";
import Notifications from "./Pages/Notifications/Notification";
import Profile from "./Pages/Profile/Profile";
import { useState } from "react";
import Connect from "./Pages/Connect";

const App = () => {
  const { setAuthUser } = useAuthUser();
  const { setIsSignedIn, socket } = useWebsocket();
  const [isSignedIn, setSs] = useState<boolean | null>(null);

  const { isPending } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch(`/api/me`);
      const data = await res.json();
      if ("error" in data) return null;

      setAuthUser(data);
      setIsSignedIn(true);
      setSs(false);

      setTimeout(() => {
        setSs(true);
      }, 2000);
      return data;
    },
    retry: false,
  });

  if (isPending) {
    return (
      <div className="h-screen flex justify-center items-center ">
        <Loading />
      </div>
    );
  }

  if (!isSignedIn && isSignedIn !== null) {
    return <Connect />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/signup"
          element={!isSignedIn ? <Signup /> : <Navigate to="/" />}
        />
        <Route
          path="/signin"
          element={!isSignedIn ? <Signin /> : <Navigate to="/" />}
        />
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={isSignedIn ? <Home /> : <Navigate to="/signup" />}
          />
          <Route
            path="/search"
            element={isSignedIn ? <FindFriends /> : <Navigate to="/signup" />}
          />
          <Route
            path="/notifications"
            element={isSignedIn ? <Notifications /> : <Navigate to="/signup" />}
          />
          <Route
            path="/profile"
            element={isSignedIn ? <Profile /> : <Navigate to="/signup" />}
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
