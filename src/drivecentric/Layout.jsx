import React from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import useResizableColumns from "./useResizableColumns";

const Immediate = () => <div className="bg-blue-500 p-4">Immediate</div>;
const Lists = () => <div className="bg-green-500 p-4">Lists</div>;
const Contexts = () => <div className="bg-yellow-500 p-4">Contexts</div>;
const Panels = () => <div className="bg-red-500 p-4">Panels</div>;
const Canels = () => <div className="bg-red-500 p-4">Panels</div>;

const App = () => {
  return (
    <ResponsiveResizableLayout stackPriority={[768, 1024]}>
      <div>
        <Immediate />
        <Lists />
      </div>
      <div>
        <Contexts />
        <Panels />
      </div>
    </ResponsiveResizableLayout>
  );
};

const ResponsiveResizableLayout = ({ children, stackPriority = [] }) => {
  const { colWidths, colHeights, handleResizeWidth, handleResizeHeight } = useResizableColumns();

  // Track screen width for dynamic stacking
  const screenWidth = window.innerWidth;

  // Decide whether to stack groups based on priority
  const shouldStack = (index) => {
    const priority = stackPriority[index] || Infinity; // Default to low priority
    return screenWidth < priority;
  };

  return (
    <div className="h-screen w-full flex flex-wrap gap-4">
      {React.Children.map(children, (group, groupIndex) => (
        <div
          className={`${
            shouldStack(groupIndex) ? "w-full" : "flex-1"
          } bg-darkBg rounded-lg shadow-lg relative overflow-hidden`}
        >
          <ResizableBox
            width={shouldStack(groupIndex) ? Infinity : colWidths[groupIndex] || 300}
            height={!shouldStack(groupIndex) ? Infinity : colHeights[groupIndex] || 300}
            axis={shouldStack(groupIndex) ? "y" : "x"}
            resizeHandles={shouldStack(groupIndex) ? ["s"] : ["e"]}
            handle={
              shouldStack(groupIndex) ? (
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-700 hover:bg-gray-500 cursor-row-resize" />
              ) : (
                <div className="absolute right-0 top-0 h-full w-2 bg-gray-700 hover:bg-gray-500 cursor-col-resize" />
              )
            }
            onResizeStop={(e, data) => {
              if (shouldStack(groupIndex)) {
                handleResizeHeight(groupIndex, data.size.height);
              } else {
                handleResizeWidth(groupIndex, data.size.width);
              }
            }}
            minConstraints={[shouldStack(groupIndex) ? Infinity : 150, !shouldStack(groupIndex) ? Infinity : 150]}
            maxConstraints={[shouldStack(groupIndex) ? Infinity : 500, !shouldStack(groupIndex) ? Infinity : 500]}
          >
            <div className="p-4 h-full">{group}</div>
          </ResizableBox>
        </div>
      ))}
    </div>
  );
};

export default ResponsiveResizableLayout;
