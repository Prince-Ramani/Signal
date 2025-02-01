import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import AuthuserProvider from "./Context/authUserContext.tsx";
import WebSocketProvider from "./Context/Websocket.tsx";
import { Toaster } from "./components/ui/toaster.tsx";

const queryclient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryclient}>
    <ToastContainer
      position="top-center"
      theme="dark"
      hideProgressBar={true}
      autoClose={1500}
    />
    <Toaster />
    <AuthuserProvider>
      <WebSocketProvider>
        <App />
      </WebSocketProvider>
    </AuthuserProvider>
  </QueryClientProvider>
);
