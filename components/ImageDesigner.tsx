import React, { useState, useRef } from 'react';
import { ImagePlus, Layers, Plus, X, ArrowRight, Link as LinkIcon, ShoppingBag, Sparkles, Loader2, CheckCircle, Download, Camera, UserCheck } from 'lucide-react';
import { SharedProductData } from '../types';
import { generateProductVariations } from '../services/geminiService';

interface Props {
  sharedData: SharedProductData;
  setSharedData: React.Dispatch<React.SetStateAction<SharedProductData>>;
  onNextStep: () => void;
}

const DESIGN_PROMPTS = [
  "Studio shot: Product centered, elegant model's hand holding it, premium lighting",
  "Lifestyle: A stylish person using the product in a high-end apartment, natural sunlight",
  "Macro shot: Close-up on product details with a model's face partially blurred background",
  "Action shot: The product being used by a person, dynamic movement, vibrant colors"
];

export const ImageDesigner: React.FC<Props> = ({ sharedData, setSharedData, onNextStep }) => {
  const [productLink, setProductLink] = useState(sharedData.productLink || '');
  const [isDesigning, setIsDesigning] = useState(false);
  const [designProgress, setDesignProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSharedData(prev => ({ ...prev, originalImages: [reader.result as string] }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleAutoDesign = async () => {
    if (sharedData.originalImages.length === 0) return;
    setIsDesigning(true);
    setDesignProgress(0);
    const originalBase64 = sharedData.originalImages[0].split(',')[1];
    const generatedImages: string[] = [];

    try {
      for (let i = 0; i < DESIGN_PROMPTS.length; i++) {
        const result = await generateProductVariations(originalBase64, DESIGN_PROMPTS[i]);
        if (result) generatedImages.push(result);
        setDesignProgress(((i + 1) / DESIGN_PROMPTS.length) * 100);
      }
      setSharedData(prev => ({ ...prev, designImages: generatedImages }));
    } catch (error) {
      alert("Lỗi khi thiết kế ảnh AI.");
    } finally {
      setIsDesigning(false);
    }
  };

  const downloadImage = (base64: string, index: number) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `shopee-design-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10"><UserCheck className="w-40 h-40" /></div>
        <h2 className="text-3xl font-black mb-4 flex items-center gap-3"><Layers className="w-8 h-8 text-purple-300" /> Bước 2: Thiết Kế Ảnh Chuyên Gia AI</h2>
        <p className="text-purple-100 opacity-90 max-w-2xl">Lồng ghép người mẫu và bối cảnh thực tế vào ảnh sản phẩm của bạn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest"><LinkIcon className="w-3 h-3 inline mr-1" /> Link Shopee</label>
              <input type="text" className="w-full p-4 border rounded-2xl outline-none text-sm font-bold bg-slate-50/50" value={productLink} onChange={(e) => setProductLink(e.target.value)} placeholder="Dán link sản phẩm..." />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest"><ShoppingBag className="w-3 h-3 inline mr-1" /> Tên Sản Phẩm</label>
              <input type="text" className="w-full p-4 border rounded-2xl outline-none text-sm font-bold bg-slate-50/50" value={sharedData.name} onChange={(e) => setSharedData(prev => ({...prev, name: e.target.value}))} />
            </div>
            <div className="pt-4 border-t space-y-4">
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 rounded-xl font-black text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-2 transition-all"><ImagePlus className="w-5 h-5" /> TẢI ẢNH GỐC</button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              <button onClick={handleAutoDesign} disabled={sharedData.originalImages.length === 0 || isDesigning} className={`w-full py-5 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-lg ${isDesigning ? 'bg-slate-300' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 transition-all'}`}>
                {isDesigning ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                {isDesigning ? `ĐANG THIẾT KẾ... ${Math.round(designProgress)}%` : 'THÊM NGƯỜI MẪU AI'}
              </button>
            </div>
            {sharedData.designImages.length > 0 && (
              <button onClick={() => onNextStep()} className="w-full py-4 rounded-xl font-black text-white bg-slate-900 hover:bg-black flex items-center justify-center gap-2 transition-all">TIẾP TỤC BƯỚC 3 <ArrowRight className="w-5 h-5" /></button>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 min-h-[500px]">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-8">Preview Design (Commercial Style)</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6 place-items-center">
              {isDesigning ? Array(4).fill(0).map((_, i) => <div key={i} className="w-full aspect-square bg-slate-100 rounded-3xl animate-pulse" />) :
                sharedData.designImages.map((img, idx) => (
                  <div key={idx} className="relative w-full aspect-square rounded-3xl overflow-hidden border group shadow-sm hover:scale-[1.02] transition-transform">
                    <img src={img} className="w-full h-full object-cover" alt={`design-${idx}`} />
                    <button onClick={() => downloadImage(img, idx)} className="absolute top-4 right-4 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white text-slate-900"><Download className="w-4 h-4" /></button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};