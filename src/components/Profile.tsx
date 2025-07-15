import React, { useState, ChangeEvent } from 'react';

interface ProfileProps {
  isAuthenticated: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isAuthenticated }) => {
  const [profileImage, setProfileImage] = useState<string>('https://via.placeholder.com/150');

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setProfileImage(e.target.result);
        }
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  return (
    <div className="relative -mt-20 p-4 max-w-4xl mx-auto flex items-end space-x-6">
      <div className="relative group">
        <img 
          src={profileImage} 
          alt="Profile" 
          className="w-36 h-36 rounded-full border-4 border-white bg-gray-200 object-cover"
        />
        {isAuthenticated && (
          <label htmlFor="profile-image-upload" className="absolute bottom-1 right-1 bg-white text-black p-2 rounded-full text-xs cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Edit
            <input 
              id="profile-image-upload" 
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>
      <div>
        <h2 className="text-3xl font-bold">Mirae Jo</h2>
        <p className="text-gray-600">Frontend Developer | Cat Lover | Coffee Addict</p>
      </div>
    </div>
  );
};

export default Profile;