import React, { useReducer, useEffect } from "react";
import NumberFlow from "@number-flow/react";
import {
  MdAddCircle,
  MdAddCircleOutline,
  MdArrowDownward,
  MdArrowDropDown,
  MdArrowForward,
  MdArrowOutward,
  MdArrowRight,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdClear,
  MdKeyboardArrowDown,
  MdPlusOne,
} from "react-icons/md";

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
    case "ADD_TERM":
      // Generate a unique ID by finding the first number between 1-10 not used
      const existingIds = state.terms.map((term) => term.id);
      let newId = 1;
      while (existingIds.includes(newId) && newId <= 10) {
        newId++;
      }
      if (newId > 10) {
        alert("Cannot add more terms. Maximum limit of 10 reached.");
        return state;
      }

      const newTerm = {
        id: newId, // Unique ID
        duration: 1, // Default duration
        apr: 0, // Default APR
        selected: true, // Default to selected
      };

      return recalculatePayments(
        { ...state, terms: [...state.terms, newTerm] },
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

      // Ensure `term.duration` and `term.apr` are numbers
      const duration = Number(term.duration);
      const apr = Number(term.apr);
      const principal = totalOTD - dp.amount;

      // Handle invalid or missing duration gracefully
      if (isNaN(duration) || duration <= 0) {
        return "Invalid Duration"; // Avoid division by 0 or invalid input
      }

      // Handle 0 APR case
      if (apr === 0) {
        return (principal / duration).toFixed(2); // Simple division for 0 APR
      }

      // Standard payment calculation for non-zero APR
      const monthlyRate = apr / 100 / 12;
      return (
        (principal * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -duration))
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
    <div className="bg-white bg-opacity-5 text-gray-200 p-1 py-2 rounded-lg">
        {/* <div><pre className="text-xs">{JSON.stringify(state,null,1)}</pre></div> */}
      <table className="table-auto border-collapse border border-none w-full text-sm">
        <thead>
          <tr>
            <th className=" text-center ">
              <button className="flex items-center font-normal text-xs justify-center gap-1  w-full  py-1 text-white px-1 rounded hover:bg-gray-600">
                <span>Presets</span>
              </button>
              <button
                onClick={() =>
                  dispatch({
                    type: "ADD_TERM",
                    payload: { totalOTD },
                  })
                }
                className="flex items-center font-normal text-xs justify-center gap-1  w-full  py-1 text-white px-1 rounded hover:bg-gray-600"
              >
                <MdAddCircleOutline /> <span>Term</span> <MdArrowForward />
              </button>
              <button
                onClick={() =>
                  dispatch({
                    type: "ADD_DOWN_PAYMENT",
                    payload: { totalOTD },
                  })
                }
                className="flex items-center font-normal text-xs justify-center gap-1  w-full  py-1 text-white px-1 rounded hover:bg-gray-600"
              >
                <MdAddCircleOutline /> <span>Payment</span> <MdArrowDownward />
              </button>
            </th>
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
                    <td key={index} className=" text-center bg-white bg-opacity-0 hover:bg-opacity-10 cursor-pointer">
                      <NumberFlow
                        format={{
                          style: "currency",
                          currency: "USD",
                          trailingZeroDisplay: "stripIfInteger",
                        }}
                        value={payment}
                      />
                    </td>
                  ) : (
                    <td key={index} className=" text-center">
                      --
                    </td>
                  )
                )}
            </tr>
          ))}
          <tr>
            <td colSpan={1} className=" text-center"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PaymentMatrix;

const ColumnHeader = ({ term, onChange, onDelete }) => {
  return (
    <th className="bg-white bg-opacity-5">
      <div className="flex items-center flex-col gap-1  justify-center">
        <div className="w-full flex hover:bg-opacity-15 bg-opacity-5 items-center  ">
          <button
            className="form-checkbox  mx-2 text-md rounded-l "
            onClick={(e) => onChange(term.id, "selected", !term.selected)}
          >
            {term.selected ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
          </button>
          <span className="flex-grow text-[10px]">Term #{term.id}</span>
          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this term?")
              ) {
                onDelete(term.id);
              }
            }}
            className="hover:text-red-500 text-sm"
          >
            <MdClear />
          </button>
        </div>
        <div className="w-full flex hover:bg-opacity-15 bg-opacity-5 items-center bg-white text-gray-200 ">
          <input
            type="number"
            value={term.duration}
            onChange={(e) => onChange(term.id, "duration", e.target.value)}
            className="w-8 flex-grow bg-transparent  text-center outline-none"
            placeholder="Duration"
          />
          <span className="font-normal text-[10px]">Months</span>
          <button className="px-1  bg-opacity-0 transition-all bg-white h-full">
            <MdKeyboardArrowDown />
          </button>
        </div>

        <div className="flex w-full hover:bg-opacity-15 bg-opacity-5 items-center bg-white text-gray-200 ">
          <input
            type="number"
            value={term.apr}
            onChange={(e) => onChange(term.id, "apr", e.target.value)}
            className="w-12 flex-grow bg-transparent outline-none text-gray-200   text-center"
            placeholder="APR"
          />
          <span className="font-normal text-[10px]">APR</span>
          <button className="px-1  bg-opacity-0 transition-all bg-white h-full">
            <MdKeyboardArrowDown />
          </button>
        </div>
      </div>
    </th>
  );
};

const RowHeader = ({ downPayment, onChange, onDelete }) => {
  return (
    <td className="">
      <div className="flex items-center bg-white bg-opacity-10 p-1">
        <button
          className="form-checkbox   text-md rounded-l "
          onClick={(e) =>
            onChange(downPayment.id, "selected", !downPayment.selected)
          }
        >
          {downPayment.selected ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
        </button>

        <input
          type="number"
          value={downPayment.amount}
          onChange={(e) => onChange(downPayment.id, "amount", e.target.value)}
          className="w-10 bg-transparent text-right text-gray-200 border outline-none border-none"
          placeholder="Down Payment"
        />
        <button
          //   onClick={() => onDelete(downPayment.id)}
          className=" p-1"
        >
          <MdArrowDropDown />
        </button>
      </div>
    </td>
  );
};


//SAMPLE STATE

const sampleState = {
    "terms": [
     {
      "id": 1,
      "duration": 48,
      "apr": 9.9,
      "selected": true
     },
     {
      "id": 2,
      "duration": 60,
      "apr": 9.9,
      "selected": true
     },
     {
      "id": 3,
      "duration": 72,
      "apr": 9.9,
      "selected": true
     }
    ],
    "downPayments": [
     {
      "id": 1,
      "amount": 0,
      "selected": true,
      "payments": [
       "1888.28",
       "1581.20",
       "1378.13"
      ]
     },
     {
      "id": 2,
      "amount": 2000,
      "selected": true,
      "payments": [
       "1837.65",
       "1538.81",
       "1341.18"
      ]
     },
     {
      "id": 3,
      "amount": 4000,
      "selected": true,
      "payments": [
       "1787.02",
       "1496.41",
       "1304.23"
      ]
     },
     {
      "id": 1733680970926,
      "amount": "4",
      "selected": true,
      "payments": [
       "1888.18",
       "1581.12",
       "1378.06"
      ]
     }
    ]
   }