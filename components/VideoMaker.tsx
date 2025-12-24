
import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, Volume2, Loader2, Download, LogOut, RefreshCcw, Sparkles, 
  Music, Mic, Layers, PlayCircle, CheckCircle, Video, Trash2, 
  Image as ImageIcon, Upload, Play, Pause, AlertCircle, ChevronRight,
  MonitorPlay, Zap, Bookmark, FastForward
} from 'lucide-react';
import { renderSlideshowVideo } from '../services/videoRenderService';
import { saveVideo } from '../services/storageService';
import { SharedProductData, ScriptScene } from '../types';

interface Props {
  sharedData: SharedProductData;
  setSharedData: React.Dispatch<React.SetStateAction<SharedProductData>>;
  onReset: () => void;
  onViewLibrary: () => void;
}

export const VideoMaker: React.FC<Props> = ({ sharedData, setSharedData, onReset, onViewLibrary }) => {
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.25); // Tăng nhạc nền mặc định
  const [previewIdx, setPreviewIdx] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewTimer = useRef<number | null>(null);
  const audioPreviewRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
      stopPreviewAudio();
    };
  }, []);

  const stopPreviewAudio = () => {
    if (audioPreviewRef.current) {
      try { audioPreviewRef.current.stop(); } catch(e) {}
      audioPreviewRef.current = null;
    }
  };

  const playSceneAudio = async (idx: number): Promise<number> => {
    stopPreviewAudio();
    const scene = sharedData.script?.scenes[idx];
    if (!scene?.audioPcm) return 2200; // TikTok ads mặc định nhanh

    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      
      const binaryString = atob(scene.audioPcm);
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
      audioPreviewRef.current = source;
      
      return Math.max(buffer.duration * 1000, 1800); // Tối thiểu 1.8s
    } catch (e) {
      return 2200;
    }
  };

  const startAutoPreview = async (startIdx: number) => {
    setPreviewIdx(startIdx);
    const duration = await playSceneAudio(startIdx);
    
    previewTimer.current = window.setTimeout(() => {
      const nextIdx = (startIdx + 1) % (sharedData.script?.scenes.length || 1);
      if (nextIdx === 0) {
        setIsPlayingPreview(false);
      } else {
        startAutoPreview(nextIdx);
      }
    }, duration + 50); // Nghỉ siêu ít để tạo nhịp nhanh
  };

  const handleTogglePreview = () => {
    if (isPlayingPreview) {
      if (previewTimer.current) clearTimeout(previewTimer.current);
      setIsPlayingPreview(false);
      stopPreviewAudio();
    } else {
      setIsPlayingPreview(true);
      startAutoPreview(previewIdx);
    }
  };

  const handleRender = async () => {
    if (!sharedData.script) return;
    setIsRendering(true);
    setProgress(0);
    setVideoUrl(null);
    setVideoBlob(null);
    setHasSaved(false);
    if (isPlayingPreview) handleTogglePreview();

    const assets = sharedData.script.scenes.map(s => ({
      type: s.mediaType, 
      url: s.mediaType === 'video' ? (s.videoUrl || '') : (s.generatedImage || sharedData.originalImages[0]),
      audioPcm: s.audioPcm 
    }));

    try {
      const musicToUse = sharedData.musicPcm 
        ? `data:audio/pcm;base64,${sharedData.musicPcm}` 
        : 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3';

      const blob = await renderSlideshowVideo(
        assets, musicToUse, musicVolume, (p) => setProgress(Math.round(p * 100))
      );
      if (blob) {
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.error("Lỗi Render:", err);
      alert("Lỗi xuất video đồng bộ. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setIsRendering(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!videoBlob) return;
    setIsSaving(true);
    try {
      await saveVideo({
        id: crypto.randomUUID(),
        name: sharedData.name || 'TikTok Ad',
        blob: videoBlob,
        timestamp: Date.now(),
        thumbnail: sharedData.script?.scenes[0].generatedImage || sharedData.originalImages[0]
      });
      setHasSaved(true);
    } catch (e) {
      alert("Lỗi khi lưu video.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentScene = sharedData.script?.scenes[previewIdx];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-black mb-2 flex items-center gap-3"><FastForward className="w-10 h-10 text-orange-500 fill-current" /> Fast Motion Engine</h2>
            <p className="text-slate-400 font-medium">Hệ thống xử lý video đồng bộ HD, nhịp độ cao giúp giữ chân người xem.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={onViewLibrary} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-orange-400 font-bold hover:bg-white/10 transition-all flex items-center gap-2">
              <Bookmark className="w-4 h-4" /> Thư viện
            </button>
            <button onClick={onReset} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-300 font-bold hover:bg-white/10 transition-all flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border space-y-8 max-h-[900px] flex flex-col">
            <div className="flex justify-between items-center">
               <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Layers className="w-4 h-4 text-orange-500" /> TIMELINE ĐỒNG BỘ
               </h4>
               <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black">
                 <Zap className="w-3 h-3" /> NHỊP ĐỘ: CỰC NHANH
               </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {sharedData.script?.scenes.map((scene, idx) => (
                  <div 
                    key={idx} 
                    className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${
                      previewIdx === idx ? 'bg-orange-50 border-orange-300 ring-4 ring-orange-100' : 'bg-slate-50 border-slate-100'
                    }`}
                    onClick={() => { setPreviewIdx(idx); stopPreviewAudio(); if(previewTimer.current) clearTimeout(previewTimer.current); setIsPlayingPreview(false); playSceneAudio(idx); }}
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-28 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0 relative shadow-sm">
                        {scene.mediaType === 'video' && scene.videoUrl ? (
                          <video src={scene.videoUrl} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={scene.generatedImage || sharedData.originalImages[0]} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                        <div className="text-[9px] font-black text-slate-400 mb-1 uppercase">SCENE {idx + 1}</div>
                        <p className="text-[11px] text-slate-900 font-bold leading-relaxed line-clamp-3 italic">
                          "{scene.audio}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-6 border-t space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-600" /> NHẠC NỀN
                  </span>
                  <span className="text-xs font-black text-purple-600">{Math.round(musicVolume * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="0.5" step="0.01" 
                  value={musicVolume} 
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))} 
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-purple-600" 
                />
              </div>

              <button 
                onClick={handleRender} 
                disabled={isRendering || !sharedData.script?.scenes[0]?.audioPcm} 
                className="w-full py-6 bg-orange-600 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-orange-700 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
              >
                {isRendering ? <Loader2 className="animate-spin w-6 h-6" /> : <MonitorPlay className="w-6 h-6" />}
                {isRendering ? `ĐANG XUẤT VIDEO... ${progress}%` : 'XUẤT VIDEO FAST-MOTION'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
           <div className="bg-slate-950 rounded-[3.5rem] aspect-[9/16] max-h-[850px] mx-auto overflow-hidden shadow-2xl relative border-[12px] border-slate-900 flex flex-col">
              {videoUrl ? (
                <video src={videoUrl} controls autoPlay className="w-full h-full object-contain bg-black" />
              ) : (
                <div className="relative w-full h-full flex flex-col bg-black">
                   {isRendering ? (
                      <div className="m-auto text-center z-20">
                         <div className="w-24 h-24 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <Film className="w-10 h-10 text-orange-500 animate-pulse" />
                         </div>
                         <p className="text-white font-black text-2xl mb-1">Rendering HD...</p>
                         <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{progress}% COMPLETE</p>
                      </div>
                   ) : (
                      <>
                        {currentScene?.mediaType === 'video' && currentScene.videoUrl ? (
                          <video key={currentScene.videoUrl} src={currentScene.videoUrl} className="w-full h-full object-cover" autoPlay muted loop />
                        ) : (
                          <div className="w-full h-full overflow-hidden relative">
                            <img 
                              key={currentScene?.generatedImage || 'default'} 
                              src={currentScene?.generatedImage || sharedData.originalImages[0]} 
                              className={`w-full h-full object-cover transition-transform duration-1000 ${isPlayingPreview ? 'scale-110' : 'scale-100'}`} 
                            />
                            {/* Flash effect khi đổi cảnh */}
                            {isPlayingPreview && (
                               <div className="absolute inset-0 bg-white/20 animate-flash pointer-events-none"></div>
                            )}
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 pointer-events-none"></div>

                        <div className="absolute top-10 left-0 right-0 px-10 flex gap-1">
                           {sharedData.script?.scenes.map((_, i) => (
                             <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= previewIdx ? 'bg-white shadow-[0_0_10px_white]' : 'bg-white/20'}`}></div>
                           ))}
                        </div>

                        <div className="absolute bottom-32 left-0 right-0 px-10 text-center">
                           <div className="bg-black/50 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                             <p className="text-white font-black text-lg italic leading-relaxed">
                               "{currentScene?.audio}"
                             </p>
                           </div>
                        </div>

                        <div className="absolute bottom-10 left-0 right-0 px-10 flex justify-between items-center">
                           <button 
                             onClick={handleTogglePreview} 
                             className="p-6 bg-white rounded-full text-slate-900 shadow-2xl hover:scale-110 active:scale-95 transition-all"
                           >
                             {isPlayingPreview ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                           </button>
                           <div className="bg-black/60 backdrop-blur px-5 py-3 rounded-2xl text-white font-black text-[10px] tracking-widest border border-white/10 uppercase flex items-center gap-2">
                             <Zap className="w-3 h-3 text-orange-400 fill-current" /> AUTO-SYNC MODE
                           </div>
                        </div>
                      </>
                   )}
                </div>
              )}
           </div>

           {videoUrl && (
             <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <a 
                    href={videoUrl} 
                    download={`tik-tok-ads-${sharedData.name}.mp4`} 
                    className="flex-1 flex items-center justify-center gap-3 py-6 bg-green-600 text-white rounded-[2.5rem] font-black text-lg shadow-2xl hover:bg-green-700 transition-all hover:scale-[1.02]"
                  >
                    <Download className="w-6 h-6" /> TẢI VIDEO 1080P
                  </a>
                  <button 
                    onClick={handleSaveToLibrary}
                    disabled={isSaving || hasSaved}
                    className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-[2.5rem] font-black text-lg shadow-2xl transition-all ${
                      hasSaved ? 'bg-orange-100 text-orange-600 cursor-default' : 'bg-orange-600 text-white hover:bg-orange-700 hover:scale-[1.02]'
                    }`}
                  >
                    {isSaving ? <Loader2 className="animate-spin w-6 h-6" /> : hasSaved ? <CheckCircle className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                    {hasSaved ? 'ĐÃ LƯU THƯ VIỆN' : 'LƯU VÀO THƯ VIỆN'}
                  </button>
                </div>
             </div>
           )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @keyframes flash {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash { animation: flash 0.3s ease-out; }
      `}</style>
    </div>
  );
};
