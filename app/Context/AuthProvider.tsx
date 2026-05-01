'use client'

import {useState ,useEffect ,createContext, ReactNode} from 'react';
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
  
  useEffect(()=>{
    keycloak.init({onLoad:'login-required'}).then((auth)=>{
        if(auth){
            setToken(keycloak.token ?? null);
            setUser(keycloak.tokenParsed ?? {}); 
        }
         setInitialized(true); 
    })
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