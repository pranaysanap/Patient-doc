
import React, { useState, useMemo } from 'react';
import { Search, Filter, MoreVertical, Heart, Wind, Moon, Thermometer, ArrowRight, X, Plus, User, Info, Check, ShieldCheck, Lock } from 'lucide-react';
import { RISK_COLORS } from '../constants';
import { Patient, RiskLevel } from '../types';

interface PatientsProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: (patient: Patient) => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const Patients: React.FC<PatientsProps> = ({ patients, onSelectPatient, onAddPatient, notify }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    condition: '',
    risk: 'low' as RiskLevel
  });

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.condition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'all' || p.risk === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [patients, searchTerm, riskFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.age || !newPatient.condition) {
      notify('Please fill in all required fields.', 'error');
      return;
    }

    const patientToAdd: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPatient.name,
      age: parseInt(newPatient.age),
      gender: newPatient.gender,
      risk: newPatient.risk,
      lastVisit: new Date().toISOString().split('T')[0],
      condition: newPatient.condition,
      vitals: {
        heartRate: 72 + Math.floor(Math.random() * 10),
        oxygen: 98,
        sleepScore: 85,
        stressLevel: 20
      },
      contact: '+91 00000-00000',
      allergies: [],
      image: `https://picsum.photos/seed/${newPatient.name}/200`
    };

    onAddPatient(patientToAdd);
    setIsAddModalOpen(false);
    setNewPatient({ name: '', age: '', gender: 'Male', condition: '', risk: 'low' });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Clinical Directory</h2>
          <p className="text-gray-400 text-sm">Managing {patients.length} active encrypted patient profiles</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or condition..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-[#141b2d] border border-gray-100 dark:border-white/5 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all w-64 text-sm"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all 
                ${showFilters ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-[#141b2d] border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10'}`}
            >
              <Filter size={18} />
              {riskFilter === 'all' ? 'Filters' : <span className="capitalize">{riskFilter} Risk</span>}
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#141b2d] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                <p className="px-3 py-2 text-[10px] font-black uppercase text-gray-500 tracking-widest">Risk Level</p>
                {(['all', 'low', 'medium', 'high', 'critical'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => {
                      setRiskFilter(level);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold capitalize transition-colors
                      ${riskFilter === level ? 'bg-emerald-500/10 text-emerald-500' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div 
            key={patient.id} 
            className="bg-white dark:bg-[#141b2d] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 hover:shadow-xl hover:border-emerald-500/30 transition-all cursor-pointer group"
            onClick={() => onSelectPatient(patient)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={patient.image} alt={patient.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/10" />
                <div>
                  <h3 className="font-bold text-lg group-hover:text-emerald-500 transition-colors">{patient.name}</h3>
                  <p className="text-xs text-gray-400">{patient.age} Yrs • {patient.gender}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${RISK_COLORS[patient.risk]}`}>
                {patient.risk} Risk
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest">Primary Condition</p>
                  <p className="text-sm font-semibold">{patient.condition}</p>
                </div>
                <Lock size={14} className="text-gray-300" />
              </div>

              {/* Masked Vital Data for Privacy */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center text-emerald-500/40">
                    <Heart size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Heart Rate</p>
                    <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-tighter italic flex items-center gap-1">Secure <ShieldCheck size={10} /></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center text-emerald-500/40">
                    <Wind size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">SpO2</p>
                    <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-tighter italic flex items-center gap-1">Secure <ShieldCheck size={10} /></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center text-emerald-500/40">
                    <Moon size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Sleep</p>
                    <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-tighter italic flex items-center gap-1">Secure <ShieldCheck size={10} /></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center text-emerald-500/40">
                    <Thermometer size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Stress</p>
                    <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-tighter italic flex items-center gap-1">Secure <ShieldCheck size={10} /></p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <p className="text-[10px] text-gray-400 italic">Last Sync: {patient.lastVisit}</p>
                <button className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 group-hover:gap-2.5 transition-all">
                  Open Chart
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all group active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <span className="font-semibold">Add New Patient</span>
        </button>
      </div>

      {/* Add Patient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#141b2d] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-emerald-500 text-white">
              <div>
                <h3 className="text-xl font-bold">Onboard New Patient</h3>
                <p className="text-xs text-white/80">Initialize VaidyaSetu encrypted monitoring</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name *</label>
                  <input 
                    required
                    type="text" 
                    value={newPatient.name}
                    onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                    placeholder="e.g. Rahul Verma"
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Age *</label>
                    <input 
                      required
                      type="number" 
                      value={newPatient.age}
                      onChange={e => setNewPatient({...newPatient, age: e.target.value})}
                      placeholder="e.g. 45"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                    <select 
                      value={newPatient.gender}
                      onChange={e => setNewPatient({...newPatient, gender: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primary Condition *</label>
                  <input 
                    required
                    type="text" 
                    value={newPatient.condition}
                    onChange={e => setNewPatient({...newPatient, condition: e.target.value})}
                    placeholder="e.g. Diabetic Retinopathy"
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Risk Level</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['low', 'medium', 'high', 'critical'] as RiskLevel[]).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewPatient({...newPatient, risk: r})}
                        className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border 
                          ${newPatient.risk === r 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : 'bg-transparent border-gray-100 dark:border-white/5 text-gray-500'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                >
                  Onboard & Lock Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
