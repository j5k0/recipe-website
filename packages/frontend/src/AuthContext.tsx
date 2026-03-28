import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const AuthContext = createContext<{user: { unique_id: string; user_name: string; email: string} | null; refreshUser: () => Promise<void>;}>({user: null, refreshUser: async () => {}});

export function AuthProvider({children}: {children: ReactNode}){
    const [user, setUser] = useState(null);

    const refreshUser = async () => {
        try {
            const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/auth/whoami', {
                credentials: "include",
            });
            if(res.ok)
                setUser(await res.json())
            else setUser(null)
        }
        catch{
            setUser(null);
        }
    }

    useEffect(() => {refreshUser();}, []);

    return (
        <AuthContext.Provider value={{user, refreshUser}}>
            {children}
            </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)
