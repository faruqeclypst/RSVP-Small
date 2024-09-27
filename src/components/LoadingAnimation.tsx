import React from 'react';
import { Circles } from 'react-loader-spinner';

const LoadingAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <Circles color="#00BFFF" height={80} width={80} />
    </div>
  );
};

export default LoadingAnimation;