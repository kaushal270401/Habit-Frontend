'use client'

import Image from "next/image";
import { useEffect,useState } from "react";
import keycloak from "@/lib/keycloak";


export default function Home() {
  const [data ,setData]= useState()
  useEffect(() => {
  keycloak.init({ onLoad: "login-required" }).then((authenticated) => {
    console.log("Token:", keycloak.token);
  });
}, []);

const getData=async()=>{
    await fetch("http://localhost:5000/api/habits",{
      method:"GET",
      headers :{
        Authorization :`Bearer ${keycloak.token}`
      }
    })
}

  return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <button
              className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
              onClick={getData}
            >
              Get Data
            </button>
          </div>
        </main>
      </div>
  );
}
