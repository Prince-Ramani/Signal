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

const App = () => {
  const { setAuthUser } = useAuthUser();
  const { setIsSignedIn } = useWebsocket();
  const { data, isPending } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch(`/api/me`);
      const data = await res.json();
      if ("error" in data) return;

      setAuthUser(data);
      setIsSignedIn(true);

      return data;
    },
    retry: false,
  });

  const isSignedIn = !!data?._id && !data?.error;

  if (isPending) {
    return (
      <div className="h-screen flex justify-center items-center ">
        <Loading />
      </div>
    );
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
        <Route
          path="/"
          element={isSignedIn ? <Home /> : <Navigate to="signup" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
