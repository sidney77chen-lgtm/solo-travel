import React from 'react';
import { Activity } from '../types';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  activities: Activity[];
}

const MapView: React.FC<MapViewProps> = ({ activities }) => {
  // Center map on Kyoto for the demo context, or derive from first activity
  const mapCenter = activities.length > 0 && activities[0].location 
    ? `${activities[0].location.lat},${activities[0].location.lng}` 
    : "Kyoto";

  return (
    <div className="relative w-full h-full bg-blue-100 animate-fade-in overflow-hidden">
       {/* Google Maps Embed Schematic - Using a contrasting filter */}
       <div className="absolute inset-0 opacity-100 grayscale contrast-125">
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapCenter)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            allowFullScreen
            title="Interactive Map"
          ></iframe>
       </div>
       
       {/* Map Overlay Badge */}
       <div className="absolute top-8 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none z-20">
          <span className="bg-pop-yellow px-6 py-3 rounded-xl text-sm font-black text-pop-dark border-4 border-pop-dark shadow-pop flex items-center gap-2 -rotate-2">
             <MapPin size={20} className="text-pop-blue" strokeWidth={3} /> 
             EXPLORING {mapCenter.split(',')[0].toUpperCase()}
          </span>
       </div>
    </div>
  );
};

export default MapView;