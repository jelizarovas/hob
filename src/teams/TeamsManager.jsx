// TeamsManager.jsx
import React, { useMemo, useCallback, useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  DragOverlay,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  writeBatch,
  addDoc,
  getDoc,
  getDocs,
  deleteField,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  FaUsers,
  FaPlus,
  FaGripLines,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { useAuth } from "../auth/AuthProvider";
import { db } from "../firebase";

function useCollection(ref) {
  const [docs, setDocs] = useState([]);
  useEffect(() => {
    if (!ref) return;
    return onSnapshot(ref, (snap) =>
      setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [ref]);
  return docs;
}

export default function TeamsManager() {
  const { currentUser, profile } = useAuth();
  const currentUserId = currentUser?.uid;
  const currentUserName =
    currentUser?.displayName ||
    `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();
  if (!currentUserId) return null;

  const storesRef = useMemo(() => collection(db, "stores"), []);
  const teamsRef = useMemo(() => collection(db, "teams"), []);
  const usersRef = useMemo(() => collection(db, "users"), []);

  const stores = useCollection(storesRef);

  const storeLookup = useMemo(
    () =>
      stores.reduce((m, s) => {
        m[s.id] = s.name;
        return m;
      }, {}),
    [stores]
  );

  const teams = useCollection(teamsRef);
  const users = useCollection(usersRef);

  const [activeId, setActiveId] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [unTab, setUnTab] = useState("unassigned");
  const [query, setQuery] = useState("");

  const unassigned = useMemo(
    () => users.filter((u) => !u.teamIds?.length),
    [users]
  );
  const filteredAll = useMemo(
    () =>
      users.filter((u) => {
        if (!query.trim()) return true;
        const hay = `${u.displayName ?? ""} ${u.firstName ?? ""} ${
          u.lastName ?? ""
        } ${u.email ?? ""}`.toLowerCase();
        return hay.includes(query.toLowerCase());
      }),
    [users, query]
  );
  const usersByTeam = useMemo(() => {
    const map = {};
    teams.forEach((t) => (map[t.id] = []));
    users.forEach((u) => {
      u.teamIds?.forEach((tid) => {
        const clean = tid.startsWith("team-") ? tid.slice(5) : tid;
        map[clean] = map[clean] || [];
        map[clean].push(u);
      });
    });
    return map;
  }, [teams, users]);

  // after you build `const storeLookup = useMemo(...);`

  async function syncAssignment(userId, toTeamId, fromTeamId) {
    const userRef = doc(db, "users", userId);
    const batch = writeBatch(db);

    // 1️⃣ Remove old assignment…
    if (fromTeamId) {
      batch.update(userRef, {
        [`assignments.${fromTeamId}`]: deleteField(),
        teamIds: arrayRemove(fromTeamId),
      });
      batch.delete(doc(db, "teams", fromTeamId, "members", userId));
    }

    // 2️⃣ Add new assignment & stores
    if (toTeamId) {
      const teamSnap = await getDoc(doc(db, "teams", toTeamId));
      const tData = teamSnap.data() || {};
      const teamName = tData.name || toTeamId;

      // derive raw store IDs
      const storeIds = tData.allStores
        ? stores.map((s) => s.id)
        : tData.storeIds || [];

      // ensure every entry has a real name (fallback to fetching if local cache missed it)
      const storeEntries = await Promise.all(
        storeIds.map(async (id) => {
          let name = storeLookup[id];
          if (!name) {
            const snap = await getDoc(doc(db, "stores", id));
            name = snap.exists() ? snap.data().name : id;
          }
          return { id, name };
        })
      );

      batch.update(userRef, {
        [`assignments.${toTeamId}`]: {
          teamId: toTeamId,
          teamName: teamName,
          stores: storeEntries, // now contains actual names
          addedAt: serverTimestamp(),
          addedBy: { userId: currentUserId, displayName: currentUserName },
        },
        teamIds: arrayUnion(toTeamId),
        storeIds: arrayUnion(...storeIds),
      });

      batch.set(doc(db, "teams", toTeamId, "members", userId), {
        addedAt: serverTimestamp(),
        addedBy: { userId: currentUserId, displayName: currentUserName },
      });
    }

    await batch.commit();
  }

  const handleAssign = useCallback(
    async (user, from, to) => {
      if (from === to) return;
      if (to === null && !from) return;
      await syncAssignment(user.id, to, from);
    },
    [currentUserId, currentUserName]
  );

  const addTeam = useCallback(
    async (storeId) => {
      const name = window.prompt("Team name?");
      if (!name) return;
      await addDoc(teamsRef, {
        name,
        allStores: !storeId,
        storeIds: storeId ? [storeId] : [],
        createdAt: Date.now(),
      });
    },
    [teamsRef]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (e) => {
    setActiveId(e.active.id);
    setActiveUser(users.find((u) => u.id === e.active.id) || null);
  };
  const handleDragEnd = (e) => {
    const { active, over } = e;
    setActiveId(null);
    setActiveUser(null);
    if (!over) return;
    const from = active.data.current?.teamId || null;
    const toRaw =
      over.data?.current?.teamId ??
      (over.id === "team-unassigned"
        ? null
        : over.id.startsWith("team-")
        ? over.id.slice(5)
        : null);
    if (from === toRaw) return;
    const user = users.find((u) => u.id === active.id);
    if (user) handleAssign(user, from, toRaw);
  };
  const dragging = activeId !== null;

  return (
    <div className="h-full w-full p-4 overflow-auto bg-gray-50 dark:bg-slate-900">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <UnassignedColumn
            users={unTab === "unassigned" ? unassigned : filteredAll}
            dragging={dragging}
            tab={unTab}
            onTabChange={setUnTab}
            query={query}
            onQueryChange={setQuery}
          />
          {teams
            .filter((t) => t.allStores)
            .map((t) => (
              <TeamColumn
                key={t.id}
                droppableId={t.id}
                title={t.name}
                users={usersByTeam[t.id] || []}
                dragging={dragging}
              />
            ))}
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-slate-200 dark:bg-slate-800 shadow-lg p-2 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold dark:text-slate-100">
                  {store.name}
                </h3>
                <button
                  className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-700"
                  onClick={() => addTeam(store.id)}
                >
                  <FaPlus />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {teams
                  .filter((t) => !t.allStores && t.storeIds?.includes(store.id))
                  .map((t) => (
                    <TeamColumn
                      key={t.id}
                      droppableId={t.id}
                      title={t.name}
                      users={usersByTeam[t.id] || []}
                      dragging={dragging}
                      handleAssign={handleAssign}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeUser && <ChipPreview user={activeUser} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function UnassignedColumn({
  users,
  dragging,
  tab,
  onTabChange,
  query,
  onQueryChange,
}) {
  const { isOver, setNodeRef } = useDroppable({ id: "team-unassigned" });
  const ring = isOver
    ? "ring-2 ring-green-500"
    : dragging
    ? "ring-2 ring-sky-300 dark:ring-sky-600"
    : "";
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl shadow p-3 bg-white dark:bg-slate-800 transition ring-offset-2 ${ring}`}
    >
      <div className="flex gap-4 mb-2 text-sm font-medium">
        <button
          onClick={() => onTabChange("unassigned")}
          className={tab === "unassigned" ? "underline" : "opacity-60"}
        >
          Unassigned
        </button>
        <button
          onClick={() => onTabChange("all")}
          className={tab === "all" ? "underline" : "opacity-60"}
        >
          All Users
        </button>
      </div>
      {tab === "all" && (
        <label className="relative block mb-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
            <FaSearch />
          </span>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search users…"
            className="w-full pl-8 pr-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-sm"
          />
        </label>
      )}
      <SortableContext
        items={users.map((u) => u.id)}
        strategy={rectSortingStrategy}
      >
        <ul className="space-y-2 max-h-[70vh] overflow-auto">
          {users.map((u) => (
            <UserChip key={u.id} user={u} teamId={null} />
          ))}
        </ul>
      </SortableContext>
      {users.length === 0 && (
        <p className="text-sm text-slate-400 dark:text-slate-500">No users</p>
      )}
    </div>
  );
}

function TeamColumn({ droppableId, title, users, dragging, handleAssign }) {
  const { isOver, setNodeRef } = useDroppable({ id: `team-${droppableId}` });
  const ring = isOver
    ? "ring-2 ring-green-500"
    : dragging
    ? "ring-2 ring-sky-300 dark:ring-sky-600"
    : "";
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl shadow p-3 bg-white dark:bg-slate-800 transition ring-offset-2 ${ring}`}
    >
      <h4 className="text-base font-medium mb-2 dark:text-slate-100">
        {title}
      </h4>
      <SortableContext
        items={users.map((u) => u.id)}
        strategy={rectSortingStrategy}
      >
        <ul className="space-y-2 min-h-[40px]">
          {users.map((u) => (
            <UserChip
              key={u.id}
              user={u}
              teamId={droppableId}
              removable
              onRemove={() => handleAssign(u, droppableId, null)}
            />
          ))}
        </ul>
      </SortableContext>
      {users.length === 0 && (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          No one here
        </p>
      )}
    </div>
  );
}

function UserChip({ user, teamId, removable = false, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: user.id, data: { teamId } });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (!teamId) return;
    if (
      !e.shiftKey &&
      !window.confirm(
        `Remove ${user.displayName ?? user.email} from this team?`
      )
    )
      return;
    onRemove();
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-xl shadow min-w-[200px]"
    >
      <span
        {...listeners}
        className="cursor-grab p-1 text-slate-400 dark:text-slate-300"
      >
        <FaGripLines />
      </span>
      <span className="font-medium truncate dark:text-slate-100 flex-1">
        {user.displayName ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`}
      </span>
      {removable && (
        <button
          onClick={handleRemove}
          className="text-xs p-1 text-slate-400 hover:text-red-500"
        >
          <FaTimes />
        </button>
      )}
      {user.email && (
        <span className="text-xs opacity-50 dark:text-slate-400 w-28 truncate text-right">
          {user.email}
        </span>
      )}
    </li>
  );
}

const ChipPreview = ({ user }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-xl shadow-lg">
    <FaGripLines className="text-slate-400 dark:text-slate-300" />
    <span className="font-medium truncate dark:text-slate-100">
      {user.displayName ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`}
    </span>
  </div>
);
