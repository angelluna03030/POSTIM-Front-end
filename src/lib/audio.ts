/** Audio para los videos: se decodifica, se recorta/mezcla y se codifica dentro del MP4 */

export const AUDIO_SAMPLE_RATE = 48_000;
export const AUDIO_CHANNELS = 2;

export interface AudioOptions {
  /** 0-100 */
  volume: number;
  /** Segundo del audio en el que empieza el video */
  start: number;
  fadeIn: boolean;
  fadeOut: boolean;
  /** Repite el audio si es más corto que el video */
  loop: boolean;
}

export const DEFAULT_AUDIO_OPTIONS: AudioOptions = { volume: 80, start: 0, fadeIn: true, fadeOut: true, loop: true };

export interface LoadedAudio {
  name: string;
  buffer: AudioBuffer;
  /** Picos normalizados (0-1) para dibujar la onda */
  peaks: number[];
}

export const decodeAudio = async (data: ArrayBuffer): Promise<AudioBuffer> => {
  const ctx = new OfflineAudioContext(AUDIO_CHANNELS, 1, AUDIO_SAMPLE_RATE);
  return ctx.decodeAudioData(data);
};

export const computePeaks = (buffer: AudioBuffer, bars = 120) => {
  const data = buffer.getChannelData(0);
  const step = Math.max(1, Math.floor(data.length / bars));
  const peaks: number[] = [];
  for (let i = 0; i < bars; i++) {
    let max = 0;
    for (let j = i * step; j < Math.min(data.length, (i + 1) * step); j += 16) max = Math.max(max, Math.abs(data[j]));
    peaks.push(max);
  }
  const top = Math.max(...peaks, 0.0001);
  return peaks.map((p) => p / top);
};

const FADE = 1.2;

/** Conecta la fuente con volumen y fundidos a un destino (contexto en vivo u offline) */
const wireSource = (ctx: BaseAudioContext, buffer: AudioBuffer, opts: AudioOptions, duration: number, when = 0) => {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = opts.loop;
  if (opts.loop) {
    source.loopStart = 0;
    source.loopEnd = buffer.duration;
  }
  const gain = ctx.createGain();
  const vol = opts.volume / 100;
  const fade = Math.min(FADE, duration / 3);
  gain.gain.setValueAtTime(opts.fadeIn ? 0 : vol, when);
  if (opts.fadeIn) gain.gain.linearRampToValueAtTime(vol, when + fade);
  if (opts.fadeOut) {
    gain.gain.setValueAtTime(vol, when + duration - fade);
    gain.gain.linearRampToValueAtTime(0, when + duration);
  }
  source.connect(gain);
  return { source, gain, offset: Math.min(opts.start, Math.max(0, buffer.duration - 0.05)) };
};

/** Pista final con la duración exacta del video, a 48 kHz estéreo */
export const renderAudioTrack = async (buffer: AudioBuffer, opts: AudioOptions, duration: number) => {
  const ctx = new OfflineAudioContext(AUDIO_CHANNELS, Math.ceil(duration * AUDIO_SAMPLE_RATE), AUDIO_SAMPLE_RATE);
  const { source, gain, offset } = wireSource(ctx, buffer, opts, duration);
  gain.connect(ctx.destination);
  source.start(0, offset);
  return ctx.startRendering();
};

/** Reproduce el audio en vivo (vista previa). Devuelve una función para detenerlo */
export const playAudio = (buffer: AudioBuffer, opts: AudioOptions, duration: number, destination?: (ctx: AudioContext) => AudioNode) => {
  const ctx = new AudioContext();
  const { source, gain, offset } = wireSource(ctx, buffer, opts, duration, ctx.currentTime);
  gain.connect(destination ? destination(ctx) : ctx.destination);
  source.start(ctx.currentTime, offset);
  source.stop(ctx.currentTime + duration);
  return {
    ctx,
    stop: () => {
      try {
        source.stop();
      } catch {
        // ya detenido
      }
      ctx.close();
    },
  };
};

/** Códec de audio disponible para MP4: AAC si se puede, si no Opus */
export const pickAudioCodec = async (): Promise<{ config: AudioEncoderConfig; muxCodec: "aac" | "opus" } | null> => {
  if (typeof AudioEncoder === "undefined") return null;
  const options: { config: AudioEncoderConfig; muxCodec: "aac" | "opus" }[] = [
    { config: { codec: "mp4a.40.2", sampleRate: AUDIO_SAMPLE_RATE, numberOfChannels: AUDIO_CHANNELS, bitrate: 192_000 }, muxCodec: "aac" },
    { config: { codec: "opus", sampleRate: AUDIO_SAMPLE_RATE, numberOfChannels: AUDIO_CHANNELS, bitrate: 160_000 }, muxCodec: "opus" },
  ];
  for (const o of options) {
    try {
      if ((await AudioEncoder.isConfigSupported(o.config)).supported) return o;
    } catch {
      // probar el siguiente
    }
  }
  return null;
};

/** Codifica la pista completa y entrega los fragmentos al muxer */
export const encodeAudioTrack = async (
  track: AudioBuffer,
  config: AudioEncoderConfig,
  onChunk: (chunk: EncodedAudioChunk, meta?: EncodedAudioChunkMetadata) => void,
) => {
  let error: unknown = null;
  const encoder = new AudioEncoder({ output: onChunk, error: (e) => (error = e) });
  encoder.configure(config);
  const frames = 1024;
  const channels = track.numberOfChannels;
  for (let offset = 0; offset < track.length; offset += frames) {
    const n = Math.min(frames, track.length - offset);
    const planar = new Float32Array(n * channels);
    for (let c = 0; c < channels; c++) planar.set(track.getChannelData(c).subarray(offset, offset + n), c * n);
    const data = new AudioData({
      format: "f32-planar",
      sampleRate: track.sampleRate,
      numberOfFrames: n,
      numberOfChannels: channels,
      timestamp: Math.round((offset / track.sampleRate) * 1e6),
      data: planar,
    });
    encoder.encode(data);
    data.close();
  }
  await encoder.flush();
  encoder.close();
  if (error) throw error;
};

export const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
