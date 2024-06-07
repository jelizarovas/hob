import { data } from "./data";
import { MdQrCode } from "react-icons/md";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export const Navbar = () => {
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
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
      <div className="flex items-center space-x-2  select-none">
        <img
          className="w-4 grayscale"
          src="favicon/android-chrome-192x192.png"
        />
        <span className="uppercase font-mono opacity-70">{data?.name}</span>
      </div>
      <ul>
        <NavButton Icon={MdQrCode} label="Scan" />
      </ul>
    </div>
  );
};

const NavButton = ({ Icon, label = "", ...props }) => {
  return (
    <li className="flex items-center space-x-2 select-none rounded hover:bg-white px-4 py-2 transition-all hover:bg-opacity-20 cursor-pointer">
      <Icon />
      <span>{label}</span>
    </li>
  );
};
