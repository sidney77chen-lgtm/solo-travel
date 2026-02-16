import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Activity, ActivityType, Currency } from '../types';
import { MapPin, Utensils, Train, Camera, BedDouble, CheckCircle2, Circle, X, Navigation, StickyNote, Clock as ClockIcon, CloudSun, Edit2, Save, Image as ImageIcon, Trash2, Maximize2, Plus, FileUp, Download } from 'lucide-react';
import SwipeableItem from './SwipeableItem';

interface ItineraryViewProps {
  activities: Activity[];
  onToggleComplete: (id: string) => void;
  onUpdateActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
  onPreviewImage: (url: string) => void;
  onImportCSV: () => void;
  onDownloadTemplate: () => void;
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case ActivityType.FOOD: return <Utensils size={20} strokeWidth={2.5} />;
    case ActivityType.TRANSPORT: return <Train size={20} strokeWidth={2.5} />;
    case ActivityType.SIGHTSEEING: return <Camera size={20} strokeWidth={2.5} />;
    case ActivityType.ACCOMMODATION: return <BedDouble size={20} strokeWidth={2.5} />;
    default: return <MapPin size={20} strokeWidth={2.5} />;
  }
};

const LiveClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Local Time</p>
            <p className="text-2xl font-black text-pop-blue tracking-tighter leading-none">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    );
};

const WeatherWidget = () => (
    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border-2 border-pop-dark shadow-pop mb-4">
        <div className="bg-pop-yellow p-3 rounded-lg border-2 border-pop-dark text-pop-dark">
            <CloudSun size={28} strokeWidth={2.5} />
        </div>
        <div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-pop-dark">19°C</span>
                <span className="text-sm font-bold text-gray-500 uppercase">Kyoto</span>
            </div>
            <p className="text-xs font-bold text-pop-blue uppercase tracking-wide">Partly Cloudy</p>
        </div>
    </div>
);

const ItineraryView: React.FC<ItineraryViewProps> = ({ activities, onToggleComplete, onUpdateActivity, onDeleteActivity, onPreviewImage, onImportCSV, onDownloadTemplate }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Activity>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Get unique sorted dates
  const dates = useMemo(() => {
    const uniqueDates = Array.from(new Set(activities.map(a => a.date))).sort();
    return uniqueDates.length > 0 ? uniqueDates : [new Date().toISOString().split('T')[0]];
  }, [activities]);

  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  useEffect(() => {
      if (selectedActivity) {
          setEditForm(selectedActivity);
          setIsEditing(false);
      }
  }, [selectedActivity]);

  const dailyActivities = useMemo(() => {
    return activities
      .filter(a => a.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [activities, selectedDate]);

  const openGoogleMaps = (activity: Activity) => {
    const query = activity.address 
        ? encodeURIComponent(activity.address)
        : activity.location 
            ? `${activity.location.lat},${activity.location.lng}` 
            : encodeURIComponent(activity.title);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  const handleAddNew = () => {
    const newActivity: Activity = {
        id: Math.random().toString(36).substr(2, 9),
        date: selectedDate,
        time: '09:00',
        title: '',
        description: '',
        type: ActivityType.SIGHTSEEING,
        isCompleted: false,
        currency: Currency.JPY,
        priceEstimate: 0,
        images: []
    };
    setSelectedActivity(newActivity);
    setEditForm(newActivity);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
      if (editForm.title && editForm.date) {
          onUpdateActivity(editForm as Activity);
          setSelectedActivity(null);
          setIsEditing(false);
      }
  };

  const handleDeleteCurrent = () => {
      if (selectedActivity) {
          onDeleteActivity(selectedActivity.id);
          setSelectedActivity(null);
          setIsEditing(false);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              setEditForm(prev => ({
                  ...prev,
                  images: [...(prev.images || []), base64]
              }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleDeleteImage = (index: number) => {
      setEditForm(prev => ({
          ...prev,
          images: prev.images?.filter((_, i) => i !== index)
      }));
  }

  return (
    <div className="flex flex-col h-full bg-blue-50 animate-fade-in relative">
      
      {/* Date Selector & Clock Header */}
      <div className="pt-8 pb-4 px-6 bg-white border-b-2 border-pop-dark shadow-sm z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
                 <h2 className="text-4xl font-black text-pop-dark tracking-tighter">PLAN</h2>
                 <div className="flex gap-2 mt-2">
                    <button 
                    onClick={onDownloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-pop-dark rounded-lg text-xs font-bold hover:bg-pop-yellow transition-colors shadow-pop-sm active:translate-y-0.5 active:shadow-none"
                    >
                        <Download size={14} strokeWidth={2.5} /> Template
                    </button>
                    <button 
                    onClick={onImportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-pop-dark rounded-lg text-xs font-bold hover:bg-pop-blue hover:text-white transition-colors shadow-pop-sm active:translate-y-0.5 active:shadow-none"
                    >
                        <FileUp size={14} strokeWidth={2.5} /> Import
                    </button>
                 </div>
            </div>
            {/* Clock moved to header */}
            <LiveClock />
          </div>
          
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
            {dates.map((date) => {
                const d = new Date(date);
                const isSelected = selectedDate === date;
                return (
                    <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-xl border-2 transition-all snap-start ${
                            isSelected 
                            ? 'bg-pop-blue border-pop-dark text-white shadow-pop-sm' 
                            : 'bg-white border-gray-200 text-gray-400 hover:border-pop-dark hover:text-pop-dark'
                        }`}
                    >
                        <span className="text-xs font-bold uppercase tracking-wider">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-2xl font-black">{d.getDate()}</span>
                    </button>
                );
            })}
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24 space-y-4" ref={containerRef}>
        
        {/* Weather stays with the daily view */}
        <WeatherWidget />

        {dailyActivities.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 opacity-50">
                 <MapPin size={48} className="mb-2 text-pop-dark" strokeWidth={1.5} />
                 <p className="font-bold text-pop-dark">NO PLANS YET</p>
             </div>
        ) : (
            dailyActivities.map((activity, index) => (
                <div key={activity.id} className="relative pl-4">
                    {/* Timeline Line */}
                    {index !== dailyActivities.length - 1 && (
                        <div className="absolute left-[27px] top-12 bottom-[-16px] w-[2px] bg-gray-200 z-0"></div>
                    )}
                    
                    <div className="flex items-start gap-4 relative z-10">
                         {/* Time Bubble */}
                         <div className="flex flex-col items-center min-w-[50px] pt-1">
                             <span className="text-sm font-black text-pop-dark">{activity.time}</span>
                             <div className={`w-3 h-3 rounded-full border-2 border-pop-dark mt-1 ${activity.isCompleted ? 'bg-pop-blue' : 'bg-pop-yellow'}`}></div>
                         </div>

                         {/* Activity Card */}
                         <SwipeableItem 
                            className="flex-1"
                            onDelete={() => onDeleteActivity(activity.id)}
                            onClick={() => {
                                setSelectedActivity(activity);
                                setIsEditing(false);
                            }}
                         >
                             <div className={`p-4 rounded-xl border-2 border-pop-dark shadow-pop transition-all group active:scale-[0.98] ${
                                 activity.isCompleted ? 'bg-gray-100 opacity-70' : 'bg-white'
                             }`}>
                                 <div className="flex justify-between items-start mb-2">
                                     <div className={`px-2 py-1 rounded border-2 border-pop-dark text-[10px] font-black uppercase flex items-center gap-1 ${
                                         activity.isCompleted ? 'bg-gray-200 text-gray-500' : 'bg-pop-yellow text-pop-dark'
                                     }`}>
                                         {getActivityIcon(activity.type)} {activity.type}
                                     </div>
                                     <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleComplete(activity.id);
                                        }}
                                        className={`transition-colors ${activity.isCompleted ? 'text-pop-blue' : 'text-gray-300 hover:text-pop-dark'}`}
                                     >
                                         {activity.isCompleted ? <CheckCircle2 size={24} fill="currentColor" className="text-white" /> : <Circle size={24} strokeWidth={2.5} />}
                                     </button>
                                 </div>
                                 
                                 <h3 className={`font-black text-lg leading-tight mb-1 ${activity.isCompleted ? 'line-through text-gray-400' : 'text-pop-dark'}`}>
                                     {activity.title}
                                 </h3>
                                 <p className="text-xs font-bold text-gray-400 line-clamp-2">{activity.description}</p>
                                 
                                 {activity.priceEstimate && activity.priceEstimate > 0 && (
                                     <div className="mt-3 inline-block px-2 py-1 bg-blue-50 rounded border border-pop-dark text-xs font-black text-pop-dark">
                                         ¥{activity.priceEstimate.toLocaleString()}
                                     </div>
                                 )}
                             </div>
                         </SwipeableItem>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={handleAddNew}
        className="fixed bottom-24 right-6 bg-pop-blue text-white p-4 rounded-xl border-2 border-pop-dark shadow-pop hover:-translate-y-1 hover:shadow-pop-hover active:translate-y-0 active:shadow-none transition-all z-40"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* View/Edit Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-pop-dark/80 backdrop-blur-sm" onClick={() => setSelectedActivity(null)}></div>
            <div className="relative bg-white w-full sm:w-[450px] max-h-[90vh] overflow-y-auto no-scrollbar rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up border-t-4 sm:border-4 border-pop-dark flex flex-col">
                
                {/* Modal Header */}
                <div className="sticky top-0 bg-white z-20 border-b-2 border-gray-100 p-4 flex justify-between items-center">
                    <div className="flex gap-2">
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="p-2 rounded-lg hover:bg-gray-100 border-2 border-transparent hover:border-pop-dark transition-all">
                                <Edit2 size={20} className="text-pop-dark" strokeWidth={2.5} />
                            </button>
                        )}
                        <button onClick={handleDeleteCurrent} className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 border-2 border-transparent hover:border-red-500 transition-all text-gray-400">
                             <Trash2 size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                    <button onClick={() => setSelectedActivity(null)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border-2 border-transparent hover:border-pop-dark transition-all">
                        <X size={20} className="text-pop-dark" strokeWidth={3} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {isEditing ? (
                        /* EDIT FORM */
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Title</label>
                                <input 
                                    className="w-full bg-blue-50 p-3 rounded-xl border-2 border-pop-dark focus:bg-white focus:shadow-pop-sm outline-none font-black text-xl text-pop-dark"
                                    value={editForm.title}
                                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                                    placeholder="Activity Title"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Time</label>
                                    <input 
                                        type="time"
                                        className="w-full bg-blue-50 p-3 rounded-xl border-2 border-pop-dark font-bold"
                                        value={editForm.time}
                                        onChange={e => setEditForm({...editForm, time: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Type</label>
                                    <select 
                                        className="w-full bg-blue-50 p-3 rounded-xl border-2 border-pop-dark font-bold appearance-none"
                                        value={editForm.type}
                                        onChange={e => setEditForm({...editForm, type: e.target.value as ActivityType})}
                                    >
                                        {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Description</label>
                                <textarea 
                                    className="w-full bg-blue-50 p-3 rounded-xl border-2 border-pop-dark font-medium h-24 resize-none"
                                    value={editForm.description}
                                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                                    placeholder="Add details..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Cost (JPY)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-blue-50 p-3 rounded-xl border-2 border-pop-dark font-bold"
                                        value={editForm.priceEstimate}
                                        onChange={e => setEditForm({...editForm, priceEstimate: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div>
                                     <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Photos</label>
                                     <label className="flex items-center justify-center w-full h-[50px] bg-white border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pop-blue hover:bg-blue-50">
                                         <ImageIcon size={20} className="text-gray-400" />
                                         <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                     </label>
                                </div>
                            </div>

                            {/* Image Preview List in Edit Mode */}
                            {editForm.images && editForm.images.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto py-2">
                                    {editForm.images.map((img, i) => (
                                        <div key={i} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-pop-dark">
                                            <img src={img} className="w-full h-full object-cover" alt="" />
                                            <button 
                                                onClick={() => handleDeleteImage(i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md border border-white"
                                            >
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button 
                                onClick={handleSaveEdit}
                                className="w-full bg-pop-blue text-white py-4 rounded-xl font-black uppercase tracking-wide border-2 border-pop-dark shadow-pop hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all mt-4 flex items-center justify-center gap-2"
                            >
                                <Save size={20} strokeWidth={3} /> Save Changes
                            </button>
                        </div>
                    ) : (
                        /* VIEW MODE */
                        <>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 border-pop-dark text-xs font-black uppercase mb-3 ${
                                        selectedActivity.isCompleted ? 'bg-gray-200 text-gray-500' : 'bg-pop-yellow text-pop-dark'
                                    }`}>
                                         {getActivityIcon(selectedActivity.type)} {selectedActivity.type}
                                    </div>
                                    <h2 className="text-3xl font-black text-pop-dark leading-tight mb-2">{selectedActivity.title}</h2>
                                    <div className="flex items-center gap-2 text-gray-500 font-bold uppercase text-sm">
                                        <ClockIcon size={16} strokeWidth={2.5} />
                                        {selectedActivity.time}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border-2 border-pop-dark">
                                <p className="text-xs font-black text-gray-400 uppercase mb-2">Description</p>
                                <p className="text-pop-dark font-medium leading-relaxed">{selectedActivity.description || 'No description provided.'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded-xl border-2 border-pop-dark shadow-sm">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Estimated Cost</p>
                                    <p className="text-xl font-black text-pop-dark">¥{selectedActivity.priceEstimate?.toLocaleString() || 0}</p>
                                </div>
                                <button 
                                    onClick={() => openGoogleMaps(selectedActivity)}
                                    className="bg-white p-3 rounded-xl border-2 border-pop-dark shadow-sm hover:bg-blue-50 flex flex-col justify-center items-center group transition-colors"
                                >
                                    <Navigation size={20} className="text-pop-blue mb-1 group-hover:-translate-y-0.5 transition-transform" strokeWidth={3} />
                                    <span className="text-[10px] font-black uppercase text-pop-dark">Navigate</span>
                                </button>
                            </div>

                            {/* Image Gallery */}
                            {selectedActivity.images && selectedActivity.images.length > 0 && (
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase mb-2">Photos</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedActivity.images.map((img, i) => (
                                            <div 
                                                key={i} 
                                                className="aspect-square rounded-xl border-2 border-pop-dark overflow-hidden relative group cursor-pointer"
                                                onClick={() => onPreviewImage(img)}
                                            >
                                                <img src={img} className="w-full h-full object-cover" alt="" />
                                                <div className="absolute inset-0 bg-pop-dark/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Maximize2 className="text-white" size={20} strokeWidth={3} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;