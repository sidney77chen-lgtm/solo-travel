import React, { useState, useMemo } from 'react';
import { Expense, ActivityType, Currency } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Wallet, TrendingUp, Calendar, Tag, AlignLeft, DollarSign, RefreshCcw, X, Edit2, Save, Trash2 } from 'lucide-react';


interface ExpenseTrackerProps {
    expenses: Expense[];
    onAddExpense: (expense: Expense) => void;
    onUpdateExpense: (expense: Expense) => void;
    onDeleteExpense: (id: string) => void;
}

// Pop Art Palette for Chart
const COLORS = ['#2563EB', '#FACC15', '#18181b', '#93c5fd', '#ffffff'];

const ExchangeRateWidget = () => (
    <div className="bg-pop-dark rounded-xl p-4 text-white shadow-pop mb-6 flex justify-between items-center relative overflow-hidden group border-2 border-pop-dark">
        <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2 text-pop-yellow">
                Live Rate <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse border border-white"></span>
            </p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tighter">149.50</span>
                <span className="text-sm font-bold text-gray-400">JPY / USD</span>
            </div>
            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Updated 2 mins ago</p>
        </div>
        <div className="relative z-10 bg-white/10 p-2 rounded-lg border-2 border-transparent hover:border-pop-yellow cursor-pointer transition-all active:scale-95">
            <RefreshCcw size={20} className="text-pop-yellow group-hover:rotate-180 transition-transform duration-700" strokeWidth={2.5} />
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-6 -bottom-8 text-white/5 rotate-12 pointer-events-none">
            <DollarSign size={120} strokeWidth={4} />
        </div>
    </div>
);

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    // Delete Confirmation State
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

    // Form State
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ActivityType>(ActivityType.FOOD);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const totalSpent = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);

    const chartData = useMemo(() => {
        const data: Record<string, number> = {};
        expenses.forEach(e => {
            data[e.category] = (data[e.category] || 0) + e.amount;
        });
        return Object.keys(data).map(key => ({ name: key, value: data[key] }));
    }, [expenses]);

    const handleOpenAdd = () => {
        setEditingId(null);
        setAmount('');
        setDescription('');
        setCategory(ActivityType.FOOD);
        setDate(new Date().toISOString().split('T')[0]);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (expense: Expense) => {
        setEditingId(expense.id);
        setAmount(expense.amount.toString());
        setDescription(expense.description);
        setCategory(expense.category);
        setDate(expense.date);
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (!amount || !description) return;

        const expenseData: Expense = {
            id: editingId || Math.random().toString(),
            amount: parseFloat(amount),
            currency: Currency.JPY,
            category,
            description,
            date,
            exchangeRateToBase: 1 // Simplified for demo
        };

        if (editingId) {
            onUpdateExpense(expenseData);
        } else {
            onAddExpense(expenseData);
        }

        setIsModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (deleteConfirmationId) {
            onDeleteExpense(deleteConfirmationId);
            setDeleteConfirmationId(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-blue-50 relative px-6 pt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-black text-pop-dark tracking-tighter">SPEND</h2>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Spent</p>
                    <p className="text-3xl font-black text-pop-blue tracking-tighter">¥{totalSpent.toLocaleString()}</p>
                </div>
            </div>

            <ExchangeRateWidget />

            {/* Transaction List with Integrated Chart */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-3">

                {/* Chart Section - Now Integrated into List */}
                {expenses.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl shadow-pop border-2 border-pop-dark mb-8 flex flex-col items-center relative animate-fade-in mx-1">
                        <div className="absolute top-4 left-4 bg-pop-yellow px-2 py-1 rounded border-2 border-pop-dark text-[10px] font-black uppercase">Analytics</div>
                        <div className="w-full h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="#18181b"
                                        strokeWidth={2}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '2px solid #18181b', boxShadow: '4px 4px 0px 0px #18181b', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#18181b', fontSize: '12px', textTransform: 'uppercase', fontWeight: 900 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                            {chartData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full border border-pop-dark shadow-[1px_1px_0px_0px_#000]" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-[10px] text-pop-dark uppercase font-black">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Recent Transactions</h3>
                {expenses.length === 0 ? (
                    <div className="bg-white p-6 rounded-2xl shadow-pop border-2 border-pop-dark mb-6 text-center mx-1">
                        <p className="text-gray-400 font-bold">No expenses yet. Start spending!</p>
                    </div>
                ) : (
                    expenses.map((expense) => (
                        <div
                            key={expense.id}
                            className="bg-white p-4 rounded-xl border-2 border-pop-dark shadow-pop flex items-center justify-between group cursor-pointer hover:shadow-none transition-all h-full relative mx-1"
                            onClick={() => handleOpenEdit(expense)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-50 border-2 border-pop-dark flex items-center justify-center text-pop-dark group-hover:bg-pop-yellow transition-colors">
                                    {expense.category === ActivityType.FOOD && <TrendingUp size={20} strokeWidth={2.5} />}
                                    {expense.category === ActivityType.TRANSPORT && <Wallet size={20} strokeWidth={2.5} />}
                                    {expense.category === ActivityType.SIGHTSEEING && <Tag size={20} strokeWidth={2.5} />}
                                    {![ActivityType.FOOD, ActivityType.TRANSPORT, ActivityType.SIGHTSEEING].includes(expense.category) && <DollarSign size={20} strokeWidth={2.5} />}
                                </div>
                                <div>
                                    <p className="font-bold text-pop-dark text-lg leading-none mb-1">{expense.description}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{expense.date} • {expense.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 relative z-10">
                                <span className="font-black text-pop-blue text-lg">¥{expense.amount.toLocaleString()}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmationId(expense.id);
                                    }}
                                    className="p-2 hover:bg-red-100 rounded-full transition-colors group/delete relative z-20"
                                    title="Delete Expense"
                                >
                                    <Trash2 size={18} className="text-gray-300 group-hover/delete:text-red-500 transition-colors pointer-events-none" strokeWidth={3} />
                                </button>
                                <Edit2 size={16} className="text-gray-300 group-hover:text-pop-dark transition-colors" strokeWidth={3} />
                            </div>
                        </div>
                    )
                    ))}
            </div>

            {/* FAB */}
            <button
                onClick={handleOpenAdd}
                className="fixed bottom-24 right-6 bg-pop-yellow text-pop-dark p-4 rounded-xl border-2 border-pop-dark shadow-pop hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all z-40"
            >
                <Plus size={28} strokeWidth={3} />
            </button>

            {/* Add/Edit Modal - True Floating Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-pop-dark/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-[400px] max-h-[85vh] overflow-hidden rounded-[32px] shadow-[8px_8px_0px_0px_#18181b] animate-slide-up border-4 border-pop-dark flex flex-col">

                        {/* Sticky Header */}
                        <div className="sticky top-0 bg-white z-20 border-b-2 border-gray-100 p-6 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-pop-dark uppercase tracking-tight">{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white border-2 border-pop-dark p-2 rounded-lg hover:bg-gray-100 shadow-pop-sm active:shadow-none transition-all">
                                <X size={20} className="text-pop-dark" strokeWidth={3} />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 pb-24">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Amount (JPY)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pop-dark font-black text-xl">¥</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="w-full bg-blue-50 p-4 pl-10 rounded-xl border-2 border-pop-dark focus:bg-white focus:shadow-pop-sm outline-none text-2xl font-black text-pop-dark placeholder:text-gray-300 transition-all"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Description</label>
                                <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-3 border-2 border-pop-dark focus-within:bg-white focus-within:shadow-pop-sm transition-all">
                                    <AlignLeft size={20} className="text-gray-400" strokeWidth={2.5} />
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="bg-transparent flex-1 outline-none text-pop-dark font-bold placeholder:text-gray-300"
                                        placeholder="What did you buy?"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Date</label>
                                    <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-3 border-2 border-pop-dark">
                                        <Calendar size={18} className="text-gray-400" strokeWidth={2.5} />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            className="bg-transparent flex-1 outline-none text-pop-dark font-bold text-xs uppercase"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Category</label>
                                    <div className="relative">
                                        <select
                                            value={category}
                                            onChange={e => setCategory(e.target.value as ActivityType)}
                                            className="w-full bg-blue-50 rounded-xl px-4 py-3 border-2 border-pop-dark outline-none text-pop-dark font-bold text-sm appearance-none"
                                        >
                                            {Object.values(ActivityType).map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                        <Tag size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="absolute bottom-0 left-0 w-full p-4 px-6 bg-white/90 backdrop-blur-md border-t-2 border-gray-100 z-30">
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-pop-blue text-white py-4 rounded-[20px] font-black text-lg border-2 border-pop-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                            >
                                {editingId ? <Save size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                                {editingId ? 'Save Changes' : 'Add Expense'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmationId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-pop-dark/80 backdrop-blur-sm" onClick={() => setDeleteConfirmationId(null)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-fade-in border-4 border-pop-dark text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-pop-dark">
                            <Trash2 size={32} className="text-red-500" strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-black text-pop-dark uppercase tracking-tight mb-2">Delete Expense?</h3>
                        <p className="text-gray-500 font-bold mb-6">This action cannot be undone.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirmationId(null)}
                                className="flex-1 bg-gray-100 text-pop-dark py-3 rounded-xl font-black border-2 border-pop-dark hover:bg-gray-200 transition-colors uppercase tracking-wide"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black border-2 border-pop-dark hover:bg-red-600 transition-colors uppercase tracking-wide shadow-pop active:shadow-none active:translate-y-1"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseTracker;