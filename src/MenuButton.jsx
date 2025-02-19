import React from "react";
import { DropDown } from "./components/Dropdown";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { getAuth } from "firebase/auth";
import { MdLogout, MdMenu, MdAdminPanelSettings, MdPerson, MdQrCode, MdGroup } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa6";

export const MenuButton = () => {
  const { currentUser, role, isAdmin, isPrivileged, isUser } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      history.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Pull the first word from displayName if it exists, else fallback to "Account"
  const firstName = currentUser?.displayName?.split(" ")[0] || "Account";

  // Build dropdown config
  const dd = {
    popperPlacement: "bottom-end",
    // We remove any "onSelect" so it won't try to mark items as selected with a checkmark
    // onSelect: () => {}, // If you leave this in, the library might show a checkmark
    disableSearch: true,
    renderButton: ({ isOpen, open, close, props }) => (
      <AppBarButton {...props} Icon={MdMenu} onClick={isOpen ? close : open} isActive={isOpen} />
    ),
    renderItem: ({ label, Icon, ...props }) => (
      <div
        className="min-w-44 w-full flex items-center space-x-2 px-4 py-2 bg-black hover:bg-slate-900 text-white"
        {...props}
      >
        {Icon && <Icon />}
        <span>{label}</span>
      </div>
    ),
    options: [
      // First item: custom component for the user's profile
      {
        label: firstName,
        Component: () => (
          <div className="flex flex-row items-center bg-indigo-900 w-full text-white">
            <Link
              to="/account"
              className="flex flex-row items-center gap-2 hover:bg-opacity-10 bg-white bg-opacity-0 rounded p-2 flex-1"
            >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full mx-2" />
            ) : (
              <MdPerson className="w-8 h-8 mr-2" />
            )}
              <span>{firstName}</span>
            </Link>
            <Link
              to="/user/me/share"
              className="mx-2 p-2 text-xl rounded bg-white bg-opacity-0 hover:bg-opacity-15 transition-all"
            >
              <MdQrCode />
            </Link>
          </div>
        ),
      },
      // Show "Users" link if privileged
      isPrivileged
        ? {
            label: "Users",
            Icon: MdGroup,
            onClick: () => history.push("/users"),
          }
        : null,
      // Show "Admin Panel" link if admin
      isAdmin
        ? {
            label: "Admin Panel",
            Icon: MdAdminPanelSettings,
            onClick: () => history.push("/dev/test"),
          }
        : null,
      {
        label: "Take-In Sheet",
        Icon: FaFilePdf,
        onClick: () => history.push("/take-in/"),
      },
      {
        label: "Check Request",
        Icon: FaFilePdf,
        onClick: () => history.push("/check"),
      },
      {
        label: "Buyers Guide",
        Icon: FaFilePdf,
        onClick: () => history.push("/buyers/guide/"),
      },
      {
        label: "Barcode",
        Icon: FaFilePdf,
        onClick: () => history.push("/bar/code/"),
      },
      {
        label: "Log Out",
        Icon: MdLogout,
        onClick: handleLogout,
      },
    ].filter(Boolean),
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
      className={`flex flex-col group relative rounded-lg p-2 mx-2 text-xl bg-white border-opacity-20 border-white hover:bg-opacity-20 transition-all ${
        isActive ? "bg-opacity-80 text-black hover:text-white" : "bg-opacity-0 text-white"
      }`}
      {...props}
    >
      <Icon />
      {label && <span className="text-[8px] leading-none uppercase">{label}</span>}
    </button>
  );
};
