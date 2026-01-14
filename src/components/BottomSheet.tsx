import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion";

interface BottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  minHeight?: number;
  peekHeight?: number;
  showHandle?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  isOpen,
  onClose: _onClose, // Reserved for future use
  minHeight = 80,
  peekHeight = 200,
  showHandle = true,
}) => {
  const [sheetState, setSheetState] = useState<
    "collapsed" | "peek" | "expanded"
  >("peek");
  const controls = useAnimation();
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate snap points based on container height
  useEffect(() => {
    const updateHeight = () => {
      setContainerHeight(window.innerHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const maxHeightPx = containerHeight * 0.85;

  const snapPoints = {
    collapsed: containerHeight - minHeight,
    peek: containerHeight - peekHeight,
    expanded: containerHeight - maxHeightPx,
  };

  // Animate to state
  const animateToState = useCallback(
    (state: "collapsed" | "peek" | "expanded") => {
      setSheetState(state);
      controls.start({
        y: snapPoints[state],
        transition: { type: "spring", damping: 30, stiffness: 300 },
      });
    },
    [controls, snapPoints]
  );

  // Initialize position
  useEffect(() => {
    if (isOpen && containerHeight > 0) {
      animateToState("peek");
    }
  }, [isOpen, containerHeight]);

  // Handle drag end
  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const currentY = info.point.y;

    // Use velocity to determine direction
    if (Math.abs(velocity) > 500) {
      if (velocity > 0) {
        // Swiping down
        if (sheetState === "expanded") {
          animateToState("peek");
        } else {
          animateToState("collapsed");
        }
      } else {
        // Swiping up
        if (sheetState === "collapsed") {
          animateToState("peek");
        } else {
          animateToState("expanded");
        }
      }
      return;
    }

    // Use position to determine snap point
    const snapThresholds = {
      expandedToPeek:
        snapPoints.expanded + (snapPoints.peek - snapPoints.expanded) / 2,
      peekToCollapsed:
        snapPoints.peek + (snapPoints.collapsed - snapPoints.peek) / 2,
    };

    if (currentY < snapThresholds.expandedToPeek) {
      animateToState("expanded");
    } else if (currentY < snapThresholds.peekToCollapsed) {
      animateToState("peek");
    } else {
      animateToState("collapsed");
    }
  };

  // Handle click on collapsed state to expand
  const handleHeaderClick = () => {
    if (sheetState === "collapsed") {
      animateToState("peek");
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      ref={sheetRef}
      className="fixed left-0 right-0 bottom-0 z-[2000] touch-none"
      style={{ height: maxHeightPx }}
      initial={{ y: containerHeight }}
      animate={controls}
      drag="y"
      dragConstraints={{
        top: snapPoints.expanded,
        bottom: snapPoints.collapsed,
      }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border-t border-x border-gray-200 dark:border-gray-700">
        {/* Drag Handle */}
        {showHandle && (
          <div
            className="flex-shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onClick={handleHeaderClick}
          >
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto" />
          </div>
        )}

        {/* Expand/Collapse indicator */}
        <div
          className="flex-shrink-0 px-4 pb-2 flex items-center justify-center"
          onClick={handleHeaderClick}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (sheetState === "expanded") {
                animateToState("peek");
              } else {
                animateToState("expanded");
              }
            }}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                sheetState === "expanded" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          onTouchStart={(e) => {
            // Allow scrolling inside content when expanded
            if (sheetState === "expanded" && contentRef.current) {
              const { scrollTop, scrollHeight, clientHeight } =
                contentRef.current;
              if (scrollTop > 0 || scrollHeight > clientHeight) {
                e.stopPropagation();
              }
            }
          }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
};

// Simpler bottom sheet variant for the details panel
interface DetailBottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}

export const DetailBottomSheet: React.FC<DetailBottomSheetProps> = ({
  children,
  isOpen,
  onClose,
}) => {
  const [height, setHeight] = useState<"collapsed" | "half" | "full">("half");
  const sheetRef = useRef<HTMLDivElement>(null);

  const heights = {
    collapsed: "20vh",
    half: "50vh",
    full: "85vh",
  };

  // Reset height when opening
  useEffect(() => {
    if (isOpen) {
      setHeight("half");
    }
  }, [isOpen]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 500 || offset > 100) {
      // Dragging down fast or far
      if (height === "full") {
        setHeight("half");
      } else if (height === "half") {
        setHeight("collapsed");
      } else if (onClose) {
        onClose();
      }
    } else if (velocity < -500 || offset < -100) {
      // Dragging up fast or far
      if (height === "collapsed") {
        setHeight("half");
      } else if (height === "half") {
        setHeight("full");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={sheetRef}
          className="fixed left-0 right-0 bottom-16 z-[2000] lg:hidden"
          initial={{ y: "100%" }}
          animate={{ y: 0, height: heights[height] }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border-t border-x border-gray-200 dark:border-gray-700">
            {/* Drag Handle */}
            <div className="flex-shrink-0 pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto" />
            </div>

            {/* Height indicator buttons */}
            <div className="flex-shrink-0 px-4 py-1 flex items-center justify-center gap-2">
              {(["collapsed", "half", "full"] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setHeight(h)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    height === h
                      ? "bg-blue-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={`Set height to ${h}`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
