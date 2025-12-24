
import React, { useState, useRef } from 'react';
import { SharedProductData, ScriptScene } from '../types';
import { generateVideoScript, generateAiVoice, generateSceneImage, generateAiBackgroundMusic } from '../services/geminiService';
import { 
  Loader2, Wand2, FileVideo, Mic, Sparkles, ArrowRight, 
  Image as ImageIcon, Music, AlertCircle, Video, CheckCircle, 
  Trash2, Play, Download, RefreshCw, Volume2, Edit3 
} from 'lucide-react';

interface Props {
  sharedData: SharedProductData;
  setSharedData: React.Dispatch<React.SetStateAction<SharedProductData>>;
  onNextStep: () => void;
  onResetProduct: () => void;
}

export const ScriptBuilder: React.FC<Props> = ({ sharedData, setSharedData, onNextStep, onResetProduct }) => {
  const [loading, setLoading] = useState(false);
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [generatingMusic, setGeneratingMusic] = useState(false);
  const [generatingSceneIdx, setGeneratingSceneIdx] = useState<number | null>(null);
  const [generatingVoiceIdx, setGeneratingVoiceIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const handleGenerateScript = async () => {
    setLoading(true);
    setError(null);
    try {
      const script = await generateVideoScript(sharedData.name, sharedData.features, sharedData.productLink, sharedData.originalImages[0]?.split(',')[1]);
      if (script) setSharedData(prev => ({ ...prev, script }));
      else setError("AI gặp lỗi khi viết kịch bản. Hãy thử lại.");
    } catch (err) { setError("Lỗi kết nối AI Service."); }
    finally { setLoading(false); }
  };

  const generateSingleVoice = async (idx: number) => {
    if (!sharedData.script) return;
    setGeneratingVoiceIdx(idx);
    try {
      const text = sharedData.script.scenes[idx].audio;
      const pcm = await generateAiVoice(text);
      if (pcm) {
        const newScenes = [...sharedData.script.scenes];
        newScenes[idx] = { ...newScenes[idx], audioPcm: pcm };
        setSharedData(prev => ({
          ...prev,
          script: { ...prev.script!, scenes: newScenes }
        }));
      }
    } catch (err) {
      console.error("Lỗi tạo giọng đọc:", err);
    } finally {
      setGeneratingVoiceIdx(null);
    }
  };

  const playPcm = async (pcmBase64: string) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      const binaryString = atob(pcmBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) { console.error("Audio playback error", e); }
  };

  const handleCreateAllVoicesAndMusic = async () => {
    if (!sharedData.script) return;
    setGeneratingVoice(true);
    setGeneratingMusic(true);
    try {
      const scenes = [...sharedData.script.scenes];
      const voicePromises = scenes.map(scene => generateAiVoice(scene.audio));
      const musicPromise = generateAiBackgroundMusic(sharedData.script.musicGenre);
      const [voices, music] = await Promise.all([Promise.all(voicePromises), musicPromise]);
      const updatedScenes = scenes.map((scene, i) => ({ ...scene, audioPcm: voices[i] || undefined }));
      setSharedData(prev => ({ ...prev, script: { ...prev.script!, scenes: updatedScenes }, musicPcm: music }));
    } catch (err) { console.error("Global sound generation error", err); }
    finally { setGeneratingVoice(false); setGeneratingMusic(false); }
  };

  const generateSceneImg = async (idx: number) => {
    if (!sharedData.originalImages[0] || !sharedData.script) return;
    setGeneratingSceneIdx(idx);
    const img = await generateSceneImage(sharedData.script.scenes[idx].imagePrompt, sharedData.originalImages[0].split(',')[1]);
    if (img) {
      const newScenes = [...sharedData.script.scenes];
      newScenes[idx] = { ...newScenes[idx], generatedImage: img, mediaType: 'image', videoUrl: undefined };
      setSharedData(prev => ({ ...prev, script: { ...prev.script!, scenes: newScenes } }));
    }
    setGeneratingSceneIdx(null);
  };

  const handleVideoUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && sharedData.script) {
      const url = URL.createObjectURL(file);
      const newScenes = [...sharedData.script.scenes];
      newScenes[idx] = { ...newScenes[idx], videoUrl: url, mediaType: 'video' };
      setSharedData(prev => ({ ...prev, script: { ...prev.script!, scenes: newScenes } }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-gradient-to-r from-orange-600 to-rose-700 rounded-[2.5rem] p-10 text-white shadow-xl">
        <h2 className="text-3xl font-black mb-4 flex items-center gap-3"><FileVideo className="w-8 h-8" /> Bước 3: Biên Tập Sound & Visual</h2>
        <p className="opacity-90">Chỉnh sửa text thoại trực tiếp và bấm "Tạo Giọng AI" cho từng cảnh để hoàn thiện video.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6 sticky top-8">
            <button onClick={handleGenerateScript} disabled={loading} className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 hover:bg-orange-700 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : <Wand2 className="w-5 h-5" />} VIẾT LẠI KỊCH BẢN AI
            </button>
            {sharedData.script && (
              <button onClick={handleCreateAllVoicesAndMusic} disabled={generatingVoice || generatingMusic} className="w-full py-5 border-2 border-purple-600 text-purple-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-purple-50 transition-all">
                {(generatingVoice || generatingMusic) ? <Loader2 className="animate-spin" /> : <Music className="w-5 h-5" />} 
                {sharedData.script.scenes[0].audioPcm ? 'LÀM MỚI TẤT CẢ SOUND' : 'TỰ ĐỘNG TẠO SOUND'}
              </button>
            )}
            <div className="pt-4 border-t space-y-2">
              <div className={`flex items-center gap-2 text-xs font-bold ${sharedData.script?.scenes.every(s => s.audioPcm) ? 'text-green-600' : 'text-slate-400'}`}>
                <CheckCircle className="w-4 h-4" /> Voiceover: {sharedData.script?.scenes.filter(s => s.audioPcm).length || 0}/{sharedData.script?.scenes.length || 0} cảnh đã khớp
              </div>
              <div className={`flex items-center gap-2 text-xs font-bold ${sharedData.musicPcm ? 'text-green-600' : 'text-slate-400'}`}>
                <CheckCircle className="w-4 h-4" /> Nhạc nền: {sharedData.musicPcm ? 'Đã sẵn sàng' : 'Chưa có'}
              </div>
            </div>
            <button onClick={onNextStep} disabled={!sharedData.script?.scenes.some(s => s.audioPcm)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 shadow-xl">DỰNG VIDEO ADS <ArrowRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {sharedData.script ? (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border">
               <h3 className="text-2xl font-black text-slate-900 mb-8 border-b pb-4 flex items-center gap-2">
                 <Sparkles className="text-orange-500 w-6 h-6" /> Kịch bản Studio: {sharedData.script.title}
               </h3>
               <div className="space-y-8">
                  {sharedData.script.scenes.map((scene, idx) => (
                    <div key={idx} className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-orange-300 transition-all">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-40 aspect-[9/16] bg-slate-200 rounded-2xl overflow-hidden flex-shrink-0 relative group-hover:ring-4 ring-orange-100 transition-all">
                          {scene.mediaType === 'video' && scene.videoUrl ? (
                            <video src={scene.videoUrl} className="w-full h-full object-cover" muted loop autoPlay />
                          ) : (
                            <img src={scene.generatedImage || sharedData.originalImages[0]} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col gap-2 items-center justify-center transition-all p-3">
                            <button onClick={() => generateSceneImg(idx)} disabled={generatingSceneIdx === idx} className="w-full py-2.5 bg-white text-orange-600 text-[10px] font-black rounded-xl flex items-center justify-center gap-1 shadow-lg">
                              {generatingSceneIdx === idx ? <Loader2 className="animate-spin w-3 h-3" /> : <Sparkles className="w-3 h-3" />} ẢNH AI
                            </button>
                            <button onClick={() => videoInputRefs.current[idx]?.click()} className="w-full py-2.5 bg-orange-600 text-white text-[10px] font-black rounded-xl flex items-center justify-center gap-1 shadow-lg"><Video className="w-3 h-3" /> CLIP</button>
                            <input type="file" ref={el => videoInputRefs.current[idx] = el} className="hidden" accept="video/*" onChange={(e) => handleVideoUpload(idx, e)} />
                          </div>
                        </div>
                        <div className="flex-1 space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-4 py-1 rounded-full uppercase">CẢNH {idx+1}</span>
                               <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-4 py-1 rounded-full">{scene.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                               {scene.audioPcm && (
                                 <button onClick={() => playPcm(scene.audioPcm!)} className="p-2.5 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all shadow-sm" title="Nghe thử"><Play className="w-4 h-4 fill-current" /></button>
                               )}
                               <button 
                                 onClick={() => generateSingleVoice(idx)} 
                                 disabled={generatingVoiceIdx === idx}
                                 className={`p-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 font-black text-[10px] ${scene.audioPcm ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                               >
                                 {generatingVoiceIdx === idx ? <Loader2 className="animate-spin w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                 {scene.audioPcm ? 'TẠO LẠI VOICE' : 'TẠO GIỌNG AI'}
                               </button>
                            </div>
                          </div>
                          <div className="p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm relative overflow-hidden ring-1 ring-slate-50">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500"></div>
                            <label className="text-[10px] font-black text-orange-600 uppercase mb-2 block flex items-center gap-1.5"><Edit3 className="w-3 h-3" /> Lời thoại Ad (Bạn có thể sửa):</label>
                            <textarea 
                              className="w-full p-0 border-none outline-none text-slate-900 font-bold leading-relaxed bg-transparent resize-none focus:ring-0"
                              value={scene.audio}
                              rows={3}
                              onChange={(e) => {
                                const newScenes = [...sharedData.script!.scenes];
                                newScenes[idx].audio = e.target.value;
                                setSharedData(prev => ({ ...prev, script: { ...prev.script!, scenes: newScenes } }));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <div className="h-[500px] bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12">
              <Sparkles className="w-16 h-16 text-slate-200 mb-6" />
              <h4 className="text-slate-400 font-black text-xl mb-2 uppercase tracking-widest">Kịch bản chưa sẵn sàng</h4>
              <p className="text-slate-400 max-w-xs mx-auto text-sm">Bấm "VIẾT LẠI KỊCH BẢN AI" để bắt đầu sáng tạo nội dung ads chất lượng cao.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
