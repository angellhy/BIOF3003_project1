import React from 'react';

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ videoRef, canvasRef }) => {
  return (
    <div
      className="bg-white p-4 rounded-lg shadow-md border-2 border-green-200" // Light green border
      style={{ color: '#15803d' }} // Dark green text color
    >
      {/* Title */}
      <h2 className="text-lg font-semibold mb-2 text-green-700">Camera Feed</h2> {/* Dark green title */}

      {/* Video Element */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full max-w-[640px] h-auto border border-green-200" // Light green border for canvas
      />
    </div>
  );
};

export default CameraFeed;