import React, { useState, useEffect } from 'react';
import { ViewState, Activity, ActivityType, Currency, Expense, Ticket, POILocation } from './types';
import Navigation from './components/Navigation';
import ItineraryView from './components/ItineraryView';
import ExpenseTracker from './components/ExpenseTracker';
import Wallet from './components/Wallet';
import MapView from './components/MapView';
import AIChat from './components/AIChat';
import { X, CloudSync, Loader2 } from 'lucide-react';
import { sheetsService } from './services/sheetsService';

// Initial Mock Data (Cleared for Bangkok default)
const INITIAL_ACTIVITIES: Activity[] = [];
const INITIAL_EXPENSES: Expense[] = [];
const INITIAL_TICKETS: Ticket[] = [];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('itinerary');
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [pois, setPois] = useState<POILocation[]>([]);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use the SheetData type from the service for consistency
  type SheetData = import('./services/sheetsService').SheetData;

  // Cleanup and normalize data from Google Sheets
  const sanitizeSheetData = (data: SheetData): SheetData => {
    const sanitizeDate = (d: any) => {
      if (!d) return new Date().toISOString().split('T')[0];
      const date = new Date(d);
      if (isNaN(date.getTime())) return String(d);
      const year = date.getFullYear();
      if (year < 1970) return String(d).split('T')[0];
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const sanitizeTime = (t: any) => {
      if (!t) return '09:00';
      if (typeof t === 'string' && t.includes('T')) {
        const date = new Date(t);
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return String(t);
    };

    const usedIds = new Set<string>();
    const makeUnique = (id: any, fallback: string) => {
      // Ensure id is a string and not just "1" or "true"
      let baseId = String(id || '').trim();
      if (!baseId || baseId === 'undefined' || baseId === 'null') {
        baseId = fallback;
      }

      let uniqueId = baseId;
      let count = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${baseId}-${count}`;
        count++;
      }
      usedIds.add(uniqueId);
      return uniqueId;
    };

    const sanitizeLocation = (item: any) => {
      // 1. Check if location object exists (already structured)
      if (item.location && typeof item.location === 'object' && item.location.lat && item.location.lng) {
        return {
          lat: parseFloat(String(item.location.lat)),
          lng: parseFloat(String(item.location.lng))
        };
      }
      if (item.location_lat !== undefined && item.location_lng !== undefined) {
        const latStr = String(item.location_lat || '').trim();
        const lngStr = String(item.location_lng || '').trim();
        if (latStr && lngStr) {
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
        }
      }
      // 3. Fallback: check if 'location' is a comma-separated string
      if (typeof item.location === 'string' && item.location.includes(',')) {
        const [lat, lng] = item.location.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
      }
      return undefined;
    };

    return {
      plane: (data.plane || []).map((a, i) => {
        const sanitizedId = makeUnique(a.id, `act-${i}`);
        return {
          ...a,
          id: sanitizedId,
          location: sanitizeLocation(a),
          date: sanitizeDate(a.date),
          time: sanitizeTime(a.time),
          isCompleted: String(a.isCompleted).toLowerCase() === 'true' || a.isCompleted === true
        };
      }),
      spend: (data.spend || []).map((e, i) => ({
        ...e,
        id: makeUnique(e.id, `exp-${i}`)
      })),
      wallet: (data.wallet || []).map((t, i) => ({
        ...t,
        id: makeUnique(t.id, `tk-${i}`)
      })),
      poi: (data.poi || []).map((p, i) => ({
        ...p,
        id: makeUnique(p.id, `poi-${i}`),
        location: sanitizeLocation(p)
      }))
    };
  };

  useEffect(() => {
    const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | undefined> => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'SoloTravelPlannerApp' } });
        const json = await response.json();
        if (json && json.length > 0) {
          return {
            lat: parseFloat(String(json[0].lat)),
            lng: parseFloat(String(json[0].lon))
          };
        }
      } catch (error) {
        console.error('Geocoding error for address:', address, error);
      }
      return undefined;
    };

    const fetchData = async () => {
      setIsLoading(true);
      const rawData = await sheetsService.fetchAllData();
      if (rawData) {
        const sanitized = sanitizeSheetData(rawData);

        // Final state updates
        if (sanitized.plane) setActivities(sanitized.plane);
        if (sanitized.spend) setExpenses(sanitized.spend);
        if (sanitized.wallet) setTickets(sanitized.wallet);
        if (sanitized.poi) setPois(sanitized.poi);

        // --- Asynchronous Geocoding Fallback ---
        const actNeeds = (sanitized.plane || []).filter(a => !a.location && a.address);
        const poiNeeds = (sanitized.poi || []).filter(p => !p.location && p.address);

        if (actNeeds.length > 0 || poiNeeds.length > 0) {
          console.log(`Geocoding needs: ${actNeeds.length} activities, ${poiNeeds.length} POIs`);

          for (const a of actNeeds) {
            const loc = await geocodeAddress(a.address!);
            if (loc) {
              setActivities(prev => prev.map(item => item.id === a.id ? { ...item, location: loc } : item));
            }
            await new Promise(r => setTimeout(r, 1000));
          }

          for (const p of poiNeeds) {
            const loc = await geocodeAddress(p.address!);
            if (loc) {
              setPois(prev => prev.map(item => item.id === p.id ? { ...item, location: loc } : item));
            }
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // --- Handlers ---

  const handleToggleComplete = (id: string) => {
    setActivities(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, isCompleted: !a.isCompleted } : a);
      const item = updated.find(a => a.id === id);
      if (item) sheetsService.syncItem('plane', 'set', item);
      return updated;
    });
  };

  const handleUpdateActivity = (updated: Activity) => {
    setActivities(prev => {
      const exists = prev.find(a => a.id === updated.id);
      sheetsService.syncItem('plane', 'set', updated);
      if (exists) {
        return prev.map(a => a.id === updated.id ? updated : a);
      }
      return [...prev, updated];
    });
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    sheetsService.syncItem('plane', 'delete', { id });
  };

  const handleUpdateItinerary = (newActivities: Activity[]) => {
    // Append new activities
    setActivities(prev => [...prev, ...newActivities]);
  };

  // Expense Handlers
  const handleAddExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    sheetsService.syncItem('spend', 'set', expense);
  };
  const handleUpdateExpense = (expense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
    sheetsService.syncItem('spend', 'set', expense);
  };
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    sheetsService.syncItem('spend', 'delete', { id });
  };

  // Wallet Handlers
  const handleAddTicket = (ticket: Ticket) => {
    setTickets(prev => [ticket, ...prev]);
    sheetsService.syncItem('wallet', 'set', ticket);
  };
  const handleUpdateTicket = (ticket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t));
    sheetsService.syncItem('wallet', 'set', ticket);
  };
  const handleDeleteTicket = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
    sheetsService.syncItem('wallet', 'delete', { id });
  };

  // CSV Import Logic
  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const handleDownloadTemplate = () => {
    const headers = ['Date', 'Time', 'Title', 'Description', 'Type', 'Cost', 'Address'];
    const example = ['2023-10-25', '10:00', 'Kyoto Imperial Palace', 'Historical site visit', 'Sightseeing', '0', '3 Kyotogyoen, Kamigyo Ward, Kyoto'];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), example.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "itinerary_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split('\n');
        const startIndex = lines[0].toLowerCase().includes('date') ? 1 : 0;

        const newActivities: Activity[] = [];

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = parseCSVLine(line);
          if (cols.length < 3) continue;

          const clean = (s: string) => s.replace(/^"|"$/g, '').trim();

          newActivities.push({
            id: Math.random().toString(36).substr(2, 9),
            date: clean(cols[0]) || new Date().toISOString().split('T')[0],
            time: clean(cols[1]) || '00:00',
            title: clean(cols[2]) || 'New Activity',
            description: clean(cols[3]) || '',
            type: (clean(cols[4]) as ActivityType) || ActivityType.SIGHTSEEING,
            priceEstimate: parseFloat(cols[5]) || 0,
            address: clean(cols[6]) || '',
            isCompleted: false,
            currency: Currency.JPY,
            images: []
          });
        }

        if (newActivities.length > 0) {
          setActivities(newActivities); // OVERWRITE
          alert(`Imported ${newActivities.length} activities!`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleDownloadWalletTemplate = () => {
    const headers = ['Type', 'Title', 'Date', 'Details', 'Notes'];
    const example = ['Hotel', 'Ace Hotel Kyoto', 'Oct 24 - Oct 28', 'Standard King', 'Check-in 3PM'];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), example.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "wallet_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportWalletCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split('\n');
        const startIndex = lines[0].toLowerCase().includes('type') ? 1 : 0;

        const newTickets: Ticket[] = [];

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = parseCSVLine(line);
          if (cols.length < 2) continue;

          const clean = (s: string) => s.replace(/^"|"$/g, '').trim();

          newTickets.push({
            id: Math.random().toString(36).substr(2, 9),
            type: (clean(cols[0]) as any) || 'Event',
            title: clean(cols[1]) || 'Ticket',
            date: clean(cols[2]) || '',
            details: clean(cols[3]) || '',
            notes: clean(cols[4]) || '',
            files: []
          });
        }

        if (newTickets.length > 0) {
          setTickets(newTickets); // OVERWRITE
          alert(`Imported ${newTickets.length} items to Wallet!`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="h-screen w-full flex flex-col bg-blue-50 overflow-hidden relative font-sans">
      <div className="flex-1 overflow-hidden relative pb-20">
        {view === 'itinerary' && (
          <ItineraryView
            activities={activities}
            onToggleComplete={handleToggleComplete}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
            onPreviewImage={setPreviewImage}
          />
        )}
        {view === 'map' && (
          <div className="w-full h-full">
            <MapView activities={activities} pois={pois} />
          </div>
        )}
        {view === 'expenses' && (
          <ExpenseTracker
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
        {view === 'wallet' && (
          <Wallet
            tickets={tickets}
            onAddTicket={handleAddTicket}
            onUpdateTicket={handleUpdateTicket}
            onDeleteTicket={handleDeleteTicket}
            onPreviewImage={setPreviewImage}
          />
        )}
      </div>

      <Navigation
        currentView={view}
        setView={setView}
        onOpenAI={() => setIsAIChatOpen(true)}
      />

      <AIChat
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        itinerary={activities}
        onUpdateItinerary={handleUpdateItinerary}
      />

      {/* Fullscreen Image Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-pop-dark/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-4 right-4 text-white p-3 rounded-xl border-2 border-white hover:bg-white hover:text-pop-dark transition-colors">
            <X size={24} strokeWidth={3} />
          </button>
          <img src={previewImage} className="max-w-full max-h-full object-contain rounded-xl border-4 border-white shadow-[0_0_40px_rgba(0,0,0,0.5)]" alt="Preview" />
        </div>
      )}
    </div>
  );
};

export default App;