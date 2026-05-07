import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-card border border-gray-200 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', actions }) => {
  return (
    <div className={`px-5 py-3.5 border-b border-gray-200 flex items-center justify-between ${className}`}>
      <h3 className="text-[13px] font-bold text-gray-800">{children}</h3>
      {actions && <div>{actions}</div>}
    </div>
  );
};

const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`px-5 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;