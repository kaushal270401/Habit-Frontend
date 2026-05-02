'use client'

import keycloak from "@/lib/keycloak";
import { useContext, useMemo, useState, useEffect } from "react";
import { AuthContext } from "./Context/AuthProvider";
import { fetchApi } from "@/lib/api";
import HabitDialog from "./Component/HabitDialog";


const getLast7Days = () => {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(date.getDate()).padStart(2, '0');

    days.push({
      fullDate: date,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      day: date.getDate(),
      iso: `${year}-${month}-${dayOfMonth}`,
    });
  }

  return days;
};

export default function Home() {
  const auth = useContext(AuthContext);
  const [habits, setHabits] = useState<any[]>([]);
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const dates = useMemo(() => getLast7Days(), []);
  const username = auth?.user?.preferred_username || auth?.user?.name || "User";
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);

  const fetchHabits = async () => {
    if (!auth?.token) return;
    const habitsRes = await fetchApi("/api/habits", "GET", auth.token);
    if (habitsRes.success) setHabits(habitsRes.habits);
  };

  const totalHabits = habits?.length || 0;

  const completedToday = habits?.filter((item: any) => {
    const today = new Date().toISOString().split("T")[0];
    return logs[`${item._id}-${today}`];
  }).length || 0;

  useEffect(() => {
    if (!auth?.token) return;

    const token = auth.token;

    const load = async () => {
      try {
        const [habitsRes, logsRes] = await Promise.all([
          fetchApi("/api/habits", "GET", token),
          fetchApi("/api/habit-logs", "GET", token),
        ]);

        if (habitsRes.success) {
          setHabits(habitsRes.habits);
          const streakResults = await Promise.all(
            habitsRes.habits.map((habit: { _id: string; }) =>
              fetchApi(`/api/habits/streak/${habit._id}`, "GET", token)
                .then((res) => ({ id: habit._id, streak: res.success ? res.streak : 0 }))
                .catch(() => ({ id: habit._id, streak: 0 }))
            )
          );
          setStreaks(Object.fromEntries(streakResults.map(({ id, streak }) => [id, streak])));
        }

        if (logsRes.success) {
          const logMap: Record<string, boolean> = {};
          logsRes.logs.forEach((log: any) => {
            logMap[`${log.habitId}-${log.date}`] = log.completed;
          });
          setLogs(logMap);
        }
      } catch (error) {
        console.error("Error fetching habits:", error);
      }
    };

    load();
  }, [auth?.token]);

  const handleDelete = async (id: string) => {
    if (!auth?.token) return;
    try {
      const response = await fetchApi(`/api/habits/${id}`, "DELETE", auth.token);
      if (response.success) {
        setHabits(prevData => prevData.filter((habit: any) => habit._id !== id));
      }
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  }

  const handleHabitLogs = async (id: string, date: string) => {
    if (!auth?.token) return;
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




  return (
    <div className="flex justify-center bg-black min-h-screen text-white">
      <div className="w-full max-w-4xl px-4 py-8">

        <div className="flex items-start justify-between mb-6">

          {/* Left Section */}
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl sm:text-4xl font-bold flex items-center gap-2">
              🧑‍🎨 {displayName}'s Habits
            </h2>

            {/* Progress text */}
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              🔥 {completedToday}/{totalHabits} done today
            </div>

            {/* Progress bar */}
            <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-300"
                style={{
                  width: `${(completedToday / totalHabits) * 100 || 0}%`
                }}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 text-gray-300">
            <button
              onClick={() => keycloak.logout()}
              className="hover:text-white transition"
            >
              🚪 Logout
            </button>

            <button className="hover:text-white transition">
              📊 Insights
            </button>
          </div>
        </div>

        <p className="text-gray-400 mb-4">
          Start tracking your daily habits
        </p>

        <div className="mb-6">
          <HabitDialog onHabitAdded={fetchHabits} />
        </div>

        <div className="flex flex-col gap-6">
          {habits?.map((item: any) => {
            return (
              <div
                key={item._id}
                className="bg-zinc-900 rounded-xl p-5 shadow-md"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between mb-4">

                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex items-center justify-center bg-zinc-800 rounded-lg text-xl">
                      {item.icon}
                    </div>

                    <div>
                      <h1 className="text-lg font-semibold">
                        {item.title}
                      </h1>
                      <span className="text-xs text-gray-400 border border-gray-600 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    🗑️
                  </button>
                </div>

                {/* Streak */}
                <div className="text-sm text-gray-400 mb-3">
                  Current streak: {streaks[item._id] || 0}
                </div>

                {/* Days */}
                <div className="flex gap-2">
                  {dates.map((day: any) => {
                    const logKey = `${item._id}-${day.iso}`;
                    const isCompleted = logs[logKey];

                    return (
                      <div key={day.iso} className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">
                          {day.label.slice(0, 2)}
                        </span>

                        <button
                          className={`h-10 w-10 rounded-md transition ${isCompleted
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-zinc-800 hover:bg-zinc-700"
                            }`}
                          onClick={() =>
                            handleHabitLogs(item._id, day.iso)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
