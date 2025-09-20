"use client";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import SortableItem from "@/components/SortableItem";

type Topic = {
  id: string;
  title: string;
};

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [input, setInput] = useState("");
  const ids = useMemo(() => topics.map((t) => t.id), [topics]);

  useEffect(() => {
    fetch("/api/topics").then(async (res) => {
      const data = await res.json();
      setTopics(data);
    });
  }, []);

  async function addTopic() {
    const title = input.trim();
    if (!title) return;
    setInput("");
    const res = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const topic = await res.json();
    if (res.ok) setTopics((prev) => [...prev, topic]);
  }

  async function deleteTopic(id: string) {
    const prev = topics;
    setTopics((t) => t.filter((x) => x.id !== id));
    const res = await fetch(`/api/topics?id=${id}`, { method: "DELETE" });
    if (!res.ok) setTopics(prev);
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = topics.findIndex((t) => t.id === active.id);
    const newIndex = topics.findIndex((t) => t.id === over.id);
    const newOrder = arrayMove(topics, oldIndex, newIndex);
    setTopics(newOrder);
    const orderedIds = newOrder.map((t) => t.id);
    await fetch("/api/topics", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-10 glass border-b border-black/10 dark:border-white/10">
        <div className="mx-auto w-full max-w-md px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">{process.env.NEXT_PUBLIC_APP_NAME ?? "Convo List"}</h1>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md px-4 pb-16 pt-4">
        <div className="glass rounded-2xl shadow-soft p-0">
          <div className="flex gap-2 px-4 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTopic()}
              placeholder="Add a topic for later..."
              className="flex-1 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
            />
            <button
              onClick={addTopic}
              className="shrink-0 rounded-xl bg-foreground text-background px-4 py-3 text-sm font-medium active:opacity-90"
            >
              Add
            </button>
          </div>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ul className="mt-4 space-y-2">
              {topics.map((t) => (
                <SortableItem key={t.id} id={t.id} title={t.title} onDelete={deleteTopic} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </main>
    </div>
  );
}
