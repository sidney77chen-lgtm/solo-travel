import React, { useState, useEffect } from 'react';
import { Activity, POILocation } from '../types';
import { MapPin, Navigation as NavIcon, Star } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icons in React/Webpack/Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ACTIVITY_ICON = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const POI_ICON = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const USER_ICON = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  activities: Activity[];
  pois?: POILocation[];
}

// Component to handle map centering and finding user
const MapControls: React.FC<{ userLocation: [number, number] | null }> = ({ userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 15);
    }
  }, [userLocation, map]);

  return null;
};

const MapView: React.FC<MapViewProps> = ({ activities, pois = [] }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isFindingLocation, setIsFindingLocation] = useState(false);

  // Center map on first activity or fallback to a default (e.g. Kyoto as before)
  const initialCenter: [number, number] = activities.length > 0 && activities[0].location
    ? [activities[0].location.lat, activities[0].location.lng]
    : [35.0116, 135.7681]; // Kyoto coordinates

  const handleFindMe = () => {
    setIsFindingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setIsFindingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to find your location. Please check browser permissions.");
          setIsFindingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsFindingLocation(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-blue-100 animate-fade-in overflow-hidden">
      <MapContainer
        center={initialCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapControls userLocation={userLocation} />

        {/* Current Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={USER_ICON}>
            <Popup>
              <div className="font-bold">You are here 📍</div>
            </Popup>
          </Marker>
        )}

        {/* Activity Markers */}
        {activities.map((activity) => activity.location && (
          <Marker
            key={activity.id}
            position={[activity.location.lat, activity.location.lng]}
            icon={ACTIVITY_ICON}
          >
            <Popup>
              <div className="p-1">
                <div className="font-bold text-pop-blue">{activity.title}</div>
                <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                <p className="text-sm mt-2">{activity.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* POI Markers */}
        {pois.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.location.lat, poi.location.lng]}
            icon={POI_ICON}
          >
            <Popup>
              <div className="p-1">
                <div className="font-bold text-pop-yellow flex items-center gap-1">
                  <Star size={14} fill="currentColor" /> {poi.title}
                </div>
                {poi.category && <div className="text-xs text-gray-400">{poi.category}</div>}
                <p className="text-sm mt-2">{poi.description}</p>
                {poi.address && <div className="text-[10px] text-gray-400 mt-2">{poi.address}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Controls */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
        <span className="bg-pop-yellow px-6 py-2 rounded-xl text-xs font-black text-pop-dark border-4 border-pop-dark shadow-pop flex items-center gap-2 -rotate-1">
          <MapPin size={16} className="text-pop-blue" strokeWidth={3} />
          EXPLORING {activities[0]?.title.toUpperCase() || "WORLD"}
        </span>

        <button
          onClick={handleFindMe}
          disabled={isFindingLocation}
          className={`
            bg-white p-3 rounded-full border-4 border-pop-dark shadow-pop 
            hover:scale-110 active:scale-95 transition-all
            ${isFindingLocation ? 'animate-pulse opacity-70' : ''}
          `}
        >
          <NavIcon size={24} className="text-pop-blue" fill={userLocation ? "currentColor" : "none"} />
        </button>
      </div>

      <style>{`
        .leaflet-container {
             background: #eff6ff;
        }
        .leaflet-popup-content-wrapper {
            border-radius: 12px;
            border: 3px solid #1a1a1a;
            box-shadow: 4px 4px 0px #1a1a1a;
        }
        .leaflet-popup-tip {
            border: 3px solid #1a1a1a;
        }
      `}</style>
    </div>
  );
};

export default MapView;