

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://habit-backend-1-t6on.onrender.com";

export const fetchApi =async(url:string ,method:string ,token:string ,body?:Record<string,unknown>|null)=>{
    const response = await fetch(`${API_BASE_URL}${url}`,{ 
        method ,
        headers:{
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`
        },
        body:body?JSON.stringify(body):undefined
    })
    return response.json();
}