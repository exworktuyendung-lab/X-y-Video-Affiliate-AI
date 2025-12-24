
import React, { useState, useEffect } from 'react';
import { TrendItem } from '../types';
import { getTrendingProducts } from '../services/geminiService';
import { TrendingUp, ShoppingBag, Loader2, RefreshCcw, ArrowRight, AlertCircle } from 'lucide-react';

interface Props {
  onSelectProduct: (name: string) => void;
}

export const TrendFinder: React.FC<Props> = ({ onSelectProduct }) => {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrendingProducts();
      if (data && data.length > 0) {
        setTrends(data);
      } else {
        setError("Không thể tải dữ liệu xu hướng. Vui lòng kiểm tra API Key hoặc kết nối mạng.");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi không xác định khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Bước 1: Săn Sản Phẩm Hot 🔥</h2>
          <p className="text-slate-500 max-w-xl">Khám phá những ngách sản phẩm đang có lượng tìm kiếm cao nhất để bắt đầu thiết kế video quảng cáo.</p>
        </div>
        <button 
          onClick={fetchTrends}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-sm font-bold shadow-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
          Làm mới dữ liệu
        </button>
      </div>

      {loading && trends.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <Loader2 className="w-16 h-16 animate-spin mb-6 text-orange-500" />
          <p className="font-bold text-slate-400">Đang quét thị trường Shopee & TikTok...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-80 bg-white rounded-[2.5rem] border border-red-100 shadow-sm p-10 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-lg font-black text-slate-900 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-slate-500 mb-6 max-w-md">{error}</p>
          <button 
            onClick={fetchTrends}
            className="px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all"
          >
            Thử lại ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {trends.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-orange-50 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">{item.category}</h3>
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl italic border-l-4 border-orange-500 leading-relaxed">
                  "{item.reason}"
                </p>

                <div className="space-y-3">
                  <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-4 h-4" /> Gợi ý sản phẩm cho bạn:
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {item.products.map((prod, pIdx) => (
                      <button 
                        key={pIdx} 
                        onClick={() => onSelectProduct(prod)}
                        className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl text-left hover:border-orange-300 hover:bg-orange-50/30 group/item transition-all shadow-sm"
                      >
                        <span className="font-bold text-slate-800">{prod}</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          CHỌN SP <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
