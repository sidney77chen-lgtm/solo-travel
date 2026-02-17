import React, { useState } from 'react';
import { ViewState, Activity, ActivityType, Currency, Expense, Ticket } from './types';
import Navigation from './components/Navigation';
import ItineraryView from './components/ItineraryView';
import ExpenseTracker from './components/ExpenseTracker';
import Wallet from './components/Wallet';
import MapView from './components/MapView';
import AIChat from './components/AIChat';
import { X } from 'lucide-react';

// Mock Data
const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: '1',
    date: '2023-10-24',
    time: '09:00',
    title: 'Fushimi Inari Taisha',
    description: 'Walk through the thousands of vermilion torii gates. Best to go early to avoid crowds.',
    type: ActivityType.SIGHTSEEING,
    isCompleted: true,
    location: { lat: 34.9671, lng: 135.7727 },
    address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto',
    currency: Currency.JPY,
    priceEstimate: 0,
    notes: 'Bring water!',
    images: []
  },
  {
    id: '2',
    date: '2023-10-24',
    time: '12:30',
    title: 'Lunch at Nishiki Market',
    description: 'Explore "Kyoto\'s Kitchen". Try the soy milk donuts and fresh sashmi on a stick.',
    type: ActivityType.FOOD,
    isCompleted: false,
    location: { lat: 35.0050, lng: 135.7649 },
    address: 'Nishikikoji-dori, Nakagyo Ward, Kyoto',
    currency: Currency.JPY,
    priceEstimate: 2000,
    images: []
  },
  {
    id: '3',
    date: '2023-10-24',
    time: '14:30',
    title: 'Kinkaku-ji (Golden Pavilion)',
    description: 'Zen Buddhist temple with top two floors completely covered in gold leaf.',
    type: ActivityType.SIGHTSEEING,
    isCompleted: false,
    location: { lat: 35.0394, lng: 135.7292 },
    address: '1 Kinkakujicho, Kita Ward, Kyoto',
    currency: Currency.JPY,
    priceEstimate: 500,
    images: []
  }
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: '1',
    amount: 500,
    currency: Currency.JPY,
    category: ActivityType.TRANSPORT,
    description: 'Train to Fushimi Inari',
    date: '2023-10-24',
    exchangeRateToBase: 1
  },
  {
    id: '2',
    amount: 1200,
    currency: Currency.JPY,
    category: ActivityType.FOOD,
    description: 'Matcha Ice Cream & Snacks',
    date: '2023-10-24',
    exchangeRateToBase: 1
  }
];

const INITIAL_TICKETS: Ticket[] = [
  {
    id: '1',
    type: 'Flight',
    title: 'JAL Flight JL006',
    date: 'Oct 23, 11:00 AM',
    details: 'Seat 42A • Tokyo (HND) to New York (JFK)',
    notes: 'Vegetarian meal requested',
    files: []
  },
  {
    id: '2',
    type: 'Hotel',
    title: 'Ace Hotel Kyoto',
    date: 'Oct 24 - Oct 28',
    details: 'Standard King • Confirmation #8839201',
    notes: 'Check-in at 3PM',
    files: []
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('itinerary');
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- Handlers ---

  const handleToggleComplete = (id: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, isCompleted: !a.isCompleted } : a));
  };

  const handleUpdateActivity = (updated: Activity) => {
    setActivities(prev => {
      const exists = prev.find(a => a.id === updated.id);
      if (exists) {
        return prev.map(a => a.id === updated.id ? updated : a);
      }
      return [...prev, updated];
    });
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateItinerary = (newActivities: Activity[]) => {
    // Append new activities
    setActivities(prev => [...prev, ...newActivities]);
  };

  // Expense Handlers
  const handleAddExpense = (expense: Expense) => setExpenses(prev => [expense, ...prev]);
  const handleUpdateExpense = (expense: Expense) => setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
  const handleDeleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

  // Wallet Handlers
  const handleAddTicket = (ticket: Ticket) => setTickets(prev => [ticket, ...prev]);
  const handleUpdateTicket = (ticket: Ticket) => setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t));
  const handleDeleteTicket = (id: string) => setTickets(prev => prev.filter(t => t.id !== id));

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
      <div className="flex-1 overflow-hidden relative z-0 pb-20">
        {view === 'itinerary' && (
          <ItineraryView
            activities={activities}
            onToggleComplete={handleToggleComplete}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
            onPreviewImage={setPreviewImage}
            onImportCSV={handleImportCSV}
            onDownloadTemplate={handleDownloadTemplate}
          />
        )}
        {view === 'map' && <MapView activities={activities} />}
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
            onImportCSV={handleImportWalletCSV}
            onDownloadTemplate={handleDownloadWalletTemplate}
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