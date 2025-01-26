import React from "react";
import NumberFlow from "@number-flow/react";
import {
  MdAddCircleOutline,
  MdArrowDownward,
  MdArrowDropDown,
  MdArrowForward,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdClear,
  MdKeyboardArrowDown,
} from "react-icons/md";

const PaymentMatrix = ({ paymentMatrix, dispatch }) => {
  const { terms, downPayments } = paymentMatrix;
  const {
    handleChange: handleTermChange,
    handleAdd: handleAddTerm,
    handleDelete: handleDeleteTerm,
  } = createPaymentMatrixHandlers("TERM", dispatch);

  const {
    handleChange: handleDownPaymentChange,
    handleAdd: handleAddDownPayment,
    handleDelete: handleDeleteDownPayment,
  } = createPaymentMatrixHandlers("DOWN_PAYMENT", dispatch);

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
                onClick={handleAddTerm}
                className="flex items-center font-normal text-xs justify-center gap-1  w-full  py-1 text-white px-1 rounded hover:bg-gray-600"
              >
                <MdAddCircleOutline /> <span>Term</span> <MdArrowForward />
              </button>
              <button
                onClick={handleAddDownPayment}
                className="flex items-center font-normal text-xs justify-center gap-1  w-full  py-1 text-white px-1 rounded hover:bg-gray-600"
              >
                <MdAddCircleOutline /> <span>Payment</span> <MdArrowDownward />
              </button>
            </th>
            {terms.map((term) => (
              <ColumnHeader
                key={term.id}
                term={term}
                onChange={handleTermChange}
                onDelete={handleDeleteTerm}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {downPayments.map((dp) => (
            <tr key={dp.id}>
              <RowHeader
                downPayment={dp}
                onChange={handleDownPaymentChange}
                onDelete={handleDeleteDownPayment}
              />
              {dp.payments &&
                dp.payments.map((payment, index) =>
                  payment ? (
                    <td
                      key={index}
                      className=" text-center bg-white bg-opacity-0 hover:bg-opacity-10 cursor-pointer"
                    >
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
            onClick={() => onDelete(downPayment.id)}
          className=" p-1"
        >
          <MdClear />
        </button>
      </div>
    </td>
  );
};

function createPaymentMatrixHandlers(prefix, dispatch) {
  const prefixUpper = prefix.toUpperCase();

  return {
    handleChange: (id, key, value) =>
      dispatch({
        type: `UPDATE_${prefixUpper}`,
        payload: { id, key, value },
      }),

    handleAdd: () =>
      dispatch({
        type: `ADD_${prefixUpper}`,
      }),

    handleDelete: (id) =>
      dispatch({
        type: `DELETE_${prefixUpper}`,
        payload: { id },
      }),
  };
}

//SAMPLE STATE

const sampleState = {
  terms: [
    {
      id: 1,
      duration: 48,
      apr: 9.9,
      selected: true,
    },
    {
      id: 2,
      duration: 60,
      apr: 9.9,
      selected: true,
    },
    {
      id: 3,
      duration: 72,
      apr: 9.9,
      selected: true,
    },
  ],
  downPayments: [
    {
      id: 1,
      amount: 0,
      selected: true,
      payments: ["1888.28", "1581.20", "1378.13"],
    },
    {
      id: 2,
      amount: 2000,
      selected: true,
      payments: ["1837.65", "1538.81", "1341.18"],
    },
    {
      id: 3,
      amount: 4000,
      selected: true,
      payments: ["1787.02", "1496.41", "1304.23"],
    },
    {
      id: 1733680970926,
      amount: "4",
      selected: true,
      payments: ["1888.18", "1581.12", "1378.06"],
    },
  ],
};
