import React, { useState, ChangeEvent } from 'react';

interface HeaderProps {
  isAuthenticated: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated }) => {
  const [coverImage, setCoverImage] = useState<string>('https://via.placeholder.com/1500x300');

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setCoverImage(e.target.result);
        }
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  return (
    <header 
      className="relative h-64 bg-gray-300 bg-cover bg-center group"
      style={{ backgroundImage: `url(${coverImage})` }}
    >
      {isAuthenticated && (
        <label 
          htmlFor="cover-image-upload" 
          className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          Edit Cover Photo
          <input 
            id="cover-image-upload" 
            type="file" 
            accept="image/*" 
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      )}
    </header>
  );
};

export default Header;
