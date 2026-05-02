'use client'

import {useState, useEffect, createContext, ReactNode} from 'react';
import keycloak from '@/lib/keycloak'

interface AuthContextType {
  token: string | null;
  user: any;
  initialized: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);


const AuthProvider = ({children}:{children:ReactNode}) => {
  const [token,setToken] = useState<string | null>(null);
  const [user ,setUser] = useState<Record<string,any>>({});
  const [initialized, setInitialized] = useState(false);

  console.log(token , user ,initialized)
  
useEffect(() => {
  const initKeycloak = async () => {
    try {
      const authenticated = await keycloak.init({
        onLoad: 'login-required',
        checkLoginIframe: false,
        redirectUri: window.location.origin, // ✅ IMPORTANT
        pkceMethod: 'S256'
      });

      if (authenticated) {
        setToken(keycloak.token ?? null);
        setUser(keycloak.tokenParsed ?? {});
      }

      setInterval(() => {
        keycloak.updateToken(30).then((refreshed) => {
          if (refreshed) {
            setToken(keycloak.token ?? null);
          }
        }).catch(() => {
          keycloak.login();
        });
      }, 10000);

    } catch (err) {
      console.error("Keycloak init error:", err);
    } finally {
      setInitialized(true);
    }
  };

  initKeycloak();
}, []);

if (!initialized) {
    return <div>Loading...</div>;
  }

  
  return (
    <AuthContext.Provider value={{token ,user,initialized}}> 
    {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider