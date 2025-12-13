import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense } from '../types';
import { TrendingUp, Pencil, Trash2 } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  currency: string;
  categories: string[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#84cc16'];

const Dashboard: React.FC<DashboardProps> = ({ expenses, currency, categories, onEdit, onDelete }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [expenses, currentMonth, currentYear]);

  const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const chartData = useMemo(() => {
    const allCats = Array.from(new Set([...categories, ...expenses.map(e => e.category)]));
    return allCats.map(cat => ({
      name: cat,
      value: monthlyExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    })).filter(item => item.value > 0);
  }, [monthlyExpenses, categories, expenses]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Monthly Summary Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-emerald-100 font-medium text-sm uppercase tracking-wider mb-1">This Month's Spend</h2>
          <div className="text-4xl font-bold">{currency}{totalMonthly.toFixed(2)}</div>
          <p className="mt-2 text-emerald-100 text-sm">
            {monthlyExpenses.length} transactions in {new Date().toLocaleString('default', { month: 'long' })}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10">
          <TrendingUp size={120} />
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Spending Breakdown</h3>
          <div className="h-64 w-full">
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
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${currency}${value.toFixed(2)}`, 'Amount']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-slate-600 dark:text-slate-300 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <p>No expenses recorded this month.</p>
        </div>
      )}

      {/* Recent List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 px-1">Recent Transactions</h3>
        <div className="space-y-3">
          {expenses.slice(0, 5).map(expense => (
            <div key={expense.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-10 rounded-full ${expense.isShared ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{expense.description}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(expense.date).toLocaleDateString()} • {expense.category}
                    {expense.isShared && <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">(Shared)</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  {currency}{expense.amount.toFixed(2)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(expense)} className="text-slate-400 hover:text-blue-500 transition">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => onDelete(expense.id)} className="text-slate-400 hover:text-red-500 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {expenses.length === 0 && <p className="text-center text-slate-400 dark:text-slate-500 py-4">No recent activity.</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
