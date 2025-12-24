
/**
 * Video Render Service v6.0 - Ultimate TikTok Master
 * - Chuyên gia Audio Master: Ducking tự động cực mượt.
 * - Visual Fast-Motion: Zoom Burst mạnh, Flash rực rỡ, 60FPS.
 * - Đã fix hoàn toàn lỗi mất tiếng khi xuất video.
 */

function decodeBase64(base64: string) {
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  } catch (e) {
    console.error("Lỗi giải mã Base64:", e);
    return new Uint8Array(0);
  }
}

async function decodeAudioDataFromPCM(data: Uint8Array, ctx: AudioContext, sampleRate = 24000): Promise<AudioBuffer | null> {
  if (data.length === 0) return null;
  try {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  } catch (e) {
    console.error("Lỗi tạo AudioBuffer từ PCM:", e);
    return null;
  }
}

export const renderSlideshowVideo = async (
  assets: { type: 'image' | 'video', url: string, audioPcm?: string }[],
  musicFile: string | null,
  musicVolume = 0.20,
  onProgress: (progress: number) => void
): Promise<Blob | null> => {
  // 1. Khởi tạo Audio Pipeline ổn định
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const dest = audioCtx.createMediaStreamDestination();
  
  // Audio Nodes cho mastering
  const masterGain = audioCtx.createGain();
  masterGain.connect(dest);
  masterGain.gain.value = 1.0;

  const musicGain = audioCtx.createGain();
  musicGain.connect(masterGain);
  musicGain.gain.value = musicVolume;

  const voiceGain = audioCtx.createGain();
  voiceGain.connect(masterGain);
  voiceGain.gain.value = 1.2; // Tăng nhẹ voiceover cho rõ nét

  // 2. Load Assets & Chuẩn bị timeline
  const sceneData = await Promise.all(assets.map(async (asset, idx) => {
    let audioBuf: AudioBuffer | null = null;
    if (asset.audioPcm) {
      audioBuf = await decodeAudioDataFromPCM(decodeBase64(asset.audioPcm), audioCtx);
    }
    
    // Nhịp độ cực nhanh cho TikTok: Tối thiểu 1.5s
    const duration = audioBuf ? Math.max(audioBuf.duration, 1.5) : 2.0;

    let mediaEl: HTMLImageElement | HTMLVideoElement;
    if (asset.type === 'video') {
      const v = document.createElement('video');
      v.src = asset.url; v.muted = true; v.loop = true; v.playsInline = true;
      v.crossOrigin = "anonymous";
      await new Promise((r) => { v.onloadeddata = r; v.onerror = r; setTimeout(r, 5000); });
      mediaEl = v;
    } else {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = asset.url;
      await new Promise((r) => { img.onload = r; img.onerror = r; });
      mediaEl = img;
    }

    const motions = ['zoom-in', 'zoom-out', 'pan-left', 'pan-right'];
    const motionType = motions[idx % motions.length];

    return { type: asset.type, el: mediaEl, audioBuf, duration, motionType };
  }));

  const totalDuration = sceneData.reduce((acc, s) => acc + s.duration, 0);
  const startTimeMap = sceneData.reduce((acc, s, i) => { 
    acc.push(acc[i] + s.duration); return acc; 
  }, [0]);

  // 3. Load Nhạc nền
  let musicBuffer: AudioBuffer | null = null;
  if (musicFile) {
    try {
      if (musicFile.startsWith('data:audio/pcm;base64,')) {
        musicBuffer = await decodeAudioDataFromPCM(decodeBase64(musicFile.split(',')[1]), audioCtx);
      } else {
        const res = await fetch(musicFile);
        musicBuffer = await audioCtx.decodeAudioData(await res.arrayBuffer());
      }
    } catch (e) { console.warn("Music load error", e); }
  }

  // 4. Master Audio & Ducking Logic
  const recordingStartTime = audioCtx.currentTime + 0.3; // Độ trễ an toàn

  sceneData.forEach((scene, i) => {
    if (scene.audioBuf) {
      const voiceSource = audioCtx.createBufferSource();
      voiceSource.buffer = scene.audioBuf;
      voiceSource.connect(voiceGain);
      const start = recordingStartTime + startTimeMap[i];
      voiceSource.start(start);

      // Ducking chuyên nghiệp: Nhạc nhỏ lại 0.2s TRƯỚC khi nói và hồi phục 0.5s SAU khi nói xong
      musicGain.gain.setValueAtTime(musicVolume, start - 0.2);
      musicGain.gain.exponentialRampToValueAtTime(musicVolume * 0.15, start); 
      
      const end = start + scene.audioBuf.duration;
      musicGain.gain.setValueAtTime(musicVolume * 0.15, end);
      musicGain.gain.exponentialRampToValueAtTime(musicVolume, end + 0.5);
    }
  });

  if (musicBuffer) {
    const musicSource = audioCtx.createBufferSource();
    musicSource.buffer = musicBuffer;
    musicSource.loop = true;
    musicSource.connect(musicGain);
    musicSource.start(recordingStartTime);
  }

  // 5. Canvas & Recording Setup
  const canvas = document.createElement('canvas');
  canvas.width = 720; canvas.height = 1280;
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const canvasStream = canvas.captureStream(60); 
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks()
  ]);

  const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm;codecs=h264';
  const recorder = new MediaRecorder(combinedStream, { 
    mimeType, videoBitsPerSecond: 12000000, audioBitsPerSecond: 192000 
  });
  
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  return new Promise((resolve) => {
    recorder.onstop = () => { audioCtx.close(); resolve(new Blob(chunks, { type: mimeType })); };
    recorder.start();
    const renderStartTime = performance.now();

    const renderFrame = () => {
      const elapsed = (performance.now() - renderStartTime) / 1000;
      onProgress(Math.min(elapsed / totalDuration, 1));
      if (elapsed >= totalDuration) { if (recorder.state === 'recording') recorder.stop(); return; }

      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 720, 1280);
      let idx = startTimeMap.findIndex((t, i) => elapsed >= startTimeMap[i] && elapsed < startTimeMap[i+1]);
      if (idx === -1) idx = sceneData.length - 1;
      
      const current = sceneData[idx];
      const sceneProgress = (elapsed - startTimeMap[idx]) / current.duration;

      // HIỆU ỨNG FAST-MOTION THỊ GIÁC
      let zoom = 1.0;
      let offX = 0, offY = 0;

      // 1. Zoom Burst (0.2s đầu mỗi cảnh) - Cảm giác "giật" mạnh cực chuyên nghiệp
      if (sceneProgress < 0.12) {
        zoom = 1.25 - (sceneProgress * 2.0);
      } else {
        // 2. Ken Burns linh hoạt
        const t = sceneProgress;
        if (current.motionType === 'zoom-in') zoom = 1.0 + (t * 0.15);
        else if (current.motionType === 'zoom-out') zoom = 1.15 - (t * 0.15);
        else if (current.motionType === 'pan-left') offX = (t - 0.5) * 60;
        else if (current.motionType === 'pan-right') offX = (0.5 - t) * 60;
      }

      // Vẽ Media lên Canvas
      const drawMedia = (el: HTMLImageElement | HTMLVideoElement) => {
        const isVid = el instanceof HTMLVideoElement;
        if (isVid && (el as HTMLVideoElement).paused) (el as HTMLVideoElement).play().catch(() => {});
        const w = isVid ? (el as HTMLVideoElement).videoWidth : (el as HTMLImageElement).width;
        const h = isVid ? (el as HTMLVideoElement).videoHeight : (el as HTMLImageElement).height;
        const aspect = w / h;
        const dw = aspect > (720/1280) ? 1280 * aspect * zoom : 720 * zoom;
        const dh = aspect > (720/1280) ? 1280 * zoom : (720 / aspect) * zoom;
        ctx.drawImage(el, (720 - dw) / 2 + offX, (1280 - dh) / 2 + offY, dw, dh);
      };
      drawMedia(current.el);

      // 3. Chớp sáng Flash rực rỡ (0.1s đầu)
      if (sceneProgress < 0.1) {
        ctx.fillStyle = `rgba(255,255,255,${0.4 * (1 - sceneProgress/0.1)})`;
        ctx.fillRect(0, 0, 720, 1280);
      }

      // Overlay chân mờ ảo (Cinematic Gradient)
      const grad = ctx.createLinearGradient(0, 800, 0, 1280);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 800, 720, 480);

      requestAnimationFrame(renderFrame);
    };
    renderFrame();
  });
};
