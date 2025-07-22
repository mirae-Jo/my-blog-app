import React from "react";
import type { Post } from "../context/PostContext";

interface PostCardProps {
  post: Post;
  onClick: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  return (
    <div
      key={post.id}
      className='flex-shrink-0 w-64 bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 cursor-pointer snap-start flex flex-col'
      onClick={() => onClick(post)}>
      <div className='w-full h-48 bg-gray-200 flex-shrink-0'>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className='w-full h-full object-cover'
          />
        )}
      </div>
      <div className='p-6 flex-grow flex flex-col'>
        <h4 className='font-bold text-xl text-gray-900 mb-2'>{post.title}</h4>
      </div>
    </div>
  );
};

export default PostCard;
