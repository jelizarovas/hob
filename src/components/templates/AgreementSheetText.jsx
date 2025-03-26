import React from "react";

export const AgreementSheetText = () => {
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        background: "#fff",
        color: "#000",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <strong>HOFB Inc. dba Honda of Burien</strong>
          <div>15206 1st Ave S.</div>
          <div>Burien, King, WA 98148</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div>
            <strong>Deal #:</strong> 123456
          </div>
          <div>
            <strong>Customer #:</strong> 7890
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <strong>Arnas Jelizarovas</strong>
            <span style={{ marginLeft: "5px" }}>📞</span>
          </div>
        </div>
      </div>

      {/* Vehicle Info */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
        <div>
          <strong>2010 Honda Odyssey EX-L</strong>
        </div>
        <div>VIN: 5FNRL3H70AB037425 | Stock: AB037425</div>
        <div>Mileage: 200,000 mi</div>
        <div>Color: MOCHA METALLIC</div>
      </div>

      {/* Payment Section */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  border: "1px solid #000",
                  padding: "5px",
                }}
              >
                Finance
              </th>
              <th style={{ border: "1px solid #000", padding: "5px" }}>
                48 mo
                <br />
                9.9% APR
              </th>
              <th style={{ border: "1px solid #000", padding: "5px" }}>
                60 mo
                <br />
                9.9% APR
              </th>
              <th style={{ border: "1px solid #000", padding: "5px" }}>
                72 mo
                <br />
                9.9% APR
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "5px" }}>
                <strong>$0.00</strong>
                <div>Customer Cash</div>
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                <strong>$501.29/mo</strong>
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                <strong>$450.45/mo</strong>
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                <strong>$399.61/mo</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: "20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2em" }}>X</div>
          <div>Customer Signature & Date</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2em" }}>X</div>
          <div>Manager Signature & Date</div>
        </div>
      </div>

      {/* Footer / Disclaimer */}
      <div style={{ fontSize: "0.8em", opacity: 0.8 }}>
        <div>
          Understanding of NEGOTIATION: I agree to the above estimated terms and
          understand that all terms are negotiable and subject to execution of
          contract documents and financing approval.
        </div>
        <div>
          *A negotiable dealer documentary service fee of up to $200 may be
          added.
        </div>
        <div style={{ marginTop: "10px" }}>
          © HofB App 2025 | Pacific Time:{" "}
          {new Date().toLocaleString("en-US", {
            timeZone: "America/Los_Angeles",
          })}
        </div>
      </div>
    </div>
  );
};
