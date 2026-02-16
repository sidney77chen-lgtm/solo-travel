import React, { useState, useRef, TouchEvent } from 'react';
import { Trash2 } from 'lucide-react';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  onClick?: () => void;
  className?: string;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({ children, onDelete, onClick, className = '' }) => {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    // Do not reset offset here to allow closing by tapping
  };

  const handleTouchMove = (e: TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;

    // Detect if mainly horizontal swipe to avoid interfering with scroll
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Only consider it a swipe if moved enough
        if (Math.abs(diffX) > 10) {
             isSwiping.current = true;
        }
        
        // Logic for left swipe (negative diffX)
        if (diffX < 0) {
            setOffset(Math.max(diffX, -100)); // Cap at -100px
        } else if (offset < 0) {
            // If already open, allow sliding back to close
             setOffset(Math.min(offset + diffX, 0));
        }
    }
  };

  const handleTouchEnd = () => {
    if (offset < -50) {
      setOffset(-80); // Snap open
    } else {
      setOffset(0); // Snap close
    }
    
    // Reset swipe flag after a short delay to prevent immediate click trigger
    setTimeout(() => {
        isSwiping.current = false;
    }, 100);
  };

  const handleClick = (e: React.MouseEvent) => {
      // If currently open, close it
      if (offset < 0) {
          setOffset(0);
          e.stopPropagation();
          return;
      }
      // If it was a swipe action, don't trigger click
      if (isSwiping.current) {
          e.stopPropagation();
          return;
      }
      if (onClick) {
          onClick();
      }
  };

  return (
    <div className={`relative select-none ${className}`}>
      {/* Delete Background Layer */}
      <div className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end pr-6">
        <Trash2 className="text-white animate-pulse" size={24} />
        {/* Invisible button to catch clicks on the red area */}
        <button 
            className="absolute inset-y-0 right-0 w-24 h-full z-10 cursor-pointer"
            onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setOffset(0);
            }}
        />
      </div>
      
      {/* Content Layer */}
      <div 
        className="relative bg-white rounded-2xl transition-transform duration-200 ease-out z-20"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableItem;