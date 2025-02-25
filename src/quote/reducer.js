export function quoteReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.payload };
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
      if (
        // Check if the field exists and is an object
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

    // ---- PaymentMatrix-type actions: ----
    case "ADD_DOWN_PAYMENT": {
      const newDownPayment = {
        id: Date.now(),
        amount: 0,
        selected: true,
      };
      return {
        ...state,
        paymentMatrix: {
          ...state.paymentMatrix,
          downPayments: [...state.paymentMatrix.downPayments, newDownPayment],
        },
      };
    }

    case "ADD_TERM": {
      const existingIds = state.paymentMatrix.terms.map((term) => term.id);
      let newId = 1;
      while (existingIds.includes(newId) && newId <= 10) {
        newId++;
      }
      if (newId > 10) {
        alert("Cannot add more terms. Maximum limit of 10 reached.");
        return state;
      }

      const newTerm = {
        id: newId,
        duration: 1,
        apr: 0,
        selected: true,
      };

      return {
        ...state,
        paymentMatrix: {
          ...state.paymentMatrix,
          terms: [...state.paymentMatrix.terms, newTerm],
        },
      };
    }

    case "DELETE_TERM": {
      const filteredTerms = state.paymentMatrix.terms.filter(
        (term) => term.id !== action.payload.id
      );
      return {
        ...state,
        paymentMatrix: {
          ...state.paymentMatrix,
          terms: filteredTerms,
        },
      };
    }

    case "DELETE_DOWN_PAYMENT": {
      const filteredDownPayments = state.paymentMatrix.downPayments.filter(
        (dp) => dp.id !== action.payload.id
      );
      return {
        ...state,
        paymentMatrix: {
          ...state.paymentMatrix,
          downPayments: filteredDownPayments,
        },
      };
    }

    case "UPDATE_TERM": {
      const { id, key, value } = action.payload;
      const updatedTerms = state.paymentMatrix.terms.map((term) =>
        term.id === id ? { ...term, [key]: value } : term
      );
      return {
        ...state,
        paymentMatrix: { ...state.paymentMatrix, terms: updatedTerms },
      };
    }
    case "UPDATE_DOWN_PAYMENT": {
      const { id, key, value } = action.payload;
      const updatedDP = state.paymentMatrix.downPayments.map((dp) =>
        dp.id === id ? { ...dp, [key]: value } : dp
      );
      return {
        ...state,
        paymentMatrix: { ...state.paymentMatrix, downPayments: updatedDP },
      };
    }

    case "RESET_STATE":
      return action.payload; // Replace with the new state
    default:
      return state;
  }
}
