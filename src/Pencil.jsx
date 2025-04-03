import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { useParams } from "react-router";
import { AgreementSheet } from "./components/templates/AgreementSheet";
import DownloadAgreementButton from "./DownloadAgreementButton";

export const Pencil = (props) => {
  const { quoteId } = useParams(); // Get quoteId from URL (quotes/:quoteId)
  const location = useLocation();
  const { currentUser, profile } = useAuth();

  // Local state for Firestore data
  const [quoteData, setQuoteData] = useState(null);
  const [loading, setLoading] = useState(!!quoteId); // Only load if quoteId exists

  // Manager Data
  const managerData = {
    fullName: currentUser?.displayName || "Arnas Jelizarovas",
    cell: profile?.cell || "206-591-9143",
  };

  const dealershipData = {
    legalName: "HOFB Inc. dba Honda of Burien",
    addressLine1: "15206 1st Ave S.",
    addressLine2: "Burien, King, WA 98148",
  };

  // Fetch quote from Firestore if quoteId is present
  useEffect(() => {
    if (quoteId) {
      const fetchQuote = async () => {
        try {
          const docRef = doc(db, "quotes", quoteId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setQuoteData(docSnap.data());
          } else {
            console.error("Quote not found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching quote:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchQuote();
    }
  }, [quoteId]);

  // Determine source of data
  const dealData = quoteData || location.state?.dealData || props.dealData;
  const vehicle =
    quoteData?.vehicle || location.state?.vehicle || props.vehicle;

  // If still loading from Firestore, show a loading indicator
  if (loading) return <div>Loading quote data...</div>;

  return (
    <div className="bg-white text-black min-h-screen flex flex-col md:p-0 font-proxima">
      {/* <DownloadAgreementButton
        proposalData={{
          dealership:
            props.dealership || dealData?.dealership || dealershipData,
          manager: managerData,
          dealData: dealData,
          vehicle,
        }}
      /> */}

      <AgreementSheet
        dealership={props.dealership || dealData?.dealership || dealershipData}
        manager={managerData}
        dealData={dealData}
        vehicle={vehicle}
      />
    </div>
  );
};
