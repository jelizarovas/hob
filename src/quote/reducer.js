export function quoteReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "UPDATE_PARAM":
      return { ...state, [action.payload.key]: action.payload.value };
    case "SET_NESTED_FIELD":
      const { field, key, subfield, value, include } = action;
      return {
        ...state,
        [field]: {
          ...state[field],
          [key]: {
            include: true,
            ...state[field][key],
            [subfield]: value,
          },
        },
      };
    case "DELETE_NESTED_FIELD":
      const newState = { ...state };

      // Check if the field exists and is an object
      if (
        newState[action.field] &&
        typeof newState[action.field] === "object"
      ) {
        delete newState[action.field][action.key];
      }

      return newState;

    case "TOGGLE_INCLUDE":
      return {
        ...state,
        [action.field]: {
          ...state[action.field],
          [action.key]: {
            ...state[action.field][action.key],
            include: !state[action.field][action.key].include,
          },
        },
      };

    case "TOGGLE_ALL_INCLUDES":
      const fieldToUpdate = state[action.field];
      let updatedField;

      if (action.state === "check" || action.state === "intermediate") {
        updatedField = Object.fromEntries(
          Object.entries(fieldToUpdate).map(([key, item]) => [
            key,
            { ...item, include: true },
          ])
        );
      } else if (action.state === "uncheck") {
        updatedField = Object.fromEntries(
          Object.entries(fieldToUpdate).map(([key, item]) => [
            key,
            { ...item, include: false },
          ])
        );
      }
      return {
        ...state,
        [action.field]: updatedField,
      };

    case "UPDATE_PRICES":
      const delta = action.payload.listPrice - action.payload.sellingPrice;
      if (delta === 0) {
        return {
          ...state,
          listedPrice: action.payload.listPrice,
          sellingPrice: action.payload.sellingPrice,
          discount: 0,
        };
      } else {
        return {
          ...state,
          listedPrice: action.payload.listPrice,
          sellingPrice: action.payload.sellingPrice,
          discount: delta,
        };
      }
    case "RESET_STATE":
      return action.payload; // Replace with the new state
    default:
      return state;
  }
}
