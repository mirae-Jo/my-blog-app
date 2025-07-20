import React, { useState, type ChangeEvent, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface HeaderProps {
  isAuthenticated: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated }) => {
  const [coverImage, setCoverImage] = useState<string>(
    "https://via.placeholder.com/1500x300"
  );

  useEffect(() => {
    const fetchCoverImage = async () => {
      const { data, error } = await supabase
        .from("main_img")
        .select("url")
        .eq("id", "cover_photo")
        .single();

      if (error) {
        console.error("Error fetching cover image:", error);
      } else if (data) {
        setCoverImage(data.url);
      }
    };

    fetchCoverImage();
  }, []);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const filePath = `public/cover_photo_${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(filePath, file, { cacheControl: "3600" });

      if (uploadError) {
        console.error("Error uploading cover image:", uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("covers")
        .getPublicUrl(filePath);

      if (publicUrlData) {
        const newUrl = publicUrlData.publicUrl;
        console.log("Generated Public URL:", newUrl);
        setCoverImage(newUrl);

        const { error: dbError } = await supabase
          .from("main_img")
          .upsert({ id: "cover_photo", url: newUrl }, { onConflict: "id" });

        if (dbError) {
          console.error("Error updating cover image URL in DB:", dbError);
        }
      }
    }
  };

  console.log(coverImage);

  return (
    <header
      className='relative h-64 bg-gray-300 bg-cover bg-center group'
      style={{ backgroundImage: `url(${coverImage})` }}>
      {isAuthenticated && (
        <label
          htmlFor='cover-image-upload'
          className='absolute top-6 right-6 border border-blue-500 text-blue-500 px-6 py-3 rounded-lg text-base font-bold shadow-lg hover:bg-blue-500 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:top-4 sm:right-4 sm:px-4 sm:py-2 sm:text-sm'>
          Edit Cover Photo
          <input
            id='cover-image-upload'
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleImageChange}
          />
        </label>
      )}
    </header>
  );
};

export default Header;
