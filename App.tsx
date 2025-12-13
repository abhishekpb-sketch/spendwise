import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Share2, Settings as SettingsIcon, Plus, X, Loader2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SharedExpenses from './components/SharedExpenses';
import Settings from './components/Settings';
import { StorageService } from './services/storage';
import { Expense, UserSettings, DEFAULT_CATEGORIES } from './types';

const App: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [settings, setSettings] = useState<UserSettings>({
        reminderTime: '22:00',
        enableReminders: true,
        currency: '$',
        categories: DEFAULT_CATEGORIES,
        theme: 'light'
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Modal State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES[0]);
    const [isShared, setIsShared] = useState(false);
    const [sharedNote, setSharedNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Initial Data Load
    useEffect(() => {
        const loadData = async () => {
            try {
                const [loadedSettings, loadedExpenses] = await Promise.all([
                    StorageService.getSettings(),
                    StorageService.getExpenses()
                ]);
                setSettings(loadedSettings);
                setExpenses(loadedExpenses);
                setCategory(loadedSettings.categories[0] || DEFAULT_CATEGORIES[0]);
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (!loading) {
            StorageService.saveExpenses(expenses);
        }
    }, [expenses, loading]);

    useEffect(() => {
        if (!loading) {
            StorageService.saveSettings(settings);
            // Apply Theme
            if (settings.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [settings, loading]);

    // Request notification permission when reminders are enabled
    useEffect(() => {
        if (settings.enableReminders && Notification.permission === "default") {
            Notification.requestPermission().catch(err => {
                console.error('Failed to request notification permission:', err);
            });
        }
    }, [settings.enableReminders]);

    // Reminder Logic
    useEffect(() => {
        if (!settings.enableReminders) return;

        const checkReminder = () => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            if (currentTime === settings.reminderTime && now.getSeconds() < 10) {
                const hasPending = expenses.some(e => e.isShared && !e.isSettled);
                if (hasPending && Notification.permission === "granted") {
                    new Notification("SpendWise Reminder", {
                        body: "You have pending shared expenses to settle before the day ends!",
                        icon: "https://cdn-icons-png.flaticon.com/512/5501/5501375.png"
                    });
                }
            }
        };

        const interval = setInterval(checkReminder, 10000);
        return () => clearInterval(interval);
    }, [settings, expenses]);


    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;

        const newExpense: Expense = {
            id: crypto.randomUUID(),
            amount: parseFloat(amount),
            description,
            category,
            date: new Date(date).toISOString(),
            isShared,
            sharedNote: isShared ? sharedNote : undefined,
            isSettled: false,
            createdAt: Date.now()
        };

        setExpenses(prev => [newExpense, ...prev]);
        closeModal();
    };

    const handleSettle = (id: string) => {
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, isSettled: true } : e));
    };

    const handleUnsettle = (id: string) => {
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, isSettled: false } : e));
    };

    const handleUpdateCategory = (oldCat: string, newCat: string) => {
        setExpenses(prev => prev.map(e => e.category === oldCat ? { ...e, category: newCat } : e));
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setDescription('');
        setAmount('');
        setCategory(settings.categories[0] || 'Other');
        setIsShared(false);
        setSharedNote('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                    <p className="text-slate-500 font-medium">Loading SpendWise...</p>
                </div>
            </div>
        );
    }

    return (
        <HashRouter>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24 md:pb-0 md:pl-64 transition-colors duration-200">
                {/* Desktop Sidebar */}
                <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-50">
                    <div className="p-8">
                        <h1 className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                                <span className="text-lg">S</span>
                            </div>
                            SpendWise
                        </h1>
                    </div>
                    <div className="flex-1 px-4 space-y-2">
                        <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                            <Home size={20} /> Dashboard
                        </NavLink>
                        <NavLink to="/shared" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                            <Share2 size={20} /> Shared
                        </NavLink>
                        <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                            <SettingsIcon size={20} /> Settings
                        </NavLink>
                    </div>
                </nav>

                {/* Mobile Top Bar */}
                <div className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-emerald-600">SpendWise</h1>
                    <button onClick={() => setIsAddModalOpen(true)} className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        <Plus size={20} />
                    </button>
                </div>

                {/* Main Content */}
                <main className="p-6 max-w-4xl mx-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard expenses={expenses} currency={settings.currency} categories={settings.categories} />} />
                        <Route path="/shared" element={<SharedExpenses expenses={expenses} onSettle={handleSettle} onUnsettle={handleUnsettle} currency={settings.currency} />} />
                        <Route path="/settings" element={<Settings expenses={expenses} settings={settings} onSaveSettings={setSettings} onUpdateCategory={handleUpdateCategory} />} />
                    </Routes>
                </main>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50 pb-safe">
                    <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <Home size={24} />
                        <span className="text-[10px] font-medium">Home</span>
                    </NavLink>
                    <div className="relative -top-8">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-14 h-14 bg-emerald-600 rounded-full shadow-xl shadow-emerald-200 dark:shadow-emerald-900/50 text-white flex items-center justify-center transform active:scale-95 transition"
                        >
                            <Plus size={28} />
                        </button>
                    </div>
                    <NavLink to="/shared" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                        <Share2 size={24} />
                        <span className="text-[10px] font-medium">Shared</span>
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                        <SettingsIcon size={24} />
                        <span className="text-[10px] font-medium">Settings</span>
                    </NavLink>
                </nav>

                {/* Desktop FAB */}
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="hidden md:flex fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-full shadow-xl hover:bg-emerald-700 transition font-semibold items-center gap-2 z-50"
                >
                    <Plus size={20} /> Add Expense
                </button>

                {/* Add Expense Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
                        <div className="bg-white dark:bg-slate-900 w-full md:w-[480px] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">New Expense</h2>
                                <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddExpense} className="p-6 space-y-5">
                                <div className="relative">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Lunch at Cafe"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition dark:text-white"
                                        required
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Tip: Type details manually.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Amount ({settings.currency})</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition font-mono dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Category</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition appearance-none dark:text-white"
                                        >
                                            {settings.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition dark:text-white"
                                    />
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-blue-900 dark:text-blue-300">Shared Expense</div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400">Mark to split later via Google Pay</div>
                                        </div>
                                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full border border-blue-200 dark:border-blue-700">
                                            <input
                                                type="checkbox"
                                                checked={isShared}
                                                onChange={(e) => setIsShared(e.target.checked)}
                                                className="absolute opacity-0 w-0 h-0"
                                                id="toggle-shared"
                                            />
                                            <label htmlFor="toggle-shared" className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${isShared ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                                <span className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ${isShared ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Optional Note Field for Shared Expenses */}
                                    {isShared && (
                                        <div className="animate-fade-in">
                                            <label className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide mb-1 block">Shared Note (Optional)</label>
                                            <textarea
                                                value={sharedNote}
                                                onChange={(e) => setSharedNote(e.target.value)}
                                                placeholder="E.g., Split 50/50 with Alice..."
                                                className="w-full bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition dark:text-white"
                                                rows={2}
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 active:scale-[0.98] transition"
                                >
                                    Save Expense
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </HashRouter>
    );
};

export default App;
