'use client'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useContext, useState } from "react";
import { fetchApi } from "@/lib/api";
import { AuthContext } from "../Context/AuthProvider";
import { Plus } from "lucide-react";

const habitIcons = [
  "🏃","📚","💧","🧘","💪","🎨",
  "✍️","🎵","😴","🥗","💊","🧹"
];

const categoryMap = [
  { name: "Health", color: "bg-green-900 text-green-400 border-green-500/30" },
  { name: "Learning", color: "bg-blue-900 text-blue-400 border-blue-500/30" },
  { name: "Mindfulness", color: "bg-purple-900 text-purple-400 border-purple-500/30" },
  { name: "Fitness", color: "bg-orange-900 text-orange-400 border-orange-500/30" },
  { name: "Creativity", color: "bg-pink-900 text-pink-400 border-pink-500/30" },
  { name: "General", color: "bg-yellow-500 text-black border-yellow-400" }
];

const HabitDialog = ({ onHabitAdded }: { onHabitAdded: () => void }) => {
  const auth = useContext(AuthContext);
const [open, setOpen] = useState(false)


  const [formData, setFormData] = useState({
    title: "",
    category: "",
    icon: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.token) return;
    
    try {
      await fetchApi("/api/habits", "POST", auth.token, formData);
      onHabitAdded(); // Refresh the list
      setOpen(false);
      setFormData({ title: "", category: "", icon: "" }); // Reset form
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="border-dashed border-gray-400 px-4 py-2 rounded-md" onClick={() => setOpen(true)}>
          <Plus className="mr-2" /> New Habit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl bg-zinc-900 text-white rounded-xl">
        <form onSubmit={handleSubmit}>
          
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Habit</DialogTitle>
          </DialogHeader>

          <FieldGroup className="space-y-5 mt-4">

            {/* 🔹 ICONS */}
            <div className="grid grid-cols-6 gap-3">
              {habitIcons.map((icon) => {
                const isSelected = formData.icon === icon;

                return (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`
                      flex items-center justify-center h-12 w-12 text-2xl rounded-lg transition
                      ${isSelected
                        ? "bg-yellow-500 text-black scale-110"
                        : "bg-zinc-800 hover:bg-zinc-700"}
                    `}
                  >
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* 🔹 TITLE */}
            <Field>
              <Input
                id="title"
                name="title"
                placeholder="Running"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="bg-zinc-900 border border-zinc-700 text-white"
              />
            </Field>

            {/* 🔹 CATEGORIES */}
            <div className="flex flex-wrap gap-3">
              {categoryMap.map((category) => {
                const isSelected = formData.category === category.name;

                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        category: category.name,
                      })
                    }
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium border transition-all
                      ${isSelected
                        ? "bg-yellow-500 text-black border-yellow-400 scale-105 shadow-md"
                        : `${category.color} hover:opacity-80`}
                    `}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>

          </FieldGroup>

          <DialogFooter className=" bg-zinc-900  justify-end mt-6">
            <Button
              type="submit"
              disabled={!formData.title || !formData.category || !formData.icon}
              className="  w-full rounded-md  bg-yellow-700  text-black hover:bg-gray-200"
            >
              Save changes
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HabitDialog;