import React, { useState } from 'react';
import { Ticket } from '../types';
import { Building2, Plane, FileText, X, Calendar, Train, Ticket as TicketIcon, Edit2, Maximize2, Plus, Trash2, StickyNote, FileUp, Download } from 'lucide-react';
import SwipeableItem from './SwipeableItem';

interface WalletProps {
    tickets: Ticket[];
    onAddTicket: (ticket: Ticket) => void;
    onUpdateTicket: (ticket: Ticket) => void;
    onDeleteTicket: (id: string) => void;
    onPreviewImage: (url: string) => void;
    onImportCSV: () => void;
    onDownloadTemplate: () => void;
}

const Wallet: React.FC<WalletProps> = ({ tickets, onAddTicket, onUpdateTicket, onDeleteTicket, onPreviewImage, onImportCSV, onDownloadTemplate }) => {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTicketId, setEditingTicketId] = useState<string | null>(null);

    // Form State
    const [type, setType] = useState<'Hotel' | 'Flight' | 'Train' | 'Event'>('Event');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [details, setDetails] = useState('');
    const [notes, setNotes] = useState('');
    const [files, setFiles] = useState<string[]>([]);

    const handleOpenAdd = () => {
        setEditingTicketId(null);
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (ticket: Ticket) => {
        setEditingTicketId(ticket.id);
        setType(ticket.type);
        setTitle(ticket.title);
        setDate(ticket.date);
        setDetails(ticket.details);
        setNotes(ticket.notes || '');
        setFiles(ticket.files || []);

        setSelectedTicket(null);
        setIsModalOpen(true);
    };

    const handleDeleteCurrent = () => {
        if (editingTicketId) {
            onDeleteTicket(editingTicketId);
            setIsModalOpen(false);
            resetForm();
        }
    }

    const handleSave = () => {
        if (!title) return;

        const ticketData: Ticket = {
            id: editingTicketId || Math.random().toString(36).substr(2, 9),
            type,
            title,
            date,
            details,
            notes,
            files: files.length > 0 ? files : undefined
        };

        if (editingTicketId) {
            onUpdateTicket(ticketData);
        } else {
            onAddTicket(ticketData);
        }

        setIsModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setDate('');
        setDetails('');
        setNotes('');
        setFiles([]);
        setType('Event');
        setEditingTicketId(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setFiles(prev => [...prev, event.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getIcon = (ticketType: string) => {
        switch (ticketType) {
            case 'Flight': return <Plane size={24} strokeWidth={2.5} />;
            case 'Hotel': return <Building2 size={24} strokeWidth={2.5} />;
            case 'Train': return <Train size={24} strokeWidth={2.5} />;
            default: return <TicketIcon size={24} strokeWidth={2.5} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-blue-50 relative px-6 pt-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-4xl font-black text-pop-dark tracking-tighter">WALLET</h2>
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
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Pass</p>
                    <p className="text-3xl font-black text-pop-blue tracking-tighter">{tickets.length}</p>
                </div>
            </div>

            {/* Ticket List */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-4">
                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <TicketIcon size={64} className="mb-4 opacity-20" strokeWidth={1} />
                        <p className="font-bold">EMPTY WALLET</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <SwipeableItem
                            key={ticket.id}
                            onDelete={() => onDeleteTicket(ticket.id)}
                            onClick={() => setSelectedTicket(ticket)}
                        >
                            <div
                                className="bg-white rounded-xl border-2 border-pop-dark shadow-pop overflow-hidden cursor-pointer group hover:shadow-pop-hover transition-all relative"
                            >
                                {/* Decorative Left Strip */}
                                <div className="absolute left-0 top-0 bottom-0 w-3 bg-pop-yellow border-r-2 border-pop-dark"></div>

                                {/* Dashed Line Decoration */}
                                <div className="absolute right-16 top-0 bottom-0 w-0 border-l-2 border-dashed border-gray-300"></div>
                                <div className="absolute -top-2 right-[58px] w-4 h-4 bg-blue-50 rounded-full border-b-2 border-gray-300"></div>
                                <div className="absolute -bottom-2 right-[58px] w-4 h-4 bg-blue-50 rounded-full border-t-2 border-gray-300"></div>

                                <div className="p-5 pl-7 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-blue-50 border-2 border-pop-dark flex items-center justify-center text-pop-dark group-hover:bg-pop-blue group-hover:text-white transition-colors">
                                            {getIcon(ticket.type)}
                                        </div>
                                        <div className="z-10 bg-white pr-2">
                                            <p className="font-black text-pop-dark text-xl leading-none mb-1">{ticket.title}</p>
                                            <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-1 uppercase tracking-wide">
                                                <Calendar size={12} strokeWidth={2.5} /> {ticket.date}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwipeableItem>
                    ))
                )}
            </div>

            {/* FAB */}
            <button
                onClick={handleOpenAdd}
                className="fixed bottom-24 right-6 bg-pop-dark text-white p-4 rounded-xl border-2 border-white shadow-pop hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all z-40"
            >
                <Plus size={28} strokeWidth={3} />
            </button>

            {/* View Ticket Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-pop-dark/80 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar border-4 border-pop-dark">
                        <div className="bg-pop-blue p-6 text-white text-center relative overflow-hidden border-b-4 border-pop-dark">
                            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:16px_16px]"></div>
                            <h3 className="text-xl font-black uppercase tracking-widest relative z-10">{selectedTicket.type}</h3>
                            <p className="text-pop-yellow font-bold relative z-10">{selectedTicket.date}</p>

                            <div className="absolute top-0 right-0 p-2 flex gap-1 z-30">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEdit(selectedTicket);
                                    }}
                                    className="text-white hover:text-pop-yellow p-3 transition-colors"
                                >
                                    <Edit2 size={24} strokeWidth={3} />
                                </button>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="text-white hover:text-pop-yellow p-3 transition-colors"
                                >
                                    <X size={28} strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 relative bg-white">
                            {/* Perforation circles */}
                            <div className="absolute -top-4 -left-4 w-8 h-8 bg-pop-dark rounded-full border-4 border-white"></div>
                            <div className="absolute -top-4 -right-4 w-8 h-8 bg-pop-dark rounded-full border-4 border-white"></div>

                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-pop-dark mb-4 leading-tight">{selectedTicket.title}</h2>
                                <div className="bg-blue-50 p-4 rounded-xl border-2 border-pop-dark text-left">
                                    <p className="text-xs font-black text-gray-400 uppercase mb-1">Details</p>
                                    <p className="text-lg font-bold text-pop-dark leading-snug">{selectedTicket.details}</p>
                                </div>

                                {selectedTicket.notes && (
                                    <div className="mt-4 bg-pop-yellow/10 p-4 rounded-xl text-left border-2 border-pop-dark border-dashed">
                                        <div className="flex items-center gap-2 mb-1 text-pop-dark text-xs uppercase font-black tracking-wider">
                                            <StickyNote size={14} /> Notes
                                        </div>
                                        <p className="text-sm font-bold text-pop-dark">{selectedTicket.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Files Section in View Mode */}
                            {selectedTicket.files && selectedTicket.files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Attachments ({selectedTicket.files.length})</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedTicket.files.map((file, index) => (
                                            <div key={index} className="relative group rounded-xl overflow-hidden border-2 border-pop-dark bg-blue-50 h-24 shadow-sm hover:shadow-pop-sm transition-all">
                                                {file.startsWith('data:image') ? (
                                                    <>
                                                        <img src={file} alt="Attachment" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                        <div className="absolute inset-0 bg-pop-dark/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => onPreviewImage(file)}>
                                                            <Maximize2 className="text-white" size={24} strokeWidth={3} />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => onPreviewImage(file)}
                                                        className="w-full h-full flex flex-col items-center justify-center text-pop-dark hover:bg-white transition-colors"
                                                    >
                                                        <FileText size={28} className="mb-1" strokeWidth={2} />
                                                        <span className="text-[10px] font-bold uppercase">View File</span>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Ticket Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div className="absolute inset-0 bg-pop-dark/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full sm:w-[400px] rounded-2xl mx-4 p-6 pb-6 shadow-2xl animate-slide-up border-t-4 sm:border-4 border-pop-dark max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black uppercase">{editingTicketId ? 'Edit Ticket' : 'Add Ticket'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white border-2 border-pop-dark p-2 rounded-lg hover:bg-gray-100 shadow-pop-sm active:shadow-none active:translate-y-1 transition-all">
                                <X size={20} className="text-pop-dark" strokeWidth={3} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Type</label>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                    {['Flight', 'Hotel', 'Train', 'Event'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setType(t as any)}
                                            className={`px-4 py-2 rounded-xl text-sm font-black border-2 transition-all whitespace-nowrap shadow-sm ${type === t
                                                ? 'bg-pop-blue border-pop-dark text-white shadow-pop-sm'
                                                : 'bg-white border-gray-200 text-gray-500 hover:border-pop-dark hover:text-pop-dark'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-blue-50 p-3 rounded-xl border-2 border-pop-dark focus:bg-white focus:shadow-pop-sm outline-none font-bold text-pop-dark"
                                    placeholder="e.g. Flight to Tokyo"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Details</label>
                                <textarea
                                    value={details}
                                    onChange={e => setDetails(e.target.value)}
                                    className="w-full bg-blue-50 p-3 rounded-xl border-2 border-pop-dark focus:bg-white focus:shadow-pop-sm outline-none font-medium text-pop-dark h-20 resize-none"
                                    placeholder="Seat numbers, booking ref, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className="w-full bg-blue-50 p-3 rounded-xl border-2 border-pop-dark focus:bg-white focus:shadow-pop-sm outline-none font-medium text-pop-dark h-20 resize-none"
                                    placeholder="Any personal reminders..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Date</label>
                                <input
                                    type="text"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full bg-blue-50 p-3 rounded-xl border-2 border-pop-dark focus:bg-white focus:shadow-pop-sm outline-none font-bold text-pop-dark"
                                    placeholder="e.g. Oct 24, 14:00"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Attachments</label>

                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="relative group rounded-xl overflow-hidden border-2 border-pop-dark bg-blue-50 aspect-square">
                                            {file.startsWith('data:image') ? (
                                                <img src={file} alt="Preview" className="w-full h-full object-cover grayscale" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center flex-col text-pop-dark">
                                                    <FileText size={20} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-pop-dark/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="bg-red-500 text-white p-2 rounded-lg border-2 border-white shadow-lg hover:scale-110 transition-transform"
                                                >
                                                    <Trash2 size={16} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <label className="flex items-center justify-center aspect-square bg-white border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pop-blue hover:bg-blue-50 transition-colors group">
                                        <div className="flex flex-col items-center">
                                            <Plus size={24} className="text-gray-300 group-hover:text-pop-blue" strokeWidth={3} />
                                        </div>
                                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full bg-pop-dark text-white py-4 rounded-xl font-black uppercase tracking-wide border-2 border-transparent hover:border-white shadow-lg hover:shadow-pop transition-all mt-2"
                            >
                                {editingTicketId ? 'Save Changes' : 'Add to Wallet'}
                            </button>
                            {editingTicketId && (
                                <button
                                    onClick={handleDeleteCurrent}
                                    className="w-full mt-2 bg-white border-2 border-red-500 text-red-500 py-4 rounded-xl font-black uppercase hover:bg-red-50 transition-colors"
                                >
                                    Delete Ticket
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;