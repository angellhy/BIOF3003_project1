'use client';
import { useState, useRef, useEffect } from 'react';
import CameraFeed from './components/CameraFeed';
import MetricsCard from './components/MetricsCard';
import SignalCombinationSelector from './components/SignalCombinationSelector';
import ChartComponent from './components/ChartComponent';
import usePPGProcessing from './hooks/usePPGProcessing';
import useSignalQuality from './hooks/useSignalQuality';
import useMongoDB from './hooks/useMongoDB';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [signalCombination, setSignalCombination] = useState('default');
  const [showConfig, setShowConfig] = useState(false);
  const [currentSubject, setCurrentSubject] = useState('');
  const [confirmedSubject, setConfirmedSubject] = useState('');
  const { pushDataToMongo, historicalData, lastAccess } = useMongoDB(confirmedSubject);

  // Define refs for video and canvas
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    ppgData,
    valleys,
    heartRate,
    hrv,
    processFrame,
    startCamera,
    stopCamera,
  } = usePPGProcessing(isRecording, signalCombination, videoRef, canvasRef);

  const { signalQuality, qualityConfidence } = useSignalQuality(ppgData);

  // Confirm User Function
  const confirmUser = () => {
    if (currentSubject.trim()) {
      setConfirmedSubject(currentSubject.trim());
    } else {
      alert('Please enter a valid Subject ID.');
    }
  };

  // Move useEffect hooks here, before any return statement
  useEffect(() => {
    if (isRecording) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isRecording]);

  useEffect(() => {
    let animationFrame: number;
    const processFrameLoop = () => {
      if (isRecording) {
        processFrame();
        animationFrame = requestAnimationFrame(processFrameLoop);
      }
    };
    if (isRecording) {
      processFrameLoop();
    }
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isRecording]);

  // Prepare the record data – adjust or add additional fields as needed
  const recordData = {
    heartRate: {
      bpm: isNaN(heartRate.bpm) ? 0 : heartRate.bpm, // Replace NaN with "ERRATIC"
      confidence: hrv.confidence || 0,
    },
    hrv: {
      sdnn: isNaN(hrv.sdnn) ? 0 : hrv.sdnn, // Replace NaN with "ERRATIC"
      confidence: hrv.confidence || 0,
    },
    ppgData: ppgData, // Use the provided ppgData array
    timestamp: new Date(),
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* User Input Section */}
      {!confirmedSubject && 
      <div className="w-full max-w-4xl mb-4">
        <input
          type="text"
          value={currentSubject}
          onChange={(e) => setCurrentSubject(e.target.value)}
          placeholder="Enter Subject ID"
          className="border border-gray-300 rounded-md p-2"
        />
        <button
          onClick={confirmUser}
          className="bg-purple-300 text-white px-4 py-2 rounded-md ml-2 hover:bg-purple-400 transition-all duration-300"
        >
          Confirm User
        </button>
      </div>}
      {confirmedSubject && 
      <p className="text-green-800 font-bold text-xl">User: {confirmedSubject}</p>}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl mb-4">
        {/* Title */}
        <h1
          className="text-3xl font-bold bg-gradient-to-r from-green-500 to-purple-500 bg-clip-text text-transparent"
        >
          HeartLens
        </h1>
        {/* Recording Button */}
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`p-3 rounded-lg text-sm transition-all duration-300 ${
            isRecording
              ? 'bg-purple-300 hover:bg-purple-400 text-white'
              : 'bg-purple-300 hover:bg-purple-400 text-white'
          }`}
        >
          {isRecording ? '⏹ STOP' : '⏺ START'} RECORDING
        </button>
      </div>

      {/* Main Grid: Camera and Chart Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {/* Left Column: Camera Feed and Historical Data */}
        <div className="space-y-4">
          {/* Camera Feed */}
          <CameraFeed videoRef={videoRef} canvasRef={canvasRef} />

          {/* Toggle Config Button */}
          <button
            onClick={() => setShowConfig((prev) => !prev)}
            className="px-4 py-2 bg-purple-300 text-white rounded hover:bg-purple-400 transition-all duration-300 w-full"
          >
            Toggle Config
          </button>

          {/* Signal Combination Dropdown (appears when showConfig is true) */}
          {showConfig && (
            <div className="w-full mt-2">
              <SignalCombinationSelector
                signalCombination={signalCombination}
                setSignalCombination={setSignalCombination}
              />
            </div>
          )}

          {/* Historical Data */}
          <div className="flex flex-col gap-4 mt-4">
            {/* Last Access Date (Plain Text) */}
            <div className="text-sm text-green-600">
              <strong>Last Access:</strong> {lastAccess ? lastAccess.toLocaleString() : 'NA'}
            </div>

            {historicalData && (
              <>
                <MetricsCard
                  title="AVG HEART RATE"
                  value={historicalData.avgHeartRate || 0} // Display historical avg heart rate
                />
                <MetricsCard
                  title="AVG HRV"
                  value={historicalData.avgHRV || 0} // Display historical avg HRV
                />
              </>
            )}
          </div>
        </div>

        {/* Right Column: Chart and Metrics */}
        <div className="space-y-4">
          {/* Chart */}
          <ChartComponent ppgData={ppgData} valleys={valleys} />

          {/* Save Data to MongoDB Button */}
          <button
            onClick={() => { pushDataToMongo(recordData) }}
            className="w-full px-4 py-2 bg-purple-300 text-white rounded hover:bg-purple-400 transition-all duration-300"
          >
            Save Data to MongoDB
          </button>

          {/* Metrics Cards (Side by Side) */}
          <div className="flex flex-wrap gap-4">
            {/* Heart Rate Card */}
            <MetricsCard
              title="HEART RATE"
              value={heartRate || {}} // Pass the HeartRateResult object
              confidence={heartRate?.confidence || 0}
            />

            {/* HRV Card */}
            <MetricsCard
              title="HRV"
              value={hrv || {}} // Pass the HRVResult object
              confidence={hrv?.confidence || 0}
            />

            {/* Signal Quality Card (Fallback for now) */}
            <MetricsCard
              title="SIGNAL QUALITY"
              value={signalQuality || '--'} // String value for signal quality
              confidence={qualityConfidence || 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}