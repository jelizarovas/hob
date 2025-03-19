import React from "react";
import { MdAddCircle, MdCarRental, MdChatBubble, MdEmojiTransportation, MdFileOpen } from "react-icons/md";

export const MenuBar = () => {
  return (
    <div className="fixed bottom-0 left-0 bg-black w-full px-4  flex justify-between">
      <MenuButton label="Inventory" Icon={MdEmojiTransportation} />
      <MenuButton label="Print" Icon={MdFileOpen} />
      <MenuButton label="Templates" Icon={MdChatBubble} />
      <MenuButton label="New" Icon={MdAddCircle} />
    </div>
  );
};

const MenuButton = ({ label, Icon, ...props }) => {
  return (
    <button className="flex flex-col items-center border border-white border-opacity-0 rounded-lg  aspect-square w-16 justify-center bg-white bg-opacity-0 hover:bg-opacity-10 transition-all">
      {Icon && <Icon className="text-xl"/>}
      <span className="text-xs opacity-35">{label}</span>
    </button>
  );
};
