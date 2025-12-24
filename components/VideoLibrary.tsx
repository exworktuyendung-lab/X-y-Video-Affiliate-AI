
import React, { useState, useEffect } from 'react';
import { SavedVideo } from '../types';
import { getAllVideos, deleteVideo } from '../services/storageService';
import { Film, Download, Trash2, Calendar, PlayCircle, Eye, Loader2, VideoOff } from 'lucide-react';

export const VideoLibrary: React.FC = () => {
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await getAllVideos();
      setVideos(data.sort((a, b) => b.timestamp - a.timestamp));
    } catch (e) {
      console.error("Lỗi tải thư viện:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa video này khỏi thư viện?")) {
      await deleteVideo(id);
      loadVideos();
    }
  };

  const downloadVideo = (video: SavedVideo) => {
    const url = URL.createObjectURL(video.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${video.name}.mp4`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
        <p className="text-slate-500 font-bold">Đang tải thư viện video của bạn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3"><Film className="w-10 h-10 text-orange-500" /> Thư Viện Sáng Tạo</h2>
          <p className="text-slate-400">Nơi lưu trữ tất cả các video Affiliate triệu view bạn đã tạo.</p>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center space-y-6">
          <VideoOff className="w-20 h-20 text-slate-200 mx-auto" />
          <h3 className="text-xl font-black text-slate-400 uppercase">Thư viện trống</h3>
          <p className="text-slate-400 max-w-xs mx-auto text-sm">Hãy bắt đầu tạo video đầu tiên của bạn để lưu vào đây.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-xl transition-all flex flex-col">
              <div className="aspect-[9/16] bg-slate-900 relative overflow-hidden">
                {selectedVideoUrl && selectedVideoUrl === video.id ? (
                  <video 
                    src={URL.createObjectURL(video.blob)} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={() => setSelectedVideoUrl(video.id)}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all"></div>
                    <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:scale-110 transition-transform relative z-10" />
                    {video.thumbnail && <img src={video.thumbnail} className="absolute inset-0 w-full h-full object-cover" />}
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-black text-slate-900 line-clamp-1">{video.name}</h4>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md flex-shrink-0">MP4</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(video.timestamp).toLocaleDateString('vi-VN')} - {new Date(video.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => downloadVideo(video)} 
                    className="flex items-center justify-center gap-2 py-3 bg-orange-50 text-orange-600 rounded-xl font-black text-xs hover:bg-orange-100 transition-all"
                  >
                    <Download className="w-4 h-4" /> TẢI VỀ
                  </button>
                  <button 
                    onClick={() => handleDelete(video.id)} 
                    className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-xl font-black text-xs hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> XÓA
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
