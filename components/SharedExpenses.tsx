import React, { useMemo, useState } from 'react';
    import { Expense } from '../types';
    import { CheckCircle, ExternalLink, Share2, Clock, RotateCcw, StickyNote, History } from 'lucide-react';
    
    interface SharedExpensesProps {
      expenses: Expense[];
      onSettle: (id: string) => void;
      onUnsettle: (id: string) => void;
      currency: string;
    }
    
    const SharedExpenses: React.FC<SharedExpensesProps> = ({ expenses, onSettle, onUnsettle, currency }) => {
      const [view, setView] = useState<'pending' | 'settled'>('pending');
    
      const sharedExpenses = useMemo(() => 
        expenses.filter(e => e.isShared).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [expenses]
      );
    
      const pendingExpenses = sharedExpenses.filter(e => !e.isSettled);
      const settledExpenses = sharedExpenses.filter(e => e.isSettled);
      const displayedExpenses = view === 'pending' ? pendingExpenses : settledExpenses;
    
      const totalPending = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
    
      const openPaymentApp = () => {
        window.open('https://pay.google.com', '_blank');
      };
    
      return (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-blue-100 font-medium text-sm uppercase tracking-wider mb-1">Total Pending Split</h2>
                <div className="text-4xl font-bold">{currency}{totalPending.toFixed(2)}</div>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Share2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="mt-4 text-blue-100 text-sm">
              {pendingExpenses.length} transaction{pendingExpenses.length !== 1 ? 's' : ''} waiting to be settled.
            </p>
            {pendingExpenses.length > 0 && (
                <button 
                    onClick={openPaymentApp}
                    className="mt-4 w-full py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                    <ExternalLink size={16} /> Open Payment App
                </button>
            )}
          </div>
    
          {/* Toggle View */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
                onClick={() => setView('pending')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${view === 'pending' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
                Pending
            </button>
            <button 
                onClick={() => setView('settled')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${view === 'settled' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
                Settled History
            </button>
          </div>
    
          {/* List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                {view === 'pending' ? <Clock size={20} className="text-slate-500 dark:text-slate-400" /> : <History size={20} className="text-slate-500 dark:text-slate-400" />}
                {view === 'pending' ? 'Pending Items' : 'Settled History'}
            </h3>
            
            {displayedExpenses.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <CheckCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                    {view === 'pending' ? 'All shared expenses are settled!' : 'No settled history yet.'}
                </p>
              </div>
            ) : (
              displayedExpenses.map(expense => (
                <div key={expense.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col gap-3 group">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800 dark:text-white">{expense.description}</span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">{expense.category}</span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(expense.date).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-800 dark:text-white">{currency}{expense.amount.toFixed(2)}</span>
                        {view === 'pending' ? (
                            <button
                            onClick={() => onSettle(expense.id)}
                            title="Mark as Settled"
                            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition"
                            >
                            <CheckCircle size={24} />
                            </button>
                        ) : (
                            <button
                            onClick={() => onUnsettle(expense.id)}
                            title="Undo Settlement"
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-full transition"
                            >
                            <RotateCcw size={20} />
                            </button>
                        )}
                    </div>
                  </div>
                  
                  {expense.sharedNote && (
                      <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex gap-2 items-start text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
                          <StickyNote size={16} className="mt-0.5 text-slate-400 shrink-0" />
                          <p>{expense.sharedNote}</p>
                      </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      );
    };
    
    export default SharedExpenses;
    