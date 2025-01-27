import { createContext, useContext, useState } from "react";
import { userTypes } from "@/lib/Types";

interface authUserTypes {
  authUser: userTypes | null;
  setAuthUser: React.Dispatch<React.SetStateAction<userTypes | null>>;
}

const AuthUser = createContext<authUserTypes | undefined>(undefined);

const AuthuserProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<userTypes | null>(null);

  return (
    <AuthUser.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthUser.Provider>
  );
};

export const useAuthUser = () => {
  const context = useContext(AuthUser);

  if (context === undefined) {
    throw new Error("useAuthUser must be used within a UserContextProvider");
  }
  return context;
};

export default AuthuserProvider;
