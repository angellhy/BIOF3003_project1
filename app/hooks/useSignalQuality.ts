import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

interface SignalQualityResults {
  signalQuality: string;
  qualityConfidence: number;
}

export default function useSignalQuality(ppgData: number[]): SignalQualityResults {
  const modelRef = useRef<tf.LayersModel | null>(null);
  const [signalQuality, setSignalQuality] = useState<string>('--');
  const [qualityConfidence, setQualityConfidence] = useState<number>(0);

  useEffect(() => {
    const loadModel = async () => {
      try {
        modelRef.current = await tf.loadLayersModel('/tfjs_model/model.json');
        console.log('PPG quality model loaded');
      } catch (error) {
        console.error('Failed to load model:', error);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (ppgData.length >= 100) {
      assessSignalQuality(ppgData);
    }
  }, [ppgData]);

  const assessSignalQuality = async (signal: number[]) => {
    if (!modelRef.current || signal.length < 100) return;
    try {
      const features = extractPpgFeatures(signal);
      const inputTensor = tf.tensor2d([features]);
      const prediction = (await modelRef.current.predict(inputTensor)) as tf.Tensor;
      const probabilities = await prediction.data();
      const classIndex = probabilities.indexOf(Math.max(...probabilities));
      const classes = ['bad', 'acceptable', 'excellent'];

      setSignalQuality(classes[classIndex]);
      setQualityConfidence(probabilities[classIndex] * 100);
      inputTensor.dispose();
      prediction.dispose();
    } catch (error) {
      console.error('Error assessing signal quality:', error);
    }
  };

  const extractPpgFeatures = (signal: number[]): number[] => {
    const epsilon = 1e-7;
    if (!signal.length) return Array(12).fill(0);
    
    const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
    const median = calculateMedian(signal);
    const std = Math.sqrt(signal.reduce((sum, val) => sum + (val - mean) ** 2, 0) / signal.length);
    const variance = std ** 2;
    const skewness = signal.reduce((sum, val) => sum + (val - mean) ** 3, 0) / (std ** 3 * signal.length + epsilon);
    const kurtosis = signal.reduce((sum, val) => sum + (val - mean) ** 4, 0) / (std ** 4 * signal.length + epsilon);
    const signalRange = Math.max(...signal) - Math.min(...signal);
    const zeroCrossings = countZeroCrossings(signal);
    const rms = Math.sqrt(signal.reduce((sum, val) => sum + val ** 2, 0) / signal.length);
    const peakToPeak = signalRange;
    const fftMagnitudes = computeFFT(signal);
    const dominantFreq = fftMagnitudes.indexOf(Math.max(...fftMagnitudes));
    const hist = computeHistogram(signal, 10);
    const signalEntropy = computeEntropy(hist.map(v => v + epsilon));

    return [mean, median, std, variance, skewness, kurtosis, signalRange, zeroCrossings, rms, peakToPeak, dominantFreq, signalEntropy];
  };

  const calculateMedian = (arr: number[]): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const countZeroCrossings = (arr: number[]): number => {
    return arr.reduce((count, val, i) => (i > 0 && (val > 0) !== (arr[i - 1] > 0) ? count + 1 : count), 0);
  };

  const computeFFT = (signal: number[]): number[] => {
    const s = tf.complex(signal, new Array(signal.length).fill(0));
    const fftCoeffs = tf.spectral.fft(s).abs().arraySync() as number[]; // fr??
    return fftCoeffs.slice(0, Math.floor(signal.length / 2));
  };

  const computeHistogram = (arr: number[], bins: number): number[] => {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const binSize = (max - min) / bins;
    const hist = new Array(bins).fill(0);
    arr.forEach(val => hist[Math.min(bins - 1, Math.floor((val - min) / binSize))]++);
    return hist.map(v => v / arr.length);
  };

  const computeEntropy = (probs: number[]): number => {
    return -probs.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);
  };

  return { signalQuality, qualityConfidence };
}
