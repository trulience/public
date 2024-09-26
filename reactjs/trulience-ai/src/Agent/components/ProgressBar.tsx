import React from "react";

const ProgressBar = ({ bgcolor, completed, hideProgressBar }: { bgcolor: string, completed: number, hideProgressBar: boolean }) => {

  const containerStyles: React.CSSProperties = {
    height: 20,
    width: '40vw',
    backgroundColor: "#e0e0de",
    borderRadius: 10,
    position: 'absolute',
    overflow: "hidden",
    zIndex: 1000,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }

  const fillerStyles: React.CSSProperties = {
    height: '100%',
    width: `${completed}%`,
    backgroundColor: bgcolor,
    borderRadius: 'inherit',
    textAlign: 'right'
  }


  if (completed == 100 || hideProgressBar) {
    return null;
  }

  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
      </div>
    </div>
  );
};

export default ProgressBar;
