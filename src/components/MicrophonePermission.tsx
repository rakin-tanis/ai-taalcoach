'use client'

import React, { useState } from 'react';

// Enum for permission states
enum PermissionState {
  INITIAL = 'initial',
  CHECKING = 'checking',
  GRANTED = 'granted',
  DENIED = 'denied',
  ERROR = 'error'
}

// Detailed platform detection
const detectPlatform = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'Windows';
  if (userAgent.includes('mac')) return 'MacOS';
  if (userAgent.includes('iphone')) return 'iOS';
  if (userAgent.includes('android')) return 'Android';
  return 'Other';
};

// Permission guide based on platform
const getPlatformInstructions = (platform: string) => {
  const guides: {[key: string]: string[]} = {
    'Windows': [
      'Open Chrome/Edge settings',
      'Go to Privacy and Security',
      'Site Settings > Microphone',
      'Allow this site'
    ],
    'MacOS': [
      'Open Safari/Chrome Preferences',
      'Go to Websites tab',
      'Select Microphone',
      'Allow for this website'
    ],
    'iOS': [
      'Go to iOS Settings',
      'Select Safari/Chrome',
      'Microphone Permissions',
      'Enable for this website'
    ],
    'Android': [
      'Open Chrome Settings',
      'Site Settings',
      'Microphone',
      'Allow for this site'
    ],
    'Other': [
      'Check browser settings',
      'Find microphone permissions',
      'Enable for this website'
    ]
  };

  return guides[platform] || guides['Other'];
};

// Main Microphone Permission Component
interface MicrophonePermissionProps {
  onPermissionGranted: () => void;
  onPermissionDenied?: () => void;
  children: (checkPermission: () => Promise<boolean>) => React.ReactNode;
}

const MicrophonePermission: React.FC<MicrophonePermissionProps> = ({ 
  onPermissionGranted, 
  onPermissionDenied,
  children 
}) => {
  const [permissionState, setPermissionState] = useState<PermissionState>(PermissionState.INITIAL);
  const [error, setError] = useState<string | null>(null);
  const platform = detectPlatform();

  // Comprehensive permission check
  const checkMicrophonePermission = async (): Promise<boolean> => {
    setPermissionState(PermissionState.CHECKING);
    setError(null);

    try {
      // Check current permission status
      const permissionStatus = await navigator.permissions.query({ 
        name: 'microphone' as PermissionName 
      });
      
      console.log('Microphone Permission Status:', permissionStatus.state);

      switch (permissionStatus.state) {
        case 'granted':
          setPermissionState(PermissionState.GRANTED);
          onPermissionGranted();
          return true;
        
        case 'denied':
          setPermissionState(PermissionState.DENIED);
          setError(
            'Microphone access is blocked. Please enable permissions manually.'
          );
          onPermissionDenied?.();
          return false;
        
        case 'prompt':
          // Attempt to request permission
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            setPermissionState(PermissionState.GRANTED);
            onPermissionGranted();
            return true;
          } catch (permissionError) {
            console.error('Microphone permission request failed', permissionError);
            setPermissionState(PermissionState.DENIED);
            setError(
              'Microphone permission request failed. Check device and browser settings.'
            );
            onPermissionDenied?.();
            return false;
          }
        
        default:
          setPermissionState(PermissionState.ERROR);
          setError('Unable to determine microphone permissions');
          onPermissionDenied?.();
          return false;
      }
    } catch (error) {
      console.error('Microphone permission check failed', error);
      setPermissionState(PermissionState.ERROR);
      setError(
        'Failed to check microphone permissions. Ensure you are on HTTPS.'
      );
      onPermissionDenied?.();
      return false;
    }
  };

  // Render permission instructions
  const renderPermissionInstructions = () => {
    const instructions = getPlatformInstructions(platform);
    
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
        <h4 className="font-bold text-yellow-700 mb-2">
          How to Enable Microphone Permissions on {platform}
        </h4>
        <ol className="list-decimal list-inside text-yellow-800">
          {instructions.map((step, index) => (
            <li key={index} className="mb-1">{step}</li>
          ))}
        </ol>
      </div>
    );
  };

  // Render error state
  const renderErrorState = () => {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 space-y-4">
        <p className="text-red-700 font-semibold">
          {error || 'Microphone access is required'}
        </p>
        {renderPermissionInstructions()}
        <div className="text-sm text-red-600">
          <strong>Note:</strong> You must enable microphone permissions to use speech recording.
        </div>
      </div>
    );
  };

  // Main render method
  return (
    <>
      {/* Render children with permission check method */}
      {children(checkMicrophonePermission)}

      {/* Render error state when permission is denied */}
      {(permissionState === PermissionState.DENIED || 
        permissionState === PermissionState.ERROR) && 
        renderErrorState()}
    </>
  );
};

export default MicrophonePermission;
