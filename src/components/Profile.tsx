import React, { useState, type ChangeEvent, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [profileImage, setProfileImage] = useState<string>(
    "https://via.placeholder.com/150"
  );

  useEffect(() => {
    const fetchProfileImage = async () => {
      const { data, error } = await supabase
        .from("profile_img")
        .select("url")
        .eq("id", "profile_photo")
        .single();

      if (error) {
        console.error("Error fetching profile image:", error);
      } else if (data) {
        setProfileImage(data.url);
      }
    };

    fetchProfileImage();
  }, []);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const filePath = `public/profile_photo_${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(filePath, file, { cacheControl: "3600" });

      if (uploadError) {
        console.error("Error uploading profile image:", uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("covers")
        .getPublicUrl(filePath);

      if (publicUrlData) {
        const newUrl = publicUrlData.publicUrl;
        setProfileImage(newUrl);

        const { error: dbError } = await supabase
          .from("profile_img")
          .upsert({ id: "profile_photo", url: newUrl }, { onConflict: "id" });

        if (dbError) {
          console.error("Error updating profile image URL in DB:", dbError);
        }
      }
    }
  };

  return (
    <div className='relative -mt-20 flex items-end space-x-6'>
      <div className='relative group'>
        <img
          src={profileImage}
          alt='Profile'
          className='w-36 h-36 rounded-full border-4 border-white bg-gray-200 object-cover'
        />
        {isAuthenticated && (
          <label
            htmlFor='profile-image-upload'
            className='absolute bottom-1 right-1 border border-blue-500 text-blue-500 p-2 rounded-full text-xs cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md hover:bg-blue-500 hover:text-white'>
            Edit
            <input
              id='profile-image-upload'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>
      <div>
        <h2 className='text-6xl text-white drop-shadow-lg mb-1'>미래</h2>
        <p className='text-gray-400 text-lg'>
          Frontend Developer | 포챠코 Lover | 소비 중독
        </p>
      </div>
    </div>
  );
};

export default Profile;
