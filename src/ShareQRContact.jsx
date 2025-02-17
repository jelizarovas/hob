import React from "react";
import { useAuth } from "./auth/AuthProvider";
import QRCode from "react-qr-code";
import { MdEmail, MdPerson, MdPhone } from "react-icons/md";

export const ShareQRContact = () => {
  const { currentUser, profile } = useAuth();
  return (
    <div className="my-10 bg-white bg-opacity-5 p-10 rounded-3xl">
      <h4 className="opacity-50 px-4"> {profile?.position}</h4>
      <h1 className="text-3xl flex items-center gap-2 p-2 px-4 ">
        <MdPerson />{" "}
        <span>
          {profile?.firstName} {profile?.lastName}
        </span>
      </h1>
      <div className="flex flex-col gap-2 ">
        {profile?.email && (
          <div className="text-xl flex items-center gap-2 p-2 px-4">
            <MdEmail /> <span>{profile?.email}</span>
          </div>
        )}
        {profile?.cell && (
          <div className="text-xl flex items-center gap-2 p-2 px-4">
            <MdPhone /> <span>{profile?.cell}</span>
          </div>
        )}
      </div>
      <div className=" flex flex-col  gap-2 p-2 px-4 ">
        <h6 className="opacity-60">Contact Card</h6>
        {profile?.contactUrl && (
          <QRCode
            value={profile?.contactUrl}
            className="w-36 h-36 border rounded-lg p-1"
          />
        )}
      </div>
    </div>
  );
};
