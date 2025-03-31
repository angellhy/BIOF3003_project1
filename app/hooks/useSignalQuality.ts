import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

interface SignalQualityResults {
  signalQuality: string;
  qualityConfidence: number;
}

export default function useSignalQuality(ppgData: number[], fs: number = 100): SignalQualityResults {
  const modelRef = useRef<tf.LayersModel | null>(null);
  const [signalQuality, setSignalQuality] = useState<string>('--');
  const [qualityConfidence, setQualityConfidence] = useState<number>(0);

  // Load TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadLayersModel('/tfjs_model/model.json');
        modelRef.current = loadedModel;
        console.log('PPG quality assessment model loaded successfully');
      } catch (error) {
        console.error('Error loading model:', error);
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
      // Extract features using the updated method
      const features = extractPpgFeatures(signal, fs);

      const inputTensor = tf.tensor(features).reshape([1, features.length]);

      // Model prediction
      const prediction = (await modelRef.current.predict(inputTensor)) as tf.Tensor;
      const probabilities = await prediction.data();

      // Get classification result
      const classIndex = probabilities.indexOf(Math.max(...probabilities));
      const classes = ['bad', 'acceptable', 'excellent'];
      const predictedClass = classes[classIndex];
      const confidence = probabilities[classIndex] * 100;

      // Update state
      setSignalQuality(predictedClass);
      setQualityConfidence(confidence);

      inputTensor.dispose();
      prediction.dispose();
    } catch (error) {
      console.error('Error assessing signal quality:', error);
    }
  };

  // Feature extraction method (updated)
  const extractPpgFeatures = (signal: number[], fs: number = 100): number[] => {
    const epsilon = 1e-7;  // Small value for numerical stability

    if (signal.length === 0) {
      return new Array(14).fill(0);  // Return a zero-vector if signal is empty
    }

    const mean = Math.mean(signal);
    const median = Math.median(signal);
    const std = Math.std(signal);
    const variance = Math.var(signal);

    const diff = signal - mean;
    const skewness = Math.mean(diff ** 3) / (Math.pow(std, 3) + epsilon);
    const kurtosis = Math.mean(diff ** 4) / (Math.pow(std, 4) + epsilon);

    const signalRange = Math.max(signal) - Math.min(signal);
    const zeroCrossings = Math.sum(Math.diff(signal).map(val => val !== 0 ? 1 : 0));

    const rms = Math.sqrt(Math.mean(signal ** 2));
    const peakToPeak = signalRange;

    // Frequency-Domain Features
    const fftCoeffs = new Float32Array(signal); // Create a Float32Array for the signal
    const fftMagnitudes = Math.abs(fftCoeffs); // Compute magnitudes

    // We slice the first half of the FFT spectrum manually
    const halfFft = fftMagnitudes.slice(0, Math.floor(signal.length / 2));
    const normalizedFft = halfFft.map(val => val / (halfFft.reduce((sum, v) => sum + v, 0) + epsilon)); // Normalize

    const dominantFreq = normalizedFft.indexOf(Math.max(...normalizedFft)); // Most dominant frequency index

    // Power Spectral Density (Welch Method)
    const { freqs, psd } = welch(signal, fs);
    const maxPsd = Math.max(...psd);  // Maximum power density
    const meanPsd = Math.mean(psd);
    const dominantFreqHz = freqs[psd.indexOf(Math.max(...psd))];  // Dominant frequency in Hz

    // Entropy (Measures randomness in signal)
    const hist = Array(10).fill(0);
    const binSize = signalRange / 10;
    signal.forEach(val => {
      const binIndex = Math.min(9, Math.floor((val - Math.min(...signal)) / binSize));
      hist[binIndex]++;
    });
    const signalEntropy = entropy(hist.map(v => v / signal.length) + epsilon); // Normalize histogram

    const features = [
      mean, median, std, variance, skewness, kurtosis,
      signalRange, zeroCrossings, rms, peakToPeak,
      dominantFreq, maxPsd, meanPsd, signalEntropy
    ];

    return features;
  };

  return { signalQuality, qualityConfidence };
}
