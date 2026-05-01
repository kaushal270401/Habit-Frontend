'use client'

import {useState, useEffect, createContext, ReactNode, useRef} from 'react';
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
  const isRun = useRef(false);
  
  useEffect(()=>{
    if (isRun.current) return;
    isRun.current = true;

    keycloak.init({
      onLoad:'login-required',
      checkLoginIframe: false 
    }).then((auth)=>{
        if(auth){
            setToken(keycloak.token ?? null);
            setUser(keycloak.tokenParsed ?? {}); 
        }
         setInitialized(true); 
    }).catch(console.error)
  },[])

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