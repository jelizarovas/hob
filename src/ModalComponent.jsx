import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";

const ModalComponent = ({ match }) => {
  // const { stock } = useParams();
  const { stock } = match.params;
  // const history = useHistory();

  // useEffect(() => {
  //   // Add event listener to detect when the modal is closed
  //   const handleCloseModal = () => {
  //     history.push("/"); // Redirect back to the home page when the modal is closed
  //   };
  //   window.addEventListener("modalCloseEvent", handleCloseModal);

  //   // Clean up the event listener when the component is unmounted
  //   return () => {
  //     window.removeEventListener("modalCloseEvent", handleCloseModal);
  //   };
  // }, [history]);
  console.log("modal component rendered");
  return (
    <div className="modal">
      {/* Modal content goes here */}
      <h1>Modal Component</h1>
      <p>Stock: {stock}</p>
    </div>
  );
};

export default ModalComponent;
