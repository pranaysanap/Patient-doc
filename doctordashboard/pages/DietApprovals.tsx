
import React, { useState, useMemo } from 'react';
import { Utensils, Check, X, Info, Apple, Flame, Loader2, Edit3, Eye, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { HistoryEvent } from '../types';

interface DietProps {
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onAddHistory: (patientId: string, event: Omit<HistoryEvent, 'id' | 'date'>) => void;
}

interface DietPlan {
  id: string;
  patient: string;
  patientId: string;
  goal: string;
  calories: number;
  macros: { carb: number; prot: number; fat: number };
  status: 'Pending' | 'Modification Requested' | 'Approved';
  submitted: string;
}

const DietApprovals: React.FC<DietProps> = ({ notify, onAddHistory }) => {
  const [plans, setPlans] = useState<DietPlan[]>([
    { id: '1', patient: 'Isha Patel', patientId: '3', goal: 'Anti-Inflammatory', calories: 1850, macros: { carb: 40, prot: 30, fat: 30 }, status: 'Pending', submitted: '3 hours ago' },
    { id: '2', patient: 'Rajesh Malhotra', patientId: '2', goal: 'Low Glycemic Index', calories: 2100, macros: { carb: 30, prot: 40, fat: 30 }, status: 'Pending', submitted: 'Yesterday' },
    { id: '3', patient: 'Ananya Sharma', patientId: '1', goal: 'DASH Diet', calories: 1600, macros: { carb: 50, prot: 20, fat: 30 }, status: 'Pending', submitted: '5 hours ago' }
  ]);
  
  const [approvedPlans, setApprovedPlans] = useState<DietPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved'>('Pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewingMenu, setViewingMenu] = useState<DietPlan | null>(null);

  const handleAction = (plan: DietPlan, actionType: 'approve' | 'reject' | 'modify') => {
    setProcessingId(plan.id);
    
    setTimeout(() => {
      if (actionType === 'approve') {
        const approvedPlan = { ...plan, status: 'Approved' as const };
        setApprovedPlans(prev => [approvedPlan, ...prev]);
        setPlans(prev => prev.filter(p => p.id !== plan.id));
        
        onAddHistory(plan.patientId, {
          type: 'diet',
          title: "Nutrition Plan Approved",
          description: `Doctor approved the "${plan.goal}" nutrition strategy.`,
        });
        notify(`Diet plan for ${plan.patient} approved.`, 'success');
      } 
      else if (actionType === 'modify') {
        setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'Modification Requested' } : p));
        onAddHistory(plan.patientId, {
          type: 'diet',
          title: "Modification Requested",
          description: `Doctor requested changes for "${plan.goal}" diet plan.`,
        });
        notify(`Modification request sent to ${plan.patient}.`, 'info');
      }
      else if (actionType === 'reject') {
        setPlans(prev => prev.filter(p => p.id !== plan.id));
        onAddHistory(plan.patientId, {
          type: 'diet',
          title: "Diet Plan Rejected",
          description: `Doctor rejected the "${plan.goal}" plan.`,
        });
        notify(`Diet plan for ${plan.patient} rejected.`, 'error');
      }

      setProcessingId(null);
    }, 400);
  };

  const MOCK_MENU = [
    { meal: 'Breakfast', items: 'Oatmeal with blueberries and walnuts', cals: 350 },
    { meal: 'Lunch', items: 'Grilled salmon with quinoa and steamed broccoli', cals: 550 },
    { meal: 'Snack', items: 'Greek yogurt with flaxseeds', cals: 200 },
    { meal: 'Dinner', items: 'Roasted chicken breast with sweet potato and kale', cals: 500 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Diet Review Hub</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Review, modify, or approve patient nutrition strategies</p>
        </div>
        
        <div className="flex bg-white dark:bg-[#141b2d] rounded-xl p-1 border border-gray-100 dark:border-white/5 shadow-sm">
          <button 
            onClick={() => setActiveTab('Pending')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'Pending' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:text-emerald-500'}`}
          >
            Pending Review
            {plans.length > 0 && <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{plans.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('Approved')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'Approved' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:text-emerald-500'}`}
          >
            Approved History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {(activeTab === 'Pending' ? plans : approvedPlans).length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white dark:bg-[#141b2d] rounded-3xl border border-dashed border-gray-200 dark:border-white/5 text-gray-500">
            <Utensils size={48} className="mb-4 opacity-10" />
            <p className="font-bold">No {activeTab.toLowerCase()} plans</p>
            <p className="text-sm">Queue is currently clear.</p>
          </div>
        ) : (
          (activeTab === 'Pending' ? plans : approvedPlans).map((plan) => (
            <div 
              key={plan.id} 
              className={`bg-white dark:bg-[#141b2d] rounded-2xl border border-gray-100 dark:border-white/5 p-8 flex flex-col md:flex-row gap-8 transition-all duration-300 relative overflow-hidden
                ${processingId === plan.id ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                ${plan.status === 'Approved' ? 'border-emerald-500/20' : ''}`}
            >
              {plan.status === 'Modification Requested' && (
                <div className="absolute top-0 left-0 right-0 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-[10px] font-black text-center py-1 border-b border-yellow-500/10 uppercase tracking-widest">
                  Awaiting Modification Response
                </div>
              )}

              <div className="flex-1 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.patient}</h3>
                    <p className="text-emerald-500 font-bold text-sm">{plan.goal} Strategy</p>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase flex items-center gap-1.5">
                    <Clock size={12} /> {plan.submitted}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1 tracking-wider">Cals</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1"><Flame size={14} className="text-orange-500" /> {plan.calories}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl col-span-2 border border-gray-100 dark:border-white/5">
                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1 tracking-wider">Macronutrient Split</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">P: {plan.macros.prot}% | C: {plan.macros.carb}% | F: {plan.macros.fat}%</p>
                  </div>
                </div>

                {activeTab === 'Pending' ? (
                  <div className="flex gap-2">
                    <button 
                      disabled={!!processingId}
                      onClick={() => handleAction(plan, 'approve')}
                      className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                    >
                      {processingId === plan.id ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Approve</>}
                    </button>
                    <button 
                      disabled={!!processingId || plan.status === 'Modification Requested'}
                      onClick={() => handleAction(plan, 'modify')}
                      className={`flex-1 border border-gray-200 dark:border-white/10 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 
                        ${plan.status === 'Modification Requested' ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      <Edit3 size={16} /> Modify
                    </button>
                    <button 
                      disabled={!!processingId}
                      onClick={() => handleAction(plan, 'reject')}
                      className="p-2.5 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold">Plan Active & Monitoring Adherence</span>
                  </div>
                )}
              </div>

              <div className="w-full md:w-56 bg-gray-50 dark:bg-white/5 p-5 rounded-xl space-y-4 border border-gray-100 dark:border-white/5">
                 <h4 className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-1.5"><Apple size={14} /> Clinical Review</h4>
                 <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed italic">
                   {plan.goal === 'Anti-Inflammatory' ? "Metrics suggest higher Omega-3 focus needed." : "Optimized for glycemic stability based on current A1C."}
                 </p>
                 <button 
                  onClick={() => setViewingMenu(plan)}
                  className="w-full py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-bold text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                 >
                   <Eye size={12} /> View Full Menu
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Menu Modal */}
      {viewingMenu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setViewingMenu(null)}></div>
          <div className="relative bg-white dark:bg-[#141b2d] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-emerald-500 text-white">
              <div>
                <h3 className="text-xl font-bold">Daily Menu Breakdown</h3>
                <p className="text-xs text-white/80 font-medium">{viewingMenu.patient} • {viewingMenu.goal}</p>
              </div>
              <button onClick={() => setViewingMenu(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Target Calories</p>
                  <p className="text-2xl font-bold text-emerald-500">{viewingMenu.calories} kcal</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-2xl font-bold text-blue-500">{viewingMenu.status}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest flex items-center gap-2">
                  <Utensils size={14} /> Standard Meal Plan
                </h4>
                <div className="space-y-3">
                  {MOCK_MENU.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-emerald-500/20 transition-all">
                      <div>
                        <p className="text-xs font-bold text-emerald-500">{m.meal}</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{m.items}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-gray-900 dark:text-white">{m.cals} cal</p>
                        <ChevronRight size={14} className="text-gray-400 inline ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                 <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium italic">
                   Note: This menu is dynamically adjusted based on the patient's real-time glycemic and inflammatory vitals.
                 </p>
              </div>
            </div>

            <div className="p-8 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
              <button 
                onClick={() => setViewingMenu(null)}
                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietApprovals;
