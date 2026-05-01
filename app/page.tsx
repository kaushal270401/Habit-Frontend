'use client'

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import keycloak from "@/lib/keycloak";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./Context/AuthProvider";
import { fetchApi } from "@/lib/api";
import HabitDialog from "./Component/HabitDialog";
import { Trash2 } from "lucide-react";


const getLast7Days = () => {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    days.push({
      fullDate: date,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      day: date.getDate(), 
      iso: date.toISOString().split("T")[0],
    });
  }

  return days;
};

export default function Home() {
  const auth=useContext(AuthContext)
  const [data ,setData] = useState([])
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const username = auth?.user?.preferred_username || auth?.user?.name|| "User";
  const dates = useMemo(() => getLast7Days(), []);

  useEffect(() => {
    const fetchHabits = async () => {
      if (auth?.token) {
        try {
          const response = await fetchApi("/api/habits", "GET", auth.token);
          setData(response.habits)
          console.log(response);

          if (response.habits) {
            const fetchedStreaks: Record<string, number> = {};
            await Promise.all(response.habits.map(async (habit: any) => {
              try {
                const streakRes = await fetchApi(`/api/habits/streak/${habit._id}`, "GET", auth.token);
                if (streakRes.success) {
                  fetchedStreaks[habit._id] = streakRes.streak;
                }
              } catch (err) {
                console.error("Error fetching streak", err);
              }
            }));
            setStreaks(fetchedStreaks);
          }

          // Fetch habit logs
          const logsResponse = await fetchApi("/api/habit-logs", "GET", auth.token);
          if (logsResponse.success && logsResponse.logs) {
            const fetchedLogs: Record<string, boolean> = {};
            logsResponse.logs.forEach((log: any) => {
              const logKey = `${log.habitId}-${log.date}`;
              fetchedLogs[logKey] = log.completed;
            });
            setLogs(fetchedLogs);
          }
        } catch (error) {
          console.error("Error fetching habits:", error);
        }
      }
    };
    fetchHabits();
  }, [auth?.token]);

  const handleDelete = async(id:string)=>{
    try {
      const response = await fetchApi(`/api/habits/${id}`, "DELETE", auth.token);
      if (response.success) {
        setData(prevData => prevData.filter((habit: any) => habit._id !== id));
      }
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  }

  const handleHabitLogs = async(id: string, date: string) => {
    const logKey = `${id}-${date}`;
    const isCurrentlyCompleted = logs[logKey] || false;
    const newStatus = !isCurrentlyCompleted;

    setLogs(prev => ({ ...prev, [logKey]: newStatus }));

    try {
      const response = await fetchApi(`/api/habit-logs`, "POST", auth.token, {
        habitId: id,
        date: date,
        completed: newStatus 
      });
      if (response.success) {
        
        const streakRes = await fetchApi(`/api/habits/streak/${id}`, "GET", auth.token);
        if (streakRes.success) {
          setStreaks(prev => ({ ...prev, [id]: streakRes.streak }));
        }
      }
    } catch (error) {
      console.error("Error adding habit log:", error);
      // Revert on error
      setLogs(prev => ({ ...prev, [logKey]: isCurrentlyCompleted }));
    }
  }


  console.log(logs)

  return (
    <div className="flex items-center justify-center">
          <Card className="flex h-screen w-[50%] bg-[oklch(0.145_0_0)] py-10 gap-5 overflow-y-auto">
            <div className="flex flex-row gap-5">
              <h2 className="text-4xl font-bold text-white flex items-center gap-2">
                🧑‍🎨 {username.charAt(0).toUpperCase() + username.slice(1)}'s habits
              </h2>
              <Button className='' onClick={()=>keycloak.logout()}>Logout</Button>
                </div>
              <p className="text-lg text-gray-400">Start tracking your daily habits</p>
              <HabitDialog/>
              {
                data?.map((item:Record<string,string>)=>{
                  return(
                    <Card key={item._id} className="bg-[oklch(23%_0_0)] py-1.25rem min-w-[10px] min-h-[200px]">
                      
                        <div className='flex flex-row gap-3'>
                        <Button className="pointer-cursor p-5 h-14 w-14 text-2xl">{item.icon}</Button>
                        <h1 className="text-white text-xl font-bold">{item.title}</h1>
                        <div className="border border-gray-500  h-[40%]">
                          <p className="text-white">{item.category}</p>
                        </div>
                        <Button onClick={()=>handleDelete(item._id)}><Trash2 /></Button>
                    
                        </div>
                        <div>Current streak: {streaks[item._id] || 0}</div>
                        <div className="flex flex-row">
                            {dates.map((day: any)=>{
                                const logKey = `${item._id}-${day.iso}`;
                                const isCompleted = logs[logKey];
                                return (
                                  <div key={day.iso} className="flex flex-col items-center ">
                                      <h1 className="text-gray-200 text-sm" >{day.label.slice(0,2)}</h1>
                                      <Button 
                                        className={`p-5 h-14 w-14 text-2xl cursor-pointer transition-colors duration-200 ${
                                          isCompleted 
                                            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                            : 'bg-zinc-800 hover:bg-zinc-700'
                                        }`} 
                                        onClick={()=>handleHabitLogs(item._id,day.iso)}
                                      >
                                      </Button>
                                  </div>
                                )
                            })}
                        </div>
                    </Card>
                  ) 
                })
              }
          </Card>
    </div>  
  );
}
