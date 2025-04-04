import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { StoreInput } from "./StoreInput"; // adjust path as needed

export const Store = () => {
  const { storeId } = useParams();
  const history = useHistory();

  // Default shape so we don’t blow up if Firestore doc is missing fields.
  // Also using optional chaining in the JSX for extra safety.
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
        indexes: [], // Our dynamic array
      },
    },
  });

  useEffect(() => {
    // If we're creating a new store, skip loading from Firestore.
    if (storeId === "new") return;

    const fetchStore = async () => {
      const docRef = doc(db, "stores", storeId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        // We merge or just replace the entire storeData?
        // Here we simply replace, but you can do a deep merge if you prefer.
        setStoreData(snapshot.data());
      } else {
        console.error("No such document!");
      }
    };

    fetchStore();
  }, [storeId]);

  // Handler for top-level fields (name, shortName, etc.)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoreData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for nested api.inventory fields (besides indexes)
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

  // --- Indexes array logic ---
  // 1) Add new item
  const handleAddIndex = () => {
    setStoreData((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        inventory: {
          ...prev.api?.inventory,
          indexes: [
            ...(prev.api?.inventory?.indexes || []),
            { label: "", index: "" },
          ],
        },
      },
    }));
  };

  // 2) Remove an item by index
  const handleRemoveIndex = (idx) => {
    setStoreData((prev) => {
      const newArr = [...(prev.api?.inventory?.indexes || [])];
      newArr.splice(idx, 1); // remove that item
      return {
        ...prev,
        api: {
          ...prev.api,
          inventory: {
            ...prev.api.inventory,
            indexes: newArr,
          },
        },
      };
    });
  };

  // 3) Move an item up
  const handleMoveUp = (idx) => {
    if (idx === 0) return; // can't move up if it's the first
    setStoreData((prev) => {
      const newArr = [...(prev.api?.inventory?.indexes || [])];
      // swap item with the one above it
      [newArr[idx], newArr[idx - 1]] = [newArr[idx - 1], newArr[idx]];
      return {
        ...prev,
        api: {
          ...prev.api,
          inventory: {
            ...prev.api.inventory,
            indexes: newArr,
          },
        },
      };
    });
  };

  // 4) Move an item down
  const handleMoveDown = (idx) => {
    const arr = storeData.api?.inventory?.indexes || [];
    if (idx === arr.length - 1) return; // can't move down if it's last
    setStoreData((prev) => {
      const newArr = [...arr];
      // swap item with the one below it
      [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
      return {
        ...prev,
        api: {
          ...prev.api,
          inventory: {
            ...prev.api.inventory,
            indexes: newArr,
          },
        },
      };
    });
  };

  // 5) Update a field (label or index) for a specific item in the array
  const handleIndexFieldChange = (idx, fieldName, newValue) => {
    setStoreData((prev) => {
      const newArr = [...(prev.api?.inventory?.indexes || [])];
      newArr[idx] = {
        ...newArr[idx],
        [fieldName]: newValue,
      };
      return {
        ...prev,
        api: {
          ...prev.api,
          inventory: {
            ...prev.api.inventory,
            indexes: newArr,
          },
        },
      };
    });
  };

  const handleSave = async () => {
    // If storeId === 'new', you might want an addDoc instead.
    // But let's just do an upsert with setDoc for now:
    const docRef = doc(db, "stores", storeId);
    await setDoc(docRef, storeData, { merge: true });
    alert("Store saved!");
  };

  const handleDelete = async () => {
    const docRef = doc(db, "stores", storeId);
    await deleteDoc(docRef);
    alert("Store deleted!");
    history.push("/admin/stores");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {storeId === "new" ? "Create New Store" : "Edit Store"}
      </h1>

      {/* Top-level fields (using StoreInput for the nice style) */}
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

      {/* Nested API inventory fields */}
      <StoreInput
        label="X-Algolia-API-Key"
        name="X-Algolia-API-Key"
        value={storeData.api?.inventory?.["X-Algolia-API-Key"] ?? ""}
        onChange={handleApiInventoryChange}
      />

      <StoreInput
        label="X-Algolia-Application-Id"
        name="X-Algolia-Application-Id"
        value={storeData.api?.inventory?.["X-Algolia-Application-Id"] ?? ""}
        onChange={handleApiInventoryChange}
      />

      <label className="block mb-2">
        <div className="mb-1">Default Index</div>
        <select
          className="bg-white bg-opacity-0 hover:bg-opacity-5 rounded border border-white border-opacity-20 p-2 w-full"
          value={storeData.api?.inventory?.defaultIndex ?? ""}
          onChange={(e) =>
            setStoreData((prev) => ({
              ...prev,
              api: {
                ...prev.api,
                inventory: {
                  ...prev.api.inventory,
                  defaultIndex: e.target.value,
                },
              },
            }))
          }
        >
          {/* Optional placeholder option */}
          <option value="">(No default selected)</option>

          {/* Populate options from indexes array */}
          {(storeData.api?.inventory?.indexes || []).map((item, idx) => (
            <option key={idx} value={item.index}>
              {item.label || "(Untitled)"} ({item.index})
            </option>
          ))}
        </select>
      </label>

      {/* INDEXES ARRAY */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Indexes</h2>

        {/* Add new index button */}
        <button
          onClick={handleAddIndex}
          className="bg-white bg-opacity-0 hover:bg-opacity-5 rounded border border-white border-opacity-20 p-2 mb-4"
        >
          + Add Index
        </button>

        {(storeData.api?.inventory?.indexes || []).map((item, idx) => (
          <div
            key={idx}
            className="mb-4 border border-white border-opacity-20 p-2 rounded"
          >
            <div className="flex gap-4 mb-2">
              {/* LABEL input */}
              <StoreInput
                label="Label"
                name="label"
                value={item.label ?? ""}
                onChange={(e) =>
                  handleIndexFieldChange(idx, "label", e.target.value)
                }
              />

              {/* INDEX input */}
              <StoreInput
                label="Index"
                name="index"
                value={item.index ?? ""}
                onChange={(e) =>
                  handleIndexFieldChange(idx, "index", e.target.value)
                }
              />
            </div>

            {/* Move Up, Move Down, Remove */}
            <div className="flex gap-2">
              <button
                onClick={() => handleMoveUp(idx)}
                className="bg-white bg-opacity-0 hover:bg-opacity-5 rounded border border-white border-opacity-20 p-2"
              >
                Move Up
              </button>
              <button
                onClick={() => handleMoveDown(idx)}
                className="bg-white bg-opacity-0 hover:bg-opacity-5 rounded border border-white border-opacity-20 p-2"
              >
                Move Down
              </button>
              <button
                onClick={() => handleRemoveIndex(idx)}
                className="bg-white bg-opacity-0 hover:bg-opacity-5 rounded border border-white border-opacity-20 p-2"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons (Save/Delete) */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleSave}
          className="bg-white bg-opacity-0 hover:bg-opacity-5 rounded border border-white border-opacity-20 p-2"
        >
          Save
        </button>

        {/* Only show Delete if NOT creating a new store */}
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
