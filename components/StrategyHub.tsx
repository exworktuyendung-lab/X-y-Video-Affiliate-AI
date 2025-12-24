import React, { useState } from 'react';
import { StrategyPlan } from '../types';
import { getStrategyPlan } from '../services/geminiService';
import { Target, CalendarCheck, ArrowRight, Loader2, Lightbulb } from 'lucide-react';

export const StrategyHub: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [plan, setPlan] = useState<StrategyPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreatePlan = async () => {
    if (!niche) return;
    setLoading(true);
    const result = await getStrategyPlan(niche);
    setPlan(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <Target className="w-8 h-8 text-teal-300" />
          Lộ Trình Xây Kênh Từ Số 0
        </h2>
        <p className="mb-6 text-teal-100 max-w-2xl">
          Đừng làm video ngẫu hứng! Hãy để AI thiết kế cho bạn một lộ trình 4 tuần rõ ràng để thu hút đúng tệp khách hàng và ra đơn.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
          <input 
            type="text" 
            placeholder="Nhập ngách của bạn (VD: Thời trang nữ, Đồ gia dụng...)"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-teal-300 shadow-inner"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
          <button 
            onClick={handleCreatePlan}
            disabled={loading || !niche}
            className="px-6 py-3 bg-teal-400 hover:bg-teal-300 text-teal-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
            Lập Kế Hoạch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plan.map((phase, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border-t-4 border-teal-500 p-6 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-gray-800">{phase.phase}</h3>
              <CalendarCheck className="w-6 h-6 text-teal-500 opacity-50" />
            </div>
            
            <div className="mb-4">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded uppercase tracking-wide">
                Trọng tâm
              </span>
              <p className="mt-2 text-gray-700 font-medium">{phase.focus}</p>
            </div>

            <div className="space-y-3">
              {phase.actions.map((action, aIdx) => (
                <div key={aIdx} className="flex items-start gap-2 text-sm text-gray-600">
                  <ArrowRight className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {plan.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">Hãy nhập ngách để xem lộ trình chi tiết.</p>
        </div>
      )}
    </div>
  );
};