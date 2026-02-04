import React, { useState, useRef } from 'react';
import { Camera, Sun, Frame, ShieldOff, User } from 'lucide-react';
import { toast } from 'react-toastify';
import Webcam from 'react-webcam';

const MarkUserAttendance = () => {
  const [active, setActive] = useState(false);
  const webcamRef = useRef(null);

  // Handle Mark Attendance click
  const handleMarkAttendance = () => {
    setActive(true);
  };

  // Capture image
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Here you would send the image to your backend for verification
        toast.success('Attendance marked successfully!', {
          toastId: 'attendance-success',
          position: 'top-right',
          autoClose: 3000,
        });
        setActive(false);
      } else {
        toast.error('Failed to capture image. Please try again.', {
          toastId: 'capture-error',
          position: 'top-right',
          autoClose: 3000,
        });
      }
    }
  };

  // Handle webcam errors
  const handleWebcamError = (error) => {
    console.error('Webcam error:', error);
    toast.error('Failed to access camera. Please check permissions.', {
      toastId: 'camera-error',
      position: 'top-right',
      autoClose: 3000,
    });
    setActive(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-2">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 md:p-2">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Mark Attendance
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Please position your face within the frame for live capture to verify your identity.
          </p>
        </div>

        {/* Camera Section */}
        <div className="bg-gray-50 rounded-xl p-6 md:p-5 mb-6">
          <div className="relative w-full max-w-xl mx-auto aspect-3/2 bg-white rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden">
            {!active ? (
              /* Placeholder */
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-200 rounded-full flex items-center justify-center">
                    <div className="flex gap-2">
                      <Camera size={45} color='blue'/>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Camera not initialized</p>
              </div>
            ) : (
              /* Camera View */
              <div className="w-full h-full relative">
                {/* Webcam */}
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover rounded-lg"
                  mirrored={true}
                  onUserMediaError={handleWebcamError}
                  videoConstraints={{
                    facingMode: 'user'
                  }}
                />
                
                {/* Frame corners */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              </div>
            )}
          </div>

          {/* Live Verification Text */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {active ? 'System is ready for capture' : 'Click the button below to start'}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center mt-4">
            {!active ? (
              <button
                onClick={handleMarkAttendance}
                className="flex items-center text-xl gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold px-9 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <Camera className="w-5 h-5" />
                Mark Attendance
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={captureImage}
                  className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                  Capture
                </button>
                <button
                  onClick={() => setActive(false)}
                  className="flex items-center gap-2 cursor-pointer bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Guidelines Section */}
        <div className="mb-6 pl-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center md:text-left">
            Guidelines for successful capture
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Sun className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Good Lighting</h3>
                <p className="text-sm text-gray-600">Ensure the area is well lit and no glare</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Frame className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Stay in Frame</h3>
                <p className="text-sm text-gray-600">Keep your face centered and look forward</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <ShieldOff className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">No Masks</h3>
                <p className="text-sm text-gray-600">Remove masks or heavy coverings</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Single Person</h3>
                <p className="text-sm text-gray-600">Ensure only one person is in view</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkUserAttendance;