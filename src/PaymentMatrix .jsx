import React, { useReducer, useEffect } from "react";

const initialState = {
  terms: [
    { id: 1, duration: 48, apr: 9.9, selected: true },
    { id: 2, duration: 60, apr: 9.9, selected: true },
    { id: 3, duration: 72, apr: 9.9, selected: true },
  ],
  downPayments: [
    { id: 1, amount: 0, selected: true },
    { id: 2, amount: 2000, selected: true },
    { id: 3, amount: 4000, selected: true },
  ],
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return recalculatePayments(state, action.payload.totalOTD);
    case "UPDATE_TOTAL_OTD":
      return recalculatePayments(state, action.payload.totalOTD);
    case "ADD_DOWN_PAYMENT":
      const newDownPayment = {
        id: Date.now(), // Unique ID
        amount: 0,
        selected: true,
      };
      return recalculatePayments(
        { ...state, downPayments: [...state.downPayments, newDownPayment] },
        action.payload.totalOTD
      );
    case "UPDATE_TERM":
      const updatedTerms = state.terms.map((term) =>
        term.id === action.payload.id
          ? { ...term, [action.payload.key]: action.payload.value }
          : term
      );
      return recalculatePayments(
        { ...state, terms: updatedTerms },
        action.payload.totalOTD
      );

    case "UPDATE_DOWN_PAYMENT":
      const updatedDownPayments = state.downPayments.map((dp) =>
        dp.id === action.payload.id
          ? { ...dp, [action.payload.key]: action.payload.value }
          : dp
      );
      return recalculatePayments(
        { ...state, downPayments: updatedDownPayments },
        action.payload.totalOTD
      );

    case "DELETE_TERM":
      const filteredTerms = state.terms.filter(
        (term) => term.id !== action.payload.id
      );
      return recalculatePayments(
        { ...state, terms: filteredTerms },
        action.payload.totalOTD
      );

    case "DELETE_DOWN_PAYMENT":
      const filteredDownPayments = state.downPayments.filter(
        (dp) => dp.id !== action.payload.id
      );
      return recalculatePayments(
        { ...state, downPayments: filteredDownPayments },
        action.payload.totalOTD
      );

    default:
      return state;
  }
};

const recalculatePayments = (state, totalOTD) => {
  const downPaymentsWithPayments = state.downPayments.map((dp) => ({
    ...dp,
    payments: state.terms.map((term) => {
      if (!term.selected) return null; // Skip unselected terms
      const principal = totalOTD - dp.amount;
      const monthlyRate = term.apr / 100 / 12;
      return (
        (principal * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -term.duration))
      ).toFixed(2);
    }),
  }));

  return { ...state, downPayments: downPaymentsWithPayments };
};

const PaymentMatrix = ({ totalOTD = 50000 }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) =>
    recalculatePayments(initial, totalOTD)
  );

  // Recalculate payments whenever totalOTD changes
  useEffect(() => {
    dispatch({ type: "UPDATE_TOTAL_OTD", payload: { totalOTD } });
  }, [totalOTD]);

  return (
    <div className="bg-gray-900 text-gray-200">
      <table className="table-auto border-collapse border border-gray-700 w-full text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left"></th>
            {state.terms.map((term) => (
              <ColumnHeader
                key={term.id}
                term={term}
                onChange={(id, key, value) =>
                  dispatch({
                    type: "UPDATE_TERM",
                    payload: { id, key, value, totalOTD },
                  })
                }
                onDelete={(id) =>
                  dispatch({ type: "DELETE_TERM", payload: { id, totalOTD } })
                }
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {state.downPayments.map((dp) => (
            <tr key={dp.id}>
              <RowHeader
                downPayment={dp}
                onChange={(id, key, value) =>
                  dispatch({
                    type: "UPDATE_DOWN_PAYMENT",
                    payload: { id, key, value, totalOTD },
                  })
                }
                onDelete={(id) =>
                  dispatch({
                    type: "DELETE_DOWN_PAYMENT",
                    payload: { id, totalOTD },
                  })
                }
              />
              {dp.payments &&
                dp.payments.map((payment, index) =>
                  payment ? (
                    <td key={index} className="p-2 text-center">
                      ${payment}
                    </td>
                  ) : (
                    <td key={index} className="p-2 text-center">
                      --
                    </td>
                  )
                )}
            </tr>
          ))}
          <tr>
            <td colSpan={state.terms.length + 1} className="p-2 text-center">
              <button
                onClick={() =>
                  dispatch({
                    type: "ADD_DOWN_PAYMENT",
                    payload: { totalOTD },
                  })
                }
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                + Add New Down Payment
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PaymentMatrix;

const ColumnHeader = ({ term, onChange, onDelete }) => {
  return (
    <th className="p-2">
      <div className="flex flex-col items-center space-y-2">
        <input
          type="checkbox"
          checked={term.selected}
          onChange={(e) => onChange(term.id, "selected", e.target.checked)}
          className="form-checkbox text-blue-500"
        />
        <input
          type="number"
          value={term.duration}
          onChange={(e) => onChange(term.id, "duration", e.target.value)}
          className="w-24 bg-gray-800 text-gray-200 border border-gray-700 text-center"
          placeholder="Duration"
        />
        <input
          type="number"
          value={term.apr}
          onChange={(e) => onChange(term.id, "apr", e.target.value)}
          className="w-24 bg-gray-800 text-gray-200 border border-gray-700 text-center"
          placeholder="APR"
        />
        <button
          onClick={() => onDelete(term.id)}
          className="text-red-500 text-sm"
        >
          ❌
        </button>
      </div>
    </th>
  );
};

const RowHeader = ({ downPayment, onChange, onDelete }) => {
  return (
    <td className="p-2">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={downPayment.selected}
          onChange={(e) =>
            onChange(downPayment.id, "selected", e.target.checked)
          }
          className="form-checkbox text-blue-500"
        />
        <input
          type="number"
          value={downPayment.amount}
          onChange={(e) => onChange(downPayment.id, "amount", e.target.value)}
          className="w-24 bg-gray-800 text-gray-200 border border-gray-700 ml-2"
          placeholder="Down Payment"
        />
        <button
          onClick={() => onDelete(downPayment.id)}
          className="text-red-500 ml-2"
        >
          ❌
        </button>
      </div>
    </td>
  );
};
