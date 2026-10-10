/**
 * Offline Romantic Audio Generator
 * Generates beautiful, harmonic, gentle piano/harp melody WAV blobs completely in-memory.
 * Zero external network calls, 100% offline reliability.
 */

// Simple helper to create a valid 16-bit PCM WAV Blob from audio samples
function createWavBlob(sampleRate: number, samples: Float32Array): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * 1 * 2)
  view.setUint32(28, sampleRate * 2, true);
  // block align (1 * 2)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Frequency helper for musical notes
const NOTES: Record<string, number> = {
  C3: 130.81, E3: 164.81, G3: 196.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00
};

/**
 * Synthesizes a soft, warm piano-like note with harmonics and exponential decay
 */
function addNote(
  samples: Float32Array,
  sampleRate: number,
  startTime: number,
  duration: number,
  freq: number,
  volume = 0.25
) {
  const startIdx = Math.floor(startTime * sampleRate);
  const noteSamples = Math.floor(duration * sampleRate);

  for (let i = 0; i < noteSamples; i++) {
    const idx = startIdx + i;
    if (idx >= samples.length) break;

    const t = i / sampleRate;
    // Envelope: quick gentle attack, warm acoustic decay
    const attack = Math.min(1, t / 0.015);
    const decay = Math.exp(-t * 2.2);
    const envelope = attack * decay * volume;

    // Rich harmonic overtones: fundamental + 2nd + 3rd harmonic
    const sample =
      Math.sin(2 * Math.PI * freq * t) * 0.65 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.25 +
      Math.sin(2 * Math.PI * freq * 3 * t) * 0.1;

    samples[idx] += sample * envelope;
  }
}

/**
 * Generates an ambient romantic acoustic/piano song
 */
export function generateRomanticTrack(trackType: 'piano' | 'acoustic' | 'serenade'): { blob: Blob; duration: number } {
  const sampleRate = 22050; // fast, lightweight, high fidelity for music
  const totalDuration = 45; // 45 seconds seamless romantic loop
  const totalSamples = sampleRate * totalDuration;
  const samples = new Float32Array(totalSamples);

  if (trackType === 'piano') {
    // Canon in D style warm progression: C -> G -> Am -> Em -> F -> C -> F -> G
    const chordTime = 5.0;
    const chords = [
      ['C3', 'G3', 'C4', 'E4', 'G4'],
      ['G3', 'B3', 'D4', 'G4', 'B4'],
      ['E3', 'A3', 'C4', 'E4', 'A4'],
      ['E3', 'G3', 'B3', 'E4', 'G4'],
      ['C3', 'F3', 'A3', 'C4', 'F4'],
      ['C3', 'E3', 'G3', 'C4', 'E4'],
      ['C3', 'F3', 'A3', 'C4', 'A4'],
      ['G3', 'B3', 'D4', 'G4', 'D5']
    ];

    chords.forEach((chord, cIdx) => {
      const baseT = cIdx * chordTime;
      // Arpeggiated soft notes
      chord.forEach((noteName, nIdx) => {
        const freq = NOTES[noteName] || 261.63;
        addNote(samples, sampleRate, baseT + nIdx * 0.45, 3.8, freq, 0.22);
        // Repeat gentle sparkle
        addNote(samples, sampleRate, baseT + 2.2 + nIdx * 0.45, 3.2, freq, 0.16);
      });
    });
  } else if (trackType === 'acoustic') {
    // Gentle love acoustic ballad arpeggios
    const notesSeq = [
      'C4', 'E4', 'G4', 'C5', 'E4', 'G4',
      'A4', 'C5', 'E5', 'C5', 'A4', 'E4',
      'F4', 'A4', 'C5', 'A4', 'F4', 'C4',
      'G4', 'B4', 'D5', 'B4', 'G4', 'D4'
    ];
    let t = 0.5;
    while (t < totalDuration - 2) {
      notesSeq.forEach((note) => {
        const freq = NOTES[note] || 329.63;
        addNote(samples, sampleRate, t, 1.8, freq, 0.20);
        t += 0.38;
      });
    }
  } else {
    // Dreamy Serenade
    const progression = [
      ['C4', 'G4', 'E5'],
      ['A4', 'E5', 'C5'],
      ['F4', 'C5', 'A5'],
      ['G4', 'D5', 'B4']
    ];
    let t = 0.2;
    while (t < totalDuration - 3) {
      progression.forEach((ch) => {
        ch.forEach((note, i) => {
          const freq = NOTES[note] || 440;
          addNote(samples, sampleRate, t + i * 0.6, 4.0, freq, 0.18);
        });
        t += 3.6;
      });
    }
  }

  // Soft peak normalization to prevent clipping
  let maxPeak = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > maxPeak) maxPeak = abs;
  }
  if (maxPeak > 0.85) {
    const factor = 0.85 / maxPeak;
    for (let i = 0; i < samples.length; i++) {
      samples[i] *= factor;
    }
  }

  const blob = createWavBlob(sampleRate, samples);
  return { blob, duration: totalDuration };
}
