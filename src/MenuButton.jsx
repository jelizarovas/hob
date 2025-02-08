import React from "react";
import { DropDown } from "./components/Dropdown";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { MdLogout, MdMenu, MdPerson } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa6";

export const MenuButton = () => {
  const { currentUser } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      history.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const dd = {
    popperPlacement: "bottom-end",
    options: [
      {
        label: "Account",
        Icon: MdPerson,
        onClick: (e) => history.push("/account"),
        Component: (props) => (
          <div className="flex flex-col justify-center items-center bg-indigo-900 w-full text-white">
            <span className="text-xs py-1">Hi, {currentUser?.email?.slice(0, 2).toUpperCase()}</span>
            <Link
              to="/account"
              className="flex items-center w-full  gap-2 hover:bg-opacity-10 bg-white bg-opacity-0 rounded  p-2"
            >
              <MdPerson className="mx-1" /> <span>Account</span>
            </Link>
            {/* <pre>{JSON.stringify(currentUser, null, 2)}</pre> */}
          </div>
        ),
      },
      {
        label: "Take-In Sheet",
        Icon: FaFilePdf,
        onClick: (e) => history.push("/take-in/"),
        // onClick: (e) => window.open("pdf/Take-in Sheet Form.pdf", "_blank", "noopener,noreferrer"),
      },
      {
        label: "Check Request",
        Icon: FaFilePdf,
        onClick: (e) => history.push("/check"),
      },
      {
        label: "Buyers Guide",
        Icon: FaFilePdf,
        onClick: (e) => history.push("/buyers/guide/"),
      },
      {
        label: "Barcode",
        Icon: FaFilePdf,
        onClick: (e) => history.push("/bar/code/"),
      },
      {
        label: "Log Out",
        Icon: MdLogout,
        onClick: handleLogout,
      },
    ],
    renderItem: ({ label, Icon, ...props }) => (
      <div
        className="min-w-32 w-full flex   items-center space-x-2 px-4 py-1 bg-black hover:bg-slate-900 text-white"
        {...props}
      >
        {Icon && <Icon />} <span>{label}</span>
      </div>
    ),
    renderButton: ({ isOpen, open, close, props }) => (
      <AppBarButton
        {...props}
        Icon={MdMenu}
        onClick={isOpen ? close : open}
        isActive={isOpen}
        // label="menu"
      />
    ),
    onSelect: console.log,
    disableSearch: true,
  };

  return (
    <>
      {currentUser && (
        <div className="relative">
          <DropDown {...dd} />
        </div>
      )}
    </>
  );
};

export const AppBarButton = ({ Icon, onClick = () => {}, isActive, label, ...props }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col group relative rounded-lg p-1 mx-1 text-xl  bg-white border-opacity-20  border-white  hover:bg-opacity-20 transition-all ${
        isActive ? "bg-opacity-80 text-black hover:text-white" : "bg-opacity-0 text-white"
      } `}
    >
      {isActive ? <Icon /> : <Icon />}
      {label && <span className="text-[8px] leading-none uppercase">{label}</span>}
    </button>
  );
};
