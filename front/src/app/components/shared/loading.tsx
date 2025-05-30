import React from 'react';

type LoadingProps = {
  title?: string;
};

const spinnerStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  border: '6px solid #f3f3f3',
  borderTop: '6px solid #3498db',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto'
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 200
};

const Loading: React.FC<LoadingProps> = ({ title = 'Chargement...' }) => (
  <div style={containerStyle}>
    <h2>{title}</h2>
    <div style={spinnerStyle}></div>
  </div>
);

export default Loading;
