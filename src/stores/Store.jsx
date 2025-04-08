import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { StoreInput } from "./StoreInput";
import { v4 as cuid } from "cuid";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { FaTrash, FaGripLines } from "react-icons/fa";

export const Store = () => {
  const { storeId } = useParams();
  const history = useHistory();

  const [storeData, setStoreData] = useState({
    name: "",
    shortName: "",
    legalName: "",
    address: "",
    phone: "",
    website: "",
    api: {
      inventory: {
        "X-Algolia-API-Key": "",
        "X-Algolia-Application-Id": "",
        defaultIndex: "",
        indexes: [],
      },
    },
  });

  useEffect(() => {
    if (storeId === "new") return;

    const fetchStore = async () => {
      const docRef = doc(db, "stores", storeId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setStoreData(snapshot.data());
      } else {
        console.error("No such document!");
      }
    };

    fetchStore();
  }, [storeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoreData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApiInventoryChange = (e) => {
    const { name, value } = e.target;
    setStoreData((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        inventory: {
          ...prev.api?.inventory,
          [name]: value,
        },
      },
    }));
  };

  const handleAddIndex = () => {
    setStoreData((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        inventory: {
          ...prev.api?.inventory,
          indexes: [
            ...(prev.api?.inventory?.indexes ?? []),
            { label: "", index: cuid() },
          ],
        },
      },
    }));
  };

  const handleRemoveIndex = (idx) => {
    setStoreData((prev) => {
      const newArr = [...(prev.api?.inventory?.indexes ?? [])];
      newArr.splice(idx, 1);
      return {
        ...prev,
        api: {
          ...prev.api,
          inventory: {
            ...prev.api?.inventory,
            indexes: newArr,
          },
        },
      };
    });
  };

  const handleIndexFieldChange = (idx, fieldName, newValue) => {
    setStoreData((prev) => {
      const newArr = [...(prev.api?.inventory?.indexes ?? [])];
      newArr[idx] = { ...newArr[idx], [fieldName]: newValue };
      return {
        ...prev,
        api: {
          ...prev.api,
          inventory: {
            ...prev.api?.inventory,
            indexes: newArr,
          },
        },
      };
    });
  };

  const handleSave = async () => {
    const docRef = doc(db, "stores", storeId);
    await setDoc(docRef, storeData, { merge: true });
    alert("Store saved!");
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this store?"
    );
    if (!confirmed) return;

    const docRef = doc(db, "stores", storeId);
    await deleteDoc(docRef);
    alert("Store deleted!");
    history.push("/admin/stores");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const indexes = storeData?.api?.inventory?.indexes ?? [];
    const oldIndex = indexes.findIndex((i) => i.index === active.id);
    const newIndex = indexes.findIndex((i) => i.index === over.id);
    const reordered = arrayMove(indexes, oldIndex, newIndex);

    setStoreData((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        inventory: {
          ...prev.api.inventory,
          indexes: reordered,
        },
      },
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const SortableIndexItem = ({ index, idx }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: index?.index || idx.toString(),
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="mb-4 border border-white border-opacity-20 p-2 rounded bg-white bg-opacity-5"
      >
        <div className="w-full flex items-center gap-2 mb-2">
          <span {...listeners} {...attributes} className="cursor-grab p-4">
            <FaGripLines />
          </span>

          <div className=" w-full  flex gap-4">
            <StoreInput
              label="Label"
              name="label"
              value={index?.label ?? ""}
              onChange={(e) =>
                handleIndexFieldChange(idx, "label", e.target.value)
              }
            />
            <StoreInput
              label="Index"
              name="index"
              value={index?.index ?? ""}
              labelClass="flex-grow"
              onChange={(e) =>
                handleIndexFieldChange(idx, "index", e.target.value)
              }
            />
          </div>

          <button
            onClick={() => handleRemoveIndex(idx)}
            className="ml-2 bg-white bg-opacity-0 hover:bg-opacity-5 rounded border border-white border-opacity-20 p-2"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    );
  };

  const indexes = storeData?.api?.inventory?.indexes ?? [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {storeId === "new" ? "Create New Store" : "Edit Store"}
      </h1>

      {/* Top-level fields */}
      <StoreInput
        label="Name"
        name="name"
        value={storeData?.name ?? ""}
        onChange={handleChange}
      />
      <StoreInput
        label="Short Name"
        name="shortName"
        value={storeData?.shortName ?? ""}
        onChange={handleChange}
      />
      <StoreInput
        label="Legal Name"
        name="legalName"
        value={storeData?.legalName ?? ""}
        onChange={handleChange}
      />
      <StoreInput
        label="Address"
        name="address"
        value={storeData?.address ?? ""}
        onChange={handleChange}
      />
      <StoreInput
        label="Phone"
        name="phone"
        value={storeData?.phone ?? ""}
        onChange={handleChange}
      />
      <StoreInput
        label="Website"
        name="website"
        value={storeData?.website ?? ""}
        onChange={handleChange}
      />

      {/* API fields */}
      <StoreInput
        label="X-Algolia-API-Key"
        name="X-Algolia-API-Key"
        value={storeData?.api?.inventory?.["X-Algolia-API-Key"] ?? ""}
        onChange={handleApiInventoryChange}
      />
      <StoreInput
        label="X-Algolia-Application-Id"
        name="X-Algolia-Application-Id"
        value={storeData?.api?.inventory?.["X-Algolia-Application-Id"] ?? ""}
        onChange={handleApiInventoryChange}
      />

      {/* Default index dropdown */}
      <label className="block mb-2">
        <div className="mb-1">Default Index</div>
        <select
          className="bg-white bg-opacity-0 hover:bg-opacity-5 rounded border border-white border-opacity-20 p-2 w-full"
          value={storeData?.api?.inventory?.defaultIndex ?? ""}
          onChange={(e) =>
            setStoreData((prev) => ({
              ...prev,
              api: {
                ...prev.api,
                inventory: {
                  ...prev.api?.inventory,
                  defaultIndex: e.target.value,
                },
              },
            }))
          }
        >
          <option className="bg-black text-white" value="">
            (No default selected)
          </option>
          {indexes.map((item, idx) => (
            <option
              className="bg-black text-white"
              key={item?.index || idx}
              value={item?.index ?? ""}
            >
              {item?.label ?? "(Untitled)"} ({item?.index})
            </option>
          ))}
        </select>
      </label>

      {/* Index List with Drag-and-Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={indexes.map((i) => i.index)}
          strategy={verticalListSortingStrategy}
        >
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Indexes</h2>

            <button
              onClick={handleAddIndex}
              className="bg-white bg-opacity-0 hover:bg-opacity-5 rounded border border-white border-opacity-20 p-2 mb-4"
            >
              + Add Index
            </button>

            {indexes.filter(Boolean).map((item, idx) => (
              <SortableIndexItem key={item.index} index={item} idx={idx} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Save/Delete Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleSave}
          className="bg-white bg-opacity-0 hover:bg-opacity-5 rounded border border-white border-opacity-20 p-2"
        >
          Save
        </button>
        {storeId !== "new" && (
          <button
            onClick={handleDelete}
            className="bg-red-500 bg-opacity-80 hover:bg-opacity-90 text-white rounded border border-white border-opacity-20 p-2"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
