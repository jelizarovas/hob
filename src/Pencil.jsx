import React, { useState, useEffect } from "react";
import { MdCall } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { useParams } from "react-router";

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
    <div className="bg-white text-black min-h-screen flex flex-col md:p-10 font-sans">
      {/* Render AgreementSheet and pass the resolved props */}
      <AgreementSheet
        dealership={props.dealership || dealData?.dealership}
        manager={managerData}
        dealData={dealData}
        vehicle={vehicle}
      />
    </div>
  );
};

export const AgreementSheet = ({
  dealership,
  manager,
  dealData,
  vehicle,
  ...props
}) => {
  return (
    <div className="bg-white text-black min-h-screen  flex flex-col md:p-10 font-sans">
      {/* <pre className="text-xs">{JSON.stringify(dealData, null, 2)}</pre> */}
      <div className="flex  justify-evenly  py-2 w-full">
        <div className="flex flex-col w-full md:w-1/2  p-2 leading-none">
          <strong className="text-sm leading-none">
            {dealership?.legalName}
          </strong>
          <span className="text-xs leading-none">
            {dealership?.addressLine1}
          </span>
          <span className="text-xs leading-none">
            {dealership?.addressLine2}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 justify-evenly  w-full md:gap-10  md:w-1/2 ">
          <div className="flex flex-col">
            <strong className="whitespace-nowrap leading-none">Deal #</strong>{" "}
            <span className="leading-none">
              {dealData?.dealData?.dealNumber}
            </span>
          </div>
          <div className="flex flex-col md:flex-grow">
            <strong className="whitespace-nowrap leading-none">
              Customer #
            </strong>
            <span className="leading-none">
              {dealData?.dealData?.customerNumber}
            </span>
          </div>
          <div className="flex flex-col">
            <strong className="leading-none">
              {dealData?.dealData?.selectedUser?.displayName}
            </strong>
            <span className="leading-none">Contact Sales:</span>
          </div>
          <div className="relative">
            <button
              type="button"
              className="bg-slate-300 rounded-full p-1 md:p-2 relative text-xs md:text-base hover:bg-slate-400"
            >
              {dealData?.dealData?.selectedUser?.displayName
                .split(" ")
                .map((word, index) => word[0])}
              <span className="bg-yellow-500 absolute -left-2 -bottom-2 rounded-full p-1 border-white border text-[8px] md:text-xs">
                <MdCall />
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="bg-gray-200 p-4 flex flex-col md:flex-row print:flex-row">
        <div className="md:w-1/2 print:w-3/5 px-2 flex flex-col justify-center ">
          <span className="font-arial font-bold whitespace-nowrap">
            {dealData?.dealData?.customerFullName}
          </span>
          <div className="flex flex-wrap">
            <span>{dealData?.dealData?.customerPhone} </span>
            <span className="px-2">|</span>
            <span>{dealData?.dealData?.customerEmail}</span>

            <span className="">{dealData?.dealData?.customerAddress}</span>
          </div>
        </div>
        <div className="md:w-1/2 flex flex-col print:w-2/5 print:text-[10px] ">
          <strong className="font-arial leading-none md:leading-normal text-lg print:text-sm ">
            {`${vehicle?.year || ""} ${vehicle?.make || ""} ${
              vehicle?.model || ""
            }`}
          </strong>
          <span className="text-xs md:text-sm leading-none md:leading-normal ">
            {vehicle?.trim}
          </span>
          <span className="text-xs md:texr-base leading-none md:leading-normal">
            VIN : {vehicle?.vin} | Stock # : {vehicle?.stock}
          </span>
          <span className="text-xs md:text-sm leading-none md:leading-normal">
            Mileage : {vehicle?.miles && " mi"}
          </span>
          <span className="text-xs md:text-sm leading-none md:leading-normal">
            Color : {vehicle?.ext_color?.toUpperCase()}
          </span>
          <span className="text-xs md:text-sm leading-none md:leading-normal">
            {vehicle?.make + " |"} {vehicle?.doors}
            {vehicle?.trim + " |"} {vehicle?.drivetrain + " |"}{" "}
            {vehicle?.engine_description + " |"} {vehicle?.cylinders + " |"}
            {vehicle?.fueltype + " |"} {vehicle?.body + " |"} {vehicle?.doors}
          </span>
        </div>
      </div>

      <div className="flex-grow flex flex-col-reverse gap-2 md:gap-1 md:flex-row items-start py-4 print:flex-row">
        <PaymentMatrix paymentOptions={dealData?.paymentOptions} />
        <div className=" w-full md:w-2/5 bg-gray-200 p-1 md:p-2 print:w-2/5">
          <strong className="py-2">Payment Detail</strong>
          <ul className="text-sm">
            {dealData?.items &&
              dealData?.items.map((item, i) => (
                <PaymentDetailLine
                  key={i}
                  label={item?.label}
                  amount={item?.amount}
                  isBold={item?.isBold}
                />
              ))}
          </ul>
        </div>
      </div>
      <div className="w-full flex items-center justify-evenly px-2">
        <div className="flex flex-col w-full px-4">
          <span className="text-2xl pt-10">X</span>
          <span className="text-xs border-t-2 p-1 whitespace-nowrap">
            Customer Signature & Date
          </span>
        </div>
        <div className="flex flex-col w-full px-4">
          <span className="text-2xl pt-10">X</span>
          <span className="text-xs border-t-2  p-1 whitespace-nowrap">
            Manager Signature & Date
          </span>
        </div>
      </div>
      <div className="text-xs md:text-sm opacity-80 flex flex-col mt-2 px-1">
        <span className="md:leading-normal leading-none text-justify">
          Understanding of NEGOTIATION: I agree to the above estimated terms and
          understand that all were and are negotiable, including interest rate
          of which dealer may receive/retain a portion, price, down payment,
          trade allowance, term, accessories, and value adds and that all are
          subject to execution of contract documents and fi nancing approval. I
          understand actual credit terms may vary depending on my credit history
          and that I may be able to obtain fi nancing on diff erent terms from
          others.
        </span>
        <span className="md:leading-normal leading-none text-justify">
          *A negotiable dealer documentary service fee of up to $200 may be
          added to the sale price or capitalized cost.
        </span>
      </div>
      <DynamicDateTimeDiv />
    </div>
  );
};

const DynamicDateTimeDiv = () => {
  // Get the current date and time
  const currentDate = new Date();

  // Format the current date and time in Pacific Time
  const pacificTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(currentDate);

  // Extract the current year
  const currentYear = currentDate.getFullYear();

  return (
    <div className="flex text-xs md:text-sm p-2 border-t border-gray-600 mt-2">
      <span className="flex-grow">© HofB App {currentYear}</span>
      <span className="opacity-70">{pacificTime}</span>
    </div>
  );
};

export default DynamicDateTimeDiv;

function PaymentMatrix({ paymentOptions = { terms: [], downPayments: [] } }) {
  const { terms = [], downPayments = [] } = paymentOptions;

  // 1) Filter only selected terms
  const selectedTerms =
    terms.length > 0 ? terms.filter((term) => term.selected) : [];

  // 2) Build the table headers from selected terms
  const termHeaders =
    selectedTerms.length > 0
      ? selectedTerms.map((term) => ({
          payments: term.duration,
          apr: term.apr,
        }))
      : [];

  // 3) Filter only selected downPayments
  const selectedDownPayments = downPayments.filter((dp) => dp.selected);

  // 4) Convert selectedDownPayments to display strings
  const downPaymentOptions = selectedDownPayments.map((dp) => {
    const numericAmount = parseFloat(dp.amount) || 0;
    return `$${numericAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  });

  // 5) Build a 2D array of payments (skipping unselected terms)
  //    dp.payments indexes match up with the full terms array,
  //    so we filter them by the same index check.
  const calculatedPayments = selectedDownPayments.map((dp) => {
    return dp.payments
      .filter((_, index) => terms[index]?.selected)
      .map((val) =>
        val
          ? `$${parseFloat(val).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "N/A"
      );
  });

  return (
    <div className="w-full  md:w-3/5 print:w-3/5">
      <table className="text-center ">
        {/* Table Header */}
        <thead>
          <tr>
            <th className="text-left">Finance</th>
            {termHeaders.map((header, index) => (
              <PaymentMatrixHeader
                key={index}
                text={`${header.payments} mo`}
                subtext={`${header.apr}% APR`}
              />
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {downPaymentOptions.map((downPayment, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-opacity-10 bg-black bg-opacity-0"
            >
              <PaymentMatrixDownpaymentOption
                text={downPayment}
                subtext="Customer Cash"
              />
              {calculatedPayments[rowIndex].map((payment, colIndex) => (
                <PaymentMatrixSelectOption key={colIndex} text={payment} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PaymentDetailLine = ({ label, amount, isBold, ...props }) => {
  // Ensure amount is a properly formatted number with thousands separators
  const formattedAmount =
    amount && !isNaN(amount)
      ? `$${parseFloat(amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : amount; // Keep "N/A" or other non-numeric values as is

  return (
    <li
      className={`p-2 md:p-2 print:py-1 flex border-b-2 border-gray-300 hover:bg-black hover:bg-opacity-5 ${
        isBold ? "bg-black bg-opacity-10" : "bg-opacity-0"
      } cursor-pointer print:text-xs`}
    >
      <span className="flex-grow">{label}</span>
      <span className={`${isBold ? "font-bold" : ""}`}>{formattedAmount}</span>
    </li>
  );
};

const PaymentMatrixHeader = ({ text, subtext, ...props }) => {
  return (
    <td className="bg-gray-200 px-4 py-2 print:px-2 print:py-3 print:text-xs">
      <div className="flex flex-col items-center">
        <span className="font-bold">{text}</span>
        <span className="text-xs print:text-[10px] leading-none">
          {subtext}
        </span>{" "}
      </div>
    </td>
  );
};

const PaymentMatrixDownpaymentOption = ({ text, subtext, ...props }) => {
  return (
    <td className="border py-1 pr-4 print:pr-2 print:py-1">
      <div className="flex flex-col justify-center text-left p-1 leading-none text-sm print:text-xs">
        <strong>{text}</strong>
        <span>{subtext}</span>
      </div>
    </td>
  );
};

const PaymentMatrixSelectOption = ({ text, subtext, ...props }) => {
  return (
    <td className="border px-4 bg-black bg-opacity-0 hover:bg-opacity-10 cursor-pointer px-2">
      <strong className=" flex items-center justify-center h-16 text-sm print:text-xs">
        {text.toLocaleString()}/mo
      </strong>
    </td>
  );
};

const dealershipData = {
  legalName: "HOFB Inc. dba Honda of Burien",
  addressLine1: "15206 1st Ave S.",
  addressLine2: "Burien, King, WA 98148",
};

const defaultdealData = {
  id: "59122",
  items: [
    { label: "Retail Price", amount: "$51,500.00" },
    { label: "Your Price", amount: "$51,500.00" },
    { label: "All Weather Mats", amount: "$330.00" },
    { label: "Estimated License Fees", amount: "$899.00" },
    { label: "Documentary Service Fee*", amount: "$200.00" },

    { label: "Sales Subtotal", amount: "$52,128.00" },
    { label: "Amount Financed", amount: "$52,128.00", isBold: true },
  ],
  paymentOptions: {
    downPaymentOptions: ["$0.00", "$500.00", "$1000.00"],
    termHeaders: [
      { payments: 48, type: "monthly", apr: 4.9 },
      { payments: 60, type: "monthly", apr: 5.9 },
      { payments: 72, type: "monthly", apr: 5.9 },
    ],
    calculatedPayments: [
      ["$1,094.33", "$960.48", "$882.00"], // Payments for $0 down payment
      ["$1,075.33", "$940.48", "$860.00"], // Payments for $500 down payment
      ["$1,050.33", "$920.48", "$840.00"], // Payments for $1000 down payment
    ],
  },
};

const vehicleData = {
  link: "https://www.burienhonda.com/inventory/new-2025-honda-pilot-elite-awd-cvt-sport-utility-5fnyg1h84sb069177/",
  thumbnail:
    "https://vehicle-images.dealerinspire.com/stock-images/thumbnails/large/chrome/31993aa2af9d4c6bb5705426472de737.png",
  title_vrp:
    "Honda Pilot Elite 10-Speed Automatic w/OD Sport Utility AWD CVT Regular Unleaded V-6 3.5 L/212",
  msrp: "55920",
  our_price: 55920,
  discounts: 0,
  our_price_label: "MSRP*",
  api_id: "20619",
  body: "SUVs",
  certified: "0",
  city_mpg: "19",
  cylinders: "6",
  date_in_stock: "11/15/2024",
  date_modified: "2024-11-20 00:45:11",
  doors: "4",
  drivetrain: "AWD CVT",
  engine_description: "Regular Unleaded V-6 3.5 L/212",
  ext_color: "Platinum White Pearl",
  ext_color_generic: "White",
  fueltype: "Gasoline Fuel",
  hw_mpg: "25",
  int_color: "Black",
  location: "15026 1st Ave S<br/>Burien, WA 98148",
  make: "Honda",
  metal_flags: [],
  miles: 5,
  model: "Pilot",
  model_number: "454267",
  special_field_1: "",
  stock: "SB069177",
  transmission_description: "10-Speed Automatic w/OD",
  trim: "Elite",
  type: "New",
  vin: "5FNYG1H84SB069177",
  year: "2025",
  days_in_stock: 18,
  ext_options: [
    "Auto On/Off Projector Beam Led Low/High Beam Daytime Running Auto High-Beam Headlamps w/Delay-Off",
    "Black Side Windows Trim and Black Front Windshield Trim",
    "Body-Colored Door Handles",
    "Body-Colored Front Bumper w/Black Rub Strip/Fascia Accent and Metal-Look Bumper Insert",
    "Body-Colored Power w/Tilt Down Heated Auto Dimming Side Mirrors w/Power Folding and Turn Signal Indicator",
    "Body-Colored Rear Bumper w/Black Rub Strip/Fascia Accent and Metal-Look Bumper Insert",
    "Chrome Bodyside Cladding and Black Wheel Well Trim",
    "Clearcoat Paint",
    "Compact Spare Tire Stored Underbody w/Crankdown",
    "Deep Tinted Glass",
    "Door Auto-Latch",
    "Express Open/Close Sliding And Tilting Glass 1st And 2nd Row Moonroof w/Power Sunshade",
    "Fixed Rear Window w/Fixed Interval Wiper and Defroster",
    "Front Fog Lamps",
    "Galvanized Steel/Aluminum Panels",
    "Grille w/Chrome Bar",
    "Headlights-Automatic Highbeams",
    "Laminated Glass",
    "LED Brakelights",
    "Lip Spoiler",
    "Perimeter/Approach Lights",
    "Power Liftgate Rear Cargo Access",
    "Speed Sensitive Rain Detecting Variable Intermittent Wipers w/Heated Jets",
    "Steel Spare Wheel",
    "Tailgate/Rear Door Lock Included w/Power Door Locks",
    "Tires: 255/50R20 AS",
    "Wheels: 20 Shark Gray Machine Face w/Blk Lug Nuts",
  ],
  features: [
    "3rd Row Seat",
    "AWD",
    "Adaptive Cruise Control",
    "Android Auto",
    "Apple CarPlay",
    "Backup Camera",
    "Blind Spot Monitor",
    "Bluetooth",
    "Fog Lights",
    "Hands-Free Liftgate",
    "Interior Accents",
    "Keyless Entry",
    "Lane Departure Warning",
    "Leather Seats",
    "Moonroof",
    "Navigation System",
    "Parking Sensors / Assist",
    "Power Seats",
    "Push Start",
    "Rain Sensing Wipers",
    "Rear A/C",
    "Satellite Radio Ready",
    "Side-Impact Air Bags",
    "WiFi Hotspot",
  ],
  finance_details: null,
  int_options: [
    "2 12V DC Power Outlets",
    "2 12V DC Power Outlets and 1 120V AC Power Outlet",
    "2 LCD Monitors In The Front",
    "3 Seatback Storage Pockets",
    "40-20-40 Folding Split-Bench Front Facing Heated Manual Reclining Fold Forward Seatback Rear Seat w/Manual Fore/Aft",
    "8-Way Driver Seat",
    "Adaptive w/Traffic Stop-Go",
    "Air Filtration",
    "Cargo Area Concealed Storage",
    "Cargo Space Lights",
    "Carpet Floor Trim",
    "Compass",
    "Cruise Control w/Steering Wheel Controls",
    "Day-Night Auto-Dimming Rearview Mirror",
    "Delayed Accessory Power",
    "Digital/Analog Appearance",
    "Driver And Passenger Visor Vanity Mirrors w/Driver And Passenger Illumination, Driver And Passenger Auxiliary Mirror",
    "Driver Foot Rest",
    "Driver Information Center",
    "Fade-To-Off Interior Lighting",
    "Fixed 60-40 Split-Bench 3rd Row Seat Front, Manual Recline, Manual Fold Into Floor, 3 Manual and Adjustable Head Restraints",
    "Fixed Diversity Antenna",
    "FOB Controls -inc: Cargo Access, Windows and Moonroof/Convertible Roof",
    "Front And Rear Map Lights",
    "Front Center Armrest and Rear Center Armrest",
    "Full Carpet Floor Covering -inc: Carpet Front And Rear Floor Mats",
    "Full Cloth Headliner",
    "Full Floor Console w/Covered Storage, Mini Overhead Console w/Storage, Conversation Mirror, 2 12V DC Power Outlets and 1 120V AC Power Outlet",
    "Gauges -inc: Speedometer, Odometer, Engine Coolant Temp, Tachometer, Trip Odometer and Trip Computer",
    "Head-Up Display",
    "Heated & Ventilated Front Bucket Seats -inc: driver's seat w/10-way power adjustment, 2-way power lumbar support, 2-position memory, passenger's seat w/4-way power adjustment and head restraints at all seating positions",
    "Heated Leather/Piano Black Steering Wheel",
    "HomeLink Garage Door Transmitter",
    "Honda Satellite-Linked Navigation System -inc: voice recognition and Honda Real-Time Traffic the Honda Satellite-Linked Navigation System functions in the United States (not including territories, except Puerto Rico) and Canada, Honda HD Digital Traffic service is only available in the United States, except Alaska, Please see your Honda dealer for details",
    "HondaLink Subscription Services -inc: complimentary security trials for 1 year and a remote/concierge trial for 3 months, Enrollment is required to access the remote/concierge trial and to access certain features of security, At the end of each trial period, purchase of a subscription is required to continue the respective services",
    "HVAC -inc: Underseat Ducts, Headliner/Pillar Ducts and Console Ducts",
    "Illuminated Front Cupholder",
    "Illuminated Locking Glove Box",
    "Immobilizer",
    "Instrument Panel Bin, Interior Concealed Storage, Driver / Passenger And Rear Door Bins",
    "Interior Trim -inc: Piano Black Instrument Panel Insert, Piano Black Door Panel Insert, Piano Black Console Insert and Piano Black/Metal-Look Interior Accents",
    "Leather Door Trim Insert",
    "Manual Adjustable Rear Head Restraints",
    "Manual Tilt/Telescoping Steering Column",
    "Memory Settings -inc: Door Mirrors",
    "Outside Temp Gauge",
    "Passenger Seat",
    "Perforated Leather Seat Trim -inc: accent piping",
    "Perimeter Alarm",
    "Power 1st Row Windows w/Front And Rear 1-Touch Up/Down",
    "Power Door Locks w/Autolock Feature",
    "Power Rear Windows, Fixed 3rd Row Windows and w/Manual 2nd Row Sun Blinds",
    "Proximity Key For Doors And Push Button Start",
    "Radio w/Seek-Scan, Clock and Steering Wheel Controls",
    "Radio: Bose Premium Sound System -inc: 12 speakers w/subwoofer, 9 color touchscreen, Bluetooth HandsFreeLink and streaming audio, Radio Data System (RDS), Speed-Sensitive Volume Compensation (SVC), wireless Apple CarPlay and Android Auto compatibility, Wi-Fi hotspot capability (requires AT&T data plan), SMS text message function (Your wireless carrier's rate plans apply, State or local laws may limit use of texting feature.), HD Radio, 2.5-amp USB type-A smartphone/audio interface port in front console, multi-zone audio and CabinTalk in-car PA system",
    "Rear Cupholder",
    "Rear HVAC w/Separate Controls",
    "Redundant Digital Speedometer",
    "Remote Keyless Entry w/Integrated Key Transmitter, 2 Door Curb/Courtesy, Illuminated Entry and Panic Button",
    "Remote Releases -Inc: Proximity Cargo Access and Mechanical Fuel",
    "SiriusXM -inc: SiriusXM requires a subscription after any trial period, If you decide to continue your SiriusXM service at the end of your trial subscription, the plan you choose will automatically renew and bill at then-current rates until you call SiriusXM at 1-866-635-2349 to cancel, See our customer agreement for complete terms at www.siriusxm.com, Fees and programming subject to change, Available in the 48 contiguous United States and D.C, SiriusXM and all related marks and logos are trademarks of SiriusXM radio Inc",
    "Trip Computer",
    "Trunk/Hatch Auto-Latch",
    "Valet Function",
    "Voice Activated Dual Zone Front Automatic Air Conditioning",
  ],
  lease_details: null,
  lightning: {
    vrp_multilingual_titles: {
      topTitle: "",
      bottomTitle: "",
    },
    vrp_top_title: "New 2025",
    vrp_bottom_title:
      "Honda Pilot Elite 10-Speed Automatic w/OD Sport Utility AWD CVT Regular Unleaded V-6 3.5 L/212",
    vrp_image_alt: "2025 Honda Pilot Elite",
    advancedPricingStack:
      '<div class="advanced-pricing-stack new-no-discounts-edited-stack vertical-stack"><div class="price-block our-price real-price">\n\t<a href="https://www.burienhonda.com/inventory/new-2025-honda-pilot-elite-awd-cvt-sport-utility-5fnyg1h84sb069177/">\n\t  <span class="price-label">MSRP*</span>\n\t  <span class="price">$55,920</span>\n\t</a>\n</div><p class="sellingPrice" style="text-align:left; color:#ff7b00;">\n    Selling Price\n    <span style="float:right; color:#ff7b00; font-size:16px;">\n        Call For Price\n    </span></p><div class="incentives incentives-breakdown conditional-incentives-breakdown subtract">\n\t<div class="price-block">\n\t<a href="https://www.burienhonda.com/inventory/new-2025-honda-pilot-elite-awd-cvt-sport-utility-5fnyg1h84sb069177/">\n\t\t<span class="price-label">Honda Graduate Offer</span>\n\t\t<span class="price">$500</span>\n\t</a>\n</div><div class="price-block">\n\t<a href="https://www.burienhonda.com/inventory/new-2025-honda-pilot-elite-awd-cvt-sport-utility-5fnyg1h84sb069177/">\n\t\t<span class="price-label">Honda Military Appreciation Offer</span>\n\t\t<span class="price">$500</span>\n\t</a>\n</div>\n</div></div> <!-- END OF PriceStack: New - NO Discounts edited --><p><strong>Disclaimer:</strong></p>\n<p>* All vehicles are one of each and are subject to prior sale. All Pre-Owned or certified vehicles are used. A negotiable documentary service fee of up to $200 may be added to the sale price or capitalized cost. All financing is subject to credit approval. Prices exclude tax, title, and license. Please consider verifying any information in question with a dealership sales representative. *MSRP is not the advertised selling price of the vehicle. MSRP means &ldquo;Manufacturers Suggested Retail Price&rdquo; and is for informational purposes only. Contact dealer for the selling price. All offers and sales contingent on the vehicle being titled in Washington state. No sale is final or binding until buyer and dealer execute a written purchase agreement. Vehicle specifications, equipment, features, and options are for informational purposes only and may change or vary. Customer must verify actual vehicle specifications, equipment, features, and options prior to sale. Dealership imposes a 3% surcharge on all non-vehicle sales credit card transactions. We do not surcharge cash or debit card transactions. Dealership reserves the right to restrict or limit the use of credit cards in vehicle sales transactions. All sale prices expire at 11:59pm on 03/12/2024.</p>\n<p><em><strong>MPG Disclaimer:</strong> Based on EPA mileage ratings. Use for comparison purposes only. Your mileage will vary depending on driving conditions, how you drive and maintain your vehicle, battery-pack age/condition, and other factors.</em></p>\n\n\n',
    lazyLoadDisclaimers: false,
    hasIncentivesDisclaimers: false,
    inventoryType: "New",
    locations: [],
    isSpecial: false,
    pricing: {
      high: {
        label: "MSRP*",
        value: "55920",
      },
      low: false,
      savings: {
        value: 55920,
      },
    },
    logos: [],
    status: "",
    statusLabel: "",
    statusDisclaimer: "",
    statusETA: "",
    class: [],
    sortIndexes: {
      specials_oem_price: {
        oem: 2,
        our_price: 55920,
      },
      low_to_high: {
        our_price: 55920,
      },
      specials_price: {
        is_special: 0,
        our_price: 55920,
      },
      high_to_low: {
        our_price: 55920,
      },
      defaultSort: {
        is_special: 0,
        our_price: 55920,
      },
    },
    imageCount: 13,
  },
  ford_SpecialVehicle: "",
  algolia_sort_order: 0,
  hash: "4d7746c8a8a2865febb48b0c90f12a7a",
  objectID: "5FNYG1H84SB069177",
  _highlightResult: {
    link: {
      value:
        "https://www.burienhonda.com/inventory/new-2025-honda-<em>pilot</em>-<em>elite</em>-awd-cvt-sport-utility-5fnyg1h84sb069177/",
      matchLevel: "full",
      fullyHighlighted: false,
      matchedWords: ["pilot", "elite"],
    },
    thumbnail: {
      value:
        "https://vehicle-images.dealerinspire.com/stock-images/thumbnails/large/chrome/31993aa2af9d4c6bb5705426472de737.png",
      matchLevel: "none",
      matchedWords: [],
    },
    title_vrp: {
      value:
        "Honda <em>Pilot</em> <em>Elite</em> 10-Speed Automatic w/OD Sport Utility AWD CVT Regular Unleaded V-6 3.5 L/212",
      matchLevel: "full",
      fullyHighlighted: false,
      matchedWords: ["pilot", "elite"],
    },
    msrp: {
      value: "55920",
      matchLevel: "none",
      matchedWords: [],
    },
    our_price: {
      value: "55920",
      matchLevel: "none",
      matchedWords: [],
    },
    discounts: {
      value: "0",
      matchLevel: "none",
      matchedWords: [],
    },
    our_price_label: {
      value: "MSRP*",
      matchLevel: "none",
      matchedWords: [],
    },
    api_id: {
      value: "20619",
      matchLevel: "none",
      matchedWords: [],
    },
    body: {
      value: "SUVs",
      matchLevel: "none",
      matchedWords: [],
    },
    certified: {
      value: "0",
      matchLevel: "none",
      matchedWords: [],
    },
    city_mpg: {
      value: "19",
      matchLevel: "none",
      matchedWords: [],
    },
    cylinders: {
      value: "6",
      matchLevel: "none",
      matchedWords: [],
    },
    doors: {
      value: "4",
      matchLevel: "none",
      matchedWords: [],
    },
    drivetrain: {
      value: "AWD CVT",
      matchLevel: "none",
      matchedWords: [],
    },
    engine_description: {
      value: "Regular Unleaded V-6 3.5 L/212",
      matchLevel: "none",
      matchedWords: [],
    },
    ext_color: {
      value: "Platinum White Pearl",
      matchLevel: "none",
      matchedWords: [],
    },
    ext_color_generic: {
      value: "White",
      matchLevel: "none",
      matchedWords: [],
    },
    fueltype: {
      value: "Gasoline Fuel",
      matchLevel: "none",
      matchedWords: [],
    },
    hw_mpg: {
      value: "25",
      matchLevel: "none",
      matchedWords: [],
    },
    int_color: {
      value: "Black",
      matchLevel: "none",
      matchedWords: [],
    },
    location: {
      value: "15026 1st Ave S<br/>Burien, WA 98148",
      matchLevel: "none",
      matchedWords: [],
    },
    make: {
      value: "Honda",
      matchLevel: "none",
      matchedWords: [],
    },
    miles: {
      value: "5",
      matchLevel: "none",
      matchedWords: [],
    },
    model: {
      value: "<em>Pilot</em>",
      matchLevel: "partial",
      fullyHighlighted: true,
      matchedWords: ["pilot"],
    },
    model_number: {
      value: "454267",
      matchLevel: "none",
      matchedWords: [],
    },
    special_field_1: {
      value: "",
      matchLevel: "none",
      matchedWords: [],
    },
    stock: {
      value: "SB069177",
      matchLevel: "none",
      matchedWords: [],
    },
    transmission_description: {
      value: "10-Speed Automatic w/OD",
      matchLevel: "none",
      matchedWords: [],
    },
    trim: {
      value: "<em>Elite</em>",
      matchLevel: "partial",
      fullyHighlighted: true,
      matchedWords: ["elite"],
    },
    type: {
      value: "New",
      matchLevel: "none",
      matchedWords: [],
    },
    vin: {
      value: "5FNYG1H84SB069177",
      matchLevel: "none",
      matchedWords: [],
    },
    year: {
      value: "2025",
      matchLevel: "none",
      matchedWords: [],
    },
    ext_options: [
      {
        value:
          "Auto On/Off Projector Beam Led Low/High Beam Daytime Running Auto High-Beam Headlamps w/Delay-Off",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Black Side Windows Trim and Black Front Windshield Trim",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Body-Colored Door Handles",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Body-Colored Front Bumper w/Black Rub Strip/Fascia Accent and Metal-Look Bumper Insert",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Body-Colored Power w/Tilt Down Heated Auto Dimming Side Mirrors w/Power Folding and Turn Signal Indicator",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Body-Colored Rear Bumper w/Black Rub Strip/Fascia Accent and Metal-Look Bumper Insert",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Chrome Bodyside Cladding and Black Wheel Well Trim",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Clearcoat Paint",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Compact Spare Tire Stored Underbody w/Crankdown",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Deep Tinted Glass",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Door Auto-Latch",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Express Open/Close Sliding And Tilting Glass 1st And 2nd Row Moonroof w/Power Sunshade",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Fixed Rear Window w/Fixed Interval Wiper and Defroster",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Front Fog Lamps",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Galvanized Steel/Aluminum Panels",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Grille w/Chrome Bar",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Headlights-Automatic Highbeams",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Laminated Glass",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "LED Brakelights",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Lip Spoiler",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Perimeter/Approach Lights",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Power Liftgate Rear Cargo Access",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Speed Sensitive Rain Detecting Variable Intermittent Wipers w/Heated Jets",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Steel Spare Wheel",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Tailgate/Rear Door Lock Included w/Power Door Locks",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Tires: 255/50R20 AS",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Wheels: 20 Shark Gray Machine Face w/Blk Lug Nuts",
        matchLevel: "none",
        matchedWords: [],
      },
    ],
    features: [
      {
        value: "3rd Row Seat",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "AWD",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Adaptive Cruise Control",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Android Auto",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Apple CarPlay",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Backup Camera",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Blind Spot Monitor",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Bluetooth",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Fog Lights",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Hands-Free Liftgate",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Interior Accents",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Keyless Entry",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Lane Departure Warning",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Leather Seats",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Moonroof",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Navigation System",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Parking Sensors / Assist",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Power Seats",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Push Start",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Rain Sensing Wipers",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Rear A/C",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Satellite Radio Ready",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Side-Impact Air Bags",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "WiFi Hotspot",
        matchLevel: "none",
        matchedWords: [],
      },
    ],
    int_options: [
      {
        value: "2 12V DC Power Outlets",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "2 12V DC Power Outlets and 1 120V AC Power Outlet",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "2 LCD Monitors In The Front",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "3 Seatback Storage Pockets",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "40-20-40 Folding Split-Bench Front Facing Heated Manual Reclining Fold Forward Seatback Rear Seat w/Manual Fore/Aft",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "8-Way Driver Seat",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Adaptive w/Traffic Stop-Go",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Air Filtration",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Cargo Area Concealed Storage",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Cargo Space Lights",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Carpet Floor Trim",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Compass",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Cruise Control w/Steering Wheel Controls",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Day-Night Auto-Dimming Rearview Mirror",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Delayed Accessory Power",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Digital/Analog Appearance",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Driver And Passenger Visor Vanity Mirrors w/Driver And Passenger Illumination, Driver And Passenger Auxiliary Mirror",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Driver Foot Rest",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Driver Information Center",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Fade-To-Off Interior Lighting",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Fixed 60-40 Split-Bench 3rd Row Seat Front, Manual Recline, Manual Fold Into Floor, 3 Manual and Adjustable Head Restraints",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Fixed Diversity Antenna",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "FOB Controls -inc: Cargo Access, Windows and Moonroof/Convertible Roof",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Front And Rear Map Lights",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Front Center Armrest and Rear Center Armrest",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Full Carpet Floor Covering -inc: Carpet Front And Rear Floor Mats",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Full Cloth Headliner",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Full Floor Console w/Covered Storage, Mini Overhead Console w/Storage, Conversation Mirror, 2 12V DC Power Outlets and 1 120V AC Power Outlet",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Gauges -inc: Speedometer, Odometer, Engine Coolant Temp, Tachometer, Trip Odometer and Trip Computer",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Head-Up Display",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Heated & Ventilated Front Bucket Seats -inc: driver's seat w/10-way power adjustment, 2-way power lumbar support, 2-position memory, passenger's seat w/4-way power adjustment and head restraints at all seating positions",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Heated Leather/Piano Black Steering Wheel",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "HomeLink Garage Door Transmitter",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Honda Satellite-Linked Navigation System -inc: voice recognition and Honda Real-Time Traffic the Honda Satellite-Linked Navigation System functions in the United States (not including territories, except Puerto Rico) and Canada, Honda HD Digital Traffic service is only available in the United States, except Alaska, Please see your Honda dealer for details",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "HondaLink Subscription Services -inc: complimentary security trials for 1 year and a remote/concierge trial for 3 months, Enrollment is required to access the remote/concierge trial and to access certain features of security, At the end of each trial period, purchase of a subscription is required to continue the respective services",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "HVAC -inc: Underseat Ducts, Headliner/Pillar Ducts and Console Ducts",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Illuminated Front Cupholder",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Illuminated Locking Glove Box",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Immobilizer",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Instrument Panel Bin, Interior Concealed Storage, Driver / Passenger And Rear Door Bins",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Interior Trim -inc: Piano Black Instrument Panel Insert, Piano Black Door Panel Insert, Piano Black Console Insert and Piano Black/Metal-Look Interior Accents",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Leather Door Trim Insert",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Manual Adjustable Rear Head Restraints",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Manual Tilt/Telescoping Steering Column",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Memory Settings -inc: Door Mirrors",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Outside Temp Gauge",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Passenger Seat",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Perforated Leather Seat Trim -inc: accent piping",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Perimeter Alarm",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Power 1st Row Windows w/Front And Rear 1-Touch Up/Down",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Power Door Locks w/Autolock Feature",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Power Rear Windows, Fixed 3rd Row Windows and w/Manual 2nd Row Sun Blinds",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Proximity Key For Doors And Push Button Start",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Radio w/Seek-Scan, Clock and Steering Wheel Controls",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Radio: Bose Premium Sound System -inc: 12 speakers w/subwoofer, 9 color touchscreen, Bluetooth HandsFreeLink and streaming audio, Radio Data System (RDS), Speed-Sensitive Volume Compensation (SVC), wireless Apple CarPlay and Android Auto compatibility, Wi-Fi hotspot capability (requires AT&T data plan), SMS text message function (Your wireless carrier's rate plans apply, State or local laws may limit use of texting feature.), HD Radio, 2.5-amp USB type-A smartphone/audio interface port in front console, multi-zone audio and CabinTalk in-car PA system",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Rear Cupholder",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Rear HVAC w/Separate Controls",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Redundant Digital Speedometer",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Remote Keyless Entry w/Integrated Key Transmitter, 2 Door Curb/Courtesy, Illuminated Entry and Panic Button",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "Remote Releases -Inc: Proximity Cargo Access and Mechanical Fuel",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value:
          "SiriusXM -inc: SiriusXM requires a subscription after any trial period, If you decide to continue your SiriusXM service at the end of your trial subscription, the plan you choose will automatically renew and bill at then-current rates until you call SiriusXM at 1-866-635-2349 to cancel, See our customer agreement for complete terms at www.siriusxm.com, Fees and programming subject to change, Available in the 48 contiguous United States and D.C, SiriusXM and all related marks and logos are trademarks of SiriusXM radio Inc",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Trip Computer",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Trunk/Hatch Auto-Latch",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Valet Function",
        matchLevel: "none",
        matchedWords: [],
      },
      {
        value: "Voice Activated Dual Zone Front Automatic Air Conditioning",
        matchLevel: "none",
        matchedWords: [],
      },
    ],
    lightning: {
      status: {
        value: "",
        matchLevel: "none",
        matchedWords: [],
      },
    },
    ford_SpecialVehicle: {
      value: "",
      matchLevel: "none",
      matchedWords: [],
    },
    algolia_sort_order: {
      value: "0",
      matchLevel: "none",
      matchedWords: [],
    },
    hash: {
      value: "4d7746c8a8a2865febb48b0c90f12a7a",
      matchLevel: "none",
      matchedWords: [],
    },
  },
};
