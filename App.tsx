
import React, { useState, useEffect } from 'react';
import { AppView, SharedProductData } from './types';
import { TrendFinder } from './components/TrendFinder';
import { ScriptBuilder } from './components/ScriptBuilder';
import { StrategyHub } from './components/StrategyHub';
import { AffiliateGuide } from './components/AffiliateGuide';
import { ImageDesigner } from './components/ImageDesigner';
import { VideoMaker } from './components/VideoMaker';
import { VideoLibrary } from './components/VideoLibrary';
import { LayoutDashboard, TrendingUp, FileVideo, Map, ShieldCheck, Menu, ShoppingBag, Layers, Film, ArrowRight, CheckCircle, LogOut, AlertTriangle, Bookmark } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visitedViews, setVisitedViews] = useState<Set<AppView>>(new Set([AppView.DASHBOARD]));
  const [apiKeyError, setApiKeyError] = useState(false);
  
  const [sharedData, setSharedData] = useState<SharedProductData>({
    name: '',
    features: '',
    productLink: '',
    originalImages: [],
    designImages: [],
    script: null,
    audioPcm: null,
    musicPcm: null
  });

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyError(true);
    }
  }, []);

  const handleViewChange = (view: AppView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setVisitedViews(prev => {
      const newSet = new Set(prev);
      newSet.add(view);
      return newSet;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetProject = () => {
    if(confirm("Xác nhận Đăng xuất và Xóa dự án hiện tại? Mọi dữ liệu chưa lưu sẽ mất.")) {
      setSharedData({
        name: '',
        features: '',
        productLink: '',
        originalImages: [],
        designImages: [],
        script: null,
        audioPcm: null,
        musicPcm: null
      });
      setCurrentView(AppView.DASHBOARD);
      setVisitedViews(new Set([AppView.DASHBOARD]));
    }
  };

  const navItems = [
    { id: AppView.DASHBOARD, label: 'Tổng Quan', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: AppView.TRENDS, label: 'Bước 1: Săn Trend', icon: <TrendingUp className="w-5 h-5" /> },
    { id: AppView.IMAGE_DESIGN, label: 'Bước 2: Thiết Kế Ảnh', icon: <Layers className="w-5 h-5" /> },
    { id: AppView.SCRIPT, label: 'Bước 3: Viết Kịch Bản', icon: <FileVideo className="w-5 h-5" /> },
    { id: AppView.VIDEO_MAKER, label: 'Bước 4: Biên Tập & Xuất', icon: <Film className="w-5 h-5" /> },
    { id: AppView.GALLERY, label: 'Thư Viện Video', icon: <Bookmark className="w-5 h-5" /> },
  ];

  if (apiKeyError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center border border-red-100">
          <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-slate-900 mb-4">Thiếu API KEY</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Ứng dụng yêu cầu Google Gemini API Key để hoạt động. Vui lòng kiểm tra lại biến môi trường hoặc cấu hình hệ thống.
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl text-xs font-mono text-slate-600 break-all border border-slate-100">
            Error Code: MISSING_PROCESS_ENV_API_KEY
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {mobileMenuOpen && <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out shadow-lg md:shadow-none`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-xl text-white shadow-lg shadow-orange-100"><ShoppingBag className="w-6 h-6" /></div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">ShopeeMaster</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  currentView === item.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-100 space-y-2">
            <button onClick={resetProject} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"><LogOut className="w-5 h-5" /> Đăng xuất / Reset</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden bg-white border-b p-4 flex justify-between items-center shadow-sm">
           <div className="flex items-center gap-2 font-bold"><ShoppingBag className="w-6 h-6 text-orange-600" /> Shopee Master</div>
           <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"><Menu className="w-6 h-6" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto">
             {currentView === AppView.DASHBOARD && (
               <div className="bg-gradient-to-br from-slate-900 to-orange-950 rounded-[3rem] p-10 md:p-20 text-white shadow-2xl text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                  <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Xây Kênh Affiliate AI chuẩn <span className="text-orange-500">2025</span></h1>
                  <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">Quy trình AI đồng bộ từ tìm sản phẩm hot, thiết kế ảnh AI đến dựng video lồng tiếng chuyên nghiệp cho người mới bắt đầu.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => handleViewChange(AppView.TRENDS)} className="bg-orange-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl hover:bg-orange-500 transition-all hover:scale-105 active:scale-95 text-lg">BẮT ĐẦU NGAY</button>
                    <button onClick={() => handleViewChange(AppView.GALLERY)} className="bg-white/10 text-white border border-white/20 px-12 py-5 rounded-[2rem] font-black hover:bg-white/20 transition-all text-lg backdrop-blur-sm">THƯ VIỆN CỦA TÔI</button>
                  </div>
               </div>
             )}

             {currentView === AppView.TRENDS && <TrendFinder onSelectProduct={(name) => { setSharedData(prev => ({ ...prev, name })); handleViewChange(AppView.IMAGE_DESIGN); }} />}
             {currentView === AppView.IMAGE_DESIGN && <ImageDesigner sharedData={sharedData} setSharedData={setSharedData} onNextStep={() => handleViewChange(AppView.SCRIPT)} />}
             {currentView === AppView.SCRIPT && <ScriptBuilder sharedData={sharedData} setSharedData={setSharedData} onNextStep={() => handleViewChange(AppView.VIDEO_MAKER)} onResetProduct={() => handleViewChange(AppView.TRENDS)} />}
             {currentView === AppView.VIDEO_MAKER && <VideoMaker sharedData={sharedData} setSharedData={setSharedData} onReset={resetProject} onViewLibrary={() => handleViewChange(AppView.GALLERY)} />}
             {currentView === AppView.GALLERY && <VideoLibrary />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
