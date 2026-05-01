import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { AuthContext } from "../Context/AuthProvider";
import { Plus } from "lucide-react";

const habitIcons = [
  "🏃",
  "📚",
  "💧",
  "🧘",
  "💪",
  "🎨",
  "✍️",
  "🎵",
  "😴",
  "🥗",
  "💊",
  "🧹",
];


const categoryMap = [
  "Health",
  "Learning",
  "Mindfulness",
  "Fitness",
  "Creativity",
  "General"
];

const HabitDialog =() => {
  const auth=useContext(AuthContext)

  const handleSubmit = () => {
    fetchApi("/api/habits", "POST", auth.token,formData);
  };

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    icon: "",
  });
    return(
      <Dialog>
                <DialogTrigger asChild>
                  <Button className="border-dashed border-gray-400 px-4 py-2 rounded-sm"> <Plus /> New Habit</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg bg-zinc-900">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle className="text-xl text-white">Add New Habit</DialogTitle>
                      <DialogDescription>
                            Add a new habit to your tracker
                      </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                   <div className="grid grid-cols-8 gap-3">
                        {habitIcons.map((icon) => (
                            <button
                            key={icon}
                            type="button"
                            onClick={()=>setFormData({...formData,icon:icon})}
                            className="flex items-center justify-center h-14 w-14 text-2xl rounded-lg bg-zinc-900 hover:bg-zinc-800"
                            >
                            {icon}
                            </button>
                        ))}
                        </div>
                      <Field>
                        <Input id="title" name="title" placeholder="Running" value={formData.title} onChange={(e)=>setFormData({...formData,title:e.target.value})}/>
                      </Field>
                       <div className="grid grid-cols-6 gap-3">
                        {categoryMap.map((category) => (
                            <button
                            key={category}
                            onClick={()=>setFormData({...formData,category:category})}
                            type="button"
                            className="flex items-center justify-center h-14 w-14 text-2xl rounded-lg bg-zinc-900 hover:bg-zinc-800"
                            >
                            {category}
                            </button>
                        ))}
                        </div>
                    </FieldGroup>
                    <DialogFooter className="bg-zinc-900 border-none">
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
    )
}
export default HabitDialog