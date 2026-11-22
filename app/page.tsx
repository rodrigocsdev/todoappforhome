
"use client";

import { useEffect, useMemo, useState } from "react";

type Task = {
  id: number;
  title: string;
  room: string;
  done: boolean;
};

const STORAGE_KEY = "minhas-tarefas-domesticas";

const rooms = [
  "Todos",
  "Quarto",
  "Sala",
  "Cozinha",
  "Banheiro",
  "Lavanderia",
  "Área externa",
];

const roomIcons: Record<string, string> = {
  Quarto: "🛏️",
  Sala: "🛋️",
  Cozinha: "🍳",
  Banheiro: "🚿",
  Lavanderia: "🧺",
  "Área externa": "🌿",
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newRoom, setNewRoom] = useState("Cozinha");
  const [selectedRoom, setSelectedRoom] = useState("Todos");
  const [showCompleted, setShowCompleted] = useState(true);
  const [search, setSearch] = useState("");
  const [storageError, setStorageError] = useState(false);

  // 1. Recupera os dados ao abrir a página
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved !== null) {
        const parsed: unknown = JSON.parse(saved);

        if (
          Array.isArray(parsed) &&
          parsed.every(
            (task) =>
              task &&
              typeof task.id === "number" &&
              typeof task.title === "string" &&
              typeof task.room === "string" &&
              typeof task.done === "boolean"
          )
        ) {
          setTasks(parsed);
        } else {
          console.error("Formato de tarefas inválido.");
          
        }
      } else {
        // Primeira utilização
        
      }
    } catch (error) {
      console.error("Erro ao recuperar tarefas:", error);
      setStorageError(true);
      
    } finally {
      setLoaded(true);
    }
  }, []);

  // 2. Salva automaticamente toda alteração
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      setStorageError(false);
    } catch (error) {
      console.error("Erro ao salvar tarefas:", error);
      setStorageError(true);
    }
  }, [tasks, loaded]);

  const completed = tasks.filter((task) => task.done).length;
  const pending = tasks.length - completed;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completed / tasks.length) * 100);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesRoom =
        selectedRoom === "Todos" || task.room === selectedRoom;

      const matchesStatus = showCompleted || !task.done;

      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesRoom && matchesStatus && matchesSearch;
    });
  }, [tasks, selectedRoom, showCompleted, search]);

  // Adicionar tarefa
  function addTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!newTask.trim()) return;

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newTask.trim(),
        room: newRoom,
        done: false,
      },
    ]);

    setNewTask("");
  }

  // Concluir tarefa
  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  // Excluir tarefa
  function deleteTask(id: number) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  // Excluir tarefas concluídas
  function clearCompleted() {
    setTasks((prev) => prev.filter((task) => !task.done));
  }

  // Restaurar lista inicial
  function resetTasks() {
    if (window.confirm("Deseja restaurar a lista inicial?")) {
      
      setSelectedRoom("Todos");
      setSearch("");
      setShowCompleted(true);
    }
  }

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100">
        <p className="font-medium text-emerald-800">
          Recuperando suas tarefas...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-800 sm:py-12">
      <div className="mx-auto max-w-3xl">

        <header className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
            Minha rotina
          </p>
          <h1 className="mt-2 text-4xl font-bold">
            Afazeres de casa 🏡
          </h1>
          <p className="mt-2 text-stone-500">
            Organize sua casa, uma tarefa de cada vez.
          </p>
        </header>

        {/* PROGRESSO */}
        <section className="mb-6 rounded-2xl bg-emerald-800 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100">Progresso geral</p>
              <p className="mt-1 text-4xl font-bold">{progress}%</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {completed}/{tasks.length}
              </p>
              <p className="text-sm text-emerald-100">concluídas</p>
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-emerald-950/40">
            <div
              className="h-full rounded-full bg-emerald-300 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 flex justify-between text-sm text-emerald-100">
            <span>✅ {completed} concluídas</span>
            <span>⏳ {pending} pendentes</span>
          </div>
        </section>

        {/* STATUS DO SALVAMENTO */}
        <div className="mb-5 flex items-center gap-2 text-sm">
          {storageError ? (
            <span className="text-red-600">
              ⚠️ Não foi possível salvar. Verifique o armazenamento do navegador.
            </span>
          ) : (
            <span className="text-emerald-700">
              💾 Suas alterações são salvas automaticamente.
            </span>
          )}
        </div>

        {/* ADICIONAR */}
        <section className="mb-7 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">➕ Nova tarefa</h2>

          <form onSubmit={addTask} className="space-y-3">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Digite uma tarefa..."
              className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-600"
            />

            <select
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3"
            >
              {rooms.filter((room) => room !== "Todos").map((room) => (
                <option key={room} value={room}>
                  {roomIcons[room]} {room}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!newTask.trim()}
              className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-40"
            >
              Adicionar tarefa
            </button>
          </form>
        </section>

        {/* BUSCA */}
        <section className="mb-5">
          <h2 className="mb-3 text-lg font-bold">📋 Minhas tarefas</h2>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔎 Buscar tarefa..."
            className="mb-4 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-600"
          />

          <div className="flex flex-wrap gap-2">
            {rooms.map((room) => (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  selectedRoom === room
                    ? "bg-emerald-700 text-white"
                    : "bg-white text-stone-600 hover:bg-emerald-50"
                }`}
              >
                {room === "Todos"
                  ? "Todas"
                  : `${roomIcons[room]} ${room}`}
              </button>
            ))}
          </div>
        </section>

        {/* OPÇÕES */}
        <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="h-4 w-4 accent-emerald-700"
            />
            Mostrar concluídas
          </label>

          <button
            onClick={clearCompleted}
            disabled={completed === 0}
            className="text-sm font-semibold text-red-600 disabled:opacity-40"
          >
            Limpar concluídas
          </button>
        </section>

        {/* LISTA */}
        <section className="space-y-3">
          {filteredTasks.map((task) => (
            <article
              key={task.id}
              className={`flex items-center gap-3 rounded-xl border p-4 shadow-sm ${
                task.done
                  ? "border-emerald-100 bg-emerald-50"
                  : "border-white bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
                className="h-5 w-5 cursor-pointer accent-emerald-700"
              />

              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${task.done ? "text-stone-400 line-through" : ""}`}>
                  {task.title}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {roomIcons[task.room] || "🏠"} {task.room}
                </p>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                aria-label={`Excluir ${task.title}`}
                className="rounded-lg px-3 py-2 text-xl text-stone-400 hover:bg-red-50 hover:text-red-600"
              >
                ×
              </button>
            </article>
          ))}

          {filteredTasks.length === 0 && (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <p className="text-3xl">✨</p>
              <p className="mt-3 font-semibold">
                Nenhuma tarefa encontrada!
              </p>
            </div>
          )}
        </section>

        {/* RODAPÉ */}
        <footer className="mt-8 rounded-2xl bg-white p-5 text-center shadow-sm">
          {progress === 100 && tasks.length > 0 ? (
            <p className="font-bold text-emerald-700">
              🎉 Todas as tarefas foram concluídas!
            </p>
          ) : (
            <p className="text-sm text-stone-500">
              Um pouquinho por dia faz toda a diferença! 💚
            </p>
          )}

          <button
            onClick={resetTasks}
            className="mt-4 text-sm font-medium text-stone-400 underline hover:text-emerald-700"
          >
            Restaurar lista inicial
          </button>
        </footer>

      </div>
    </main>
  );
}
