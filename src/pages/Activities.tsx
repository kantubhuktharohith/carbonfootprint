import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Download,
  Trash2,
  Edit2,
  Search,
  Zap,
  Car,
  UtensilsCrossed,
  Trash,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory, ActivityRecord } from '../types';
import { exportActivitiesToCSV } from '../lib/reporting';

export const Activities: React.FC = () => {
  const { activities, deleteActivity, editActivity } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<ActivityRecord | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchCat = categoryFilter === 'all' || act.category === categoryFilter;
      const matchQuery =
        searchQuery === '' ||
        (act.notes && act.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        act.activity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.activity_date.includes(searchQuery);
      return matchCat && matchQuery;
    });
  }, [activities, categoryFilter, searchQuery]);

  const categoryIcons: Record<ActivityCategory, React.ReactNode> = {
    electricity: <Zap className="w-3.5 h-3.5 text-emerald-700" />,
    transportation: <Car className="w-3.5 h-3.5 text-sky-700" />,
    food: <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />,
    waste: <Trash className="w-3.5 h-3.5 text-purple-700" />,
  };

  const categoryBadges: Record<ActivityCategory, { bg: string; text: string; label: string }> = {
    electricity: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'Electricity' },
    transportation: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800', label: 'Transport' },
    food: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Food' },
    waste: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800', label: 'Waste' },
  };

  const handleDelete = async (id: string) => {
    await deleteActivity(id);
    setDeleteConfirmId(null);
    setToastMessage('Activity record deleted successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartEdit = (act: ActivityRecord) => {
    setEditingActivity(act);
    setEditNotes(act.notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editingActivity) return;
    await editActivity({
      ...editingActivity,
      notes: editNotes,
    });
    setEditingActivity(null);
    setToastMessage('Activity notes updated successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#166534] text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Activity History & Records
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Complete audit trail of consumption records with verified emission factors
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportActivitiesToCSV(filteredActivities)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/add-activity"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Activity</span>
          </Link>
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-[#10B981]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'electricity', label: 'Electricity ⚡' },
            { id: 'transportation', label: 'Transport 🚗' },
            { id: 'food', label: 'Food 🥗' },
            { id: 'waste', label: 'Waste 🗑️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === tab.id
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800">No matching activity records</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or category filters, or log a new activity.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Activity Description</th>
                  <th className="py-3.5 px-4 text-right">Quantity</th>
                  <th className="py-3.5 px-4">Emission Factor</th>
                  <th className="py-3.5 px-4 text-right">Calculated CO2e</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredActivities.map((act) => {
                  const badge = categoryBadges[act.category];
                  return (
                    <tr key={act.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 font-medium">
                        {act.activity_date}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text}`}
                        >
                          {categoryIcons[act.category]}
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 max-w-xs truncate">
                          {act.notes || act.activity_type.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-xs">
                          {act.activity_type.replace(/_/g, ' ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-gray-700 whitespace-nowrap">
                        {act.quantity.toLocaleString()} {act.unit}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-gray-700">
                          {act.factor_value_used} kg/{act.unit}
                        </div>
                        <div className="text-[10px] text-emerald-800 truncate max-w-[180px]">
                          {act.factor_source_name || 'Standard Registry'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-gray-900 text-sm">
                          {act.estimated_emissions.toLocaleString()} kg
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(act)}
                            className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit notes"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(act.id)}
                            className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete activity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Notes Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Edit Activity Notes</h3>
              <button
                onClick={() => setEditingActivity(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description / Location Note
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingActivity(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-base">Delete Activity Record?</h3>
              <p className="text-xs text-gray-500 mt-1">
                This will recalculate all category totals, dashboard charts, and reduction metrics.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
