import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <div className=" h-16 flex items-center justify-center text-3xl font-bold sticky top-0"> {/* Thêm text-black */}
      <h1>{title}</h1>
    </div>
  );
}
export default Header;