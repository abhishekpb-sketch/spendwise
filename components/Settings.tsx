import React, { useState } from 'react';
import { Expense, UserSettings } from '../types';
import { Download, Bell, Database, Moon, Sun, Globe, Tag, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface SettingsProps {
    expenses: Expense[];
    settings: UserSettings;
    onSaveSettings: (s: UserSettings) => void;
    onUpdateCategory: (oldCat: string, newCat: string) => void;
}

const CURRENCIES = ['$', '€', '£', '¥', '₹', '₽', '₩', 'R', 'kr'];

const Settings: React.FC<SettingsProps> = ({ expenses, settings, onSaveSettings, onUpdateCategory }) => {
    const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // Category Edit State
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleExport = () => {
        const [year, month] = exportMonth.split('-');
        const filtered = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month);
        });

        if (filtered.length === 0) {
            alert("No expenses found for this month.");
            return;
        }

        const csvContent = [
            ['Date', 'Category', 'Description', 'Amount', 'Shared', 'Shared Note', 'Settled'],
            ...filtered.map(e => [
                new Date(e.date).toLocaleDateString(),
                e.category,
                `"${e.description.replace(/"/g, '""')}"`,
                e.amount.toFixed(2),
                e.isShared ? 'Yes' : 'No',
                e.sharedNote ? `"${e.sharedNote.replace(/"/g, '""')}"` : '',
                e.isSettled ? 'Yes' : 'No'
            ])
        ].map(e => e.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `expenses_${year}_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const addCategory = () => {
        if (newCategory && !settings.categories.includes(newCategory)) {
            onSaveSettings({ ...settings, categories: [...settings.categories, newCategory] });
            setNewCategory('');
        }
    };

    const deleteCategory = (cat: string) => {
        if (confirm(`Delete category "${cat}"? Existing expenses will not be deleted but will keep this category name.`)) {
            onSaveSettings({ ...settings, categories: settings.categories.filter(c => c !== cat) });
        }
    };

    const startEdit = (cat: string) => {
        setEditingCategory(cat);
        setEditValue(cat);
    };

    const saveEdit = () => {
        if (editingCategory && editValue && editValue !== editingCategory) {
            const updatedCategories = settings.categories.map(c => c === editingCategory ? editValue : c);
            onSaveSettings({ ...settings, categories: updatedCategories });
            onUpdateCategory(editingCategory, editValue); // Update existing expenses
        }
        setEditingCategory(null);
        setEditValue('');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">

            {/* Appearance & Preferences */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Preferences
                </h3>

                <div className="space-y-6">
                    {/* Dark Mode */}
                    <div className="flex items-center justify-between">
                        <label className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                            {settings.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                            Dark Mode
                        </label>
                        <button
                            onClick={() => onSaveSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Currency */}
                    <div className="flex items-center justify-between">
                        <label className="text-slate-600 dark:text-slate-300 font-medium">Currency Symbol</label>
                        <select
                            value={settings.currency}
                            onChange={(e) => onSaveSettings({ ...settings, currency: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                        >
                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Categories Management */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-500" />
                    Categories
                </h3>

                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category..."
                        className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 dark:text-white placeholder:text-slate-400"
                    />
                    <button
                        onClick={addCategory}
                        disabled={!newCategory}
                        className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {settings.categories.map(cat => (
                        <div key={cat} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 group">
                            {editingCategory === cat ? (
                                <div className="flex-1 flex gap-2">
                                    <input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="flex-1 bg-white dark:bg-slate-800 border border-purple-300 rounded px-2 py-1 text-sm dark:text-white"
                                        autoFocus
                                    />
                                    <button onClick={saveEdit} className="text-emerald-500 hover:bg-emerald-50 rounded p-1"><Check size={16} /></button>
                                    <button onClick={() => setEditingCategory(null)} className="text-red-500 hover:bg-red-50 rounded p-1"><X size={16} /></button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{cat}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(cat)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteCategory(cat)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 size={14} /></button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-500" />
                    Notifications
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-slate-600 dark:text-slate-300 font-medium">Shared Expense Reminder</label>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full border border-slate-200 dark:border-slate-600">
                            <input
                                type="checkbox"
                                checked={settings.enableReminders}
                                onChange={(e) => onSaveSettings({ ...settings, enableReminders: e.target.checked })}
                                className="absolute opacity-0 w-0 h-0"
                                id="toggle-reminders"
                            />
                            <label htmlFor="toggle-reminders" className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${settings.enableReminders ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <span className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ${settings.enableReminders ? 'translate-x-6' : 'translate-x-0'}`} />
                            </label>
                        </div>
                    </div>

                    {settings.enableReminders && (
                        <div className="flex items-center justify-between animate-fade-in">
                            <label className="text-sm text-slate-500 dark:text-slate-400">Reminder Time</label>
                            <input
                                type="time"
                                value={settings.reminderTime}
                                onChange={(e) => onSaveSettings({ ...settings, reminderTime: e.target.value })}
                                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
                            />
                        </div>
                    )}

                    {/* Test Notification Button */}
                    <button
                        onClick={async () => {
                            if (Notification.permission === 'default') {
                                await Notification.requestPermission();
                            }

                            if (Notification.permission === 'granted') {
                                try {
                                    // Race condition: wait for SW ready, but timeout after 500ms
                                    const swPromise = navigator.serviceWorker.ready;
                                    const timeoutPromise = new Promise((_, reject) =>
                                        setTimeout(() => reject(new Error('SW_TIMEOUT')), 500)
                                    );

                                    const registration = await Promise.race([swPromise, timeoutPromise]) as ServiceWorkerRegistration;

                                    await registration.showNotification("Test Notification", {
                                        body: "This is how your SpendWise reminders will look! (Via Service Worker)",
                                        icon: "https://cdn-icons-png.flaticon.com/512/5501/5501375.png"
                                    });
                                } catch (e: any) {
                                    console.warn("PWA Notification failed, falling back to standard API:", e);
                                    const isTimeout = e.message === 'SW_TIMEOUT';

                                    // Fallback
                                    new Notification("Test Notification", {
                                        body: `This is how your SpendWise reminders will look! (Fallback Mode${isTimeout ? ': SW Timeout' : ''})`,
                                        icon: "https://cdn-icons-png.flaticon.com/512/5501/5501375.png"
                                    });

                                    if (isTimeout) {
                                        alert("Note: Service Worker didn't respond quickly. You might need to reload the app for background notifications to work perfecty.");
                                    }
                                }
                            } else {
                                alert("Please enable notifications for this site first.");
                            }
                        }}
                        className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <Bell size={16} /> Test Notification
                    </button>
                </div>
            </div>

            {/* Data Export */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-500" />
                    Data Export
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Select Month</label>
                        <input
                            type="month"
                            value={exportMonth}
                            onChange={(e) => setExportMonth(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        className="w-full bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                        <Download size={18} /> Export to CSV
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
