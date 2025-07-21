import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { usePosts } from '../context/PostContext';

const CreatePostPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();
  const { handleAddPost } = usePosts();

  const mdeOptions = React.useMemo(() => {
    return {
      spellChecker: false,
      autofocus: true,
      placeholder: "Write your post content here...",
      toolbar: [
        "bold", "italic", "heading", "|", "quote", "code", "unordered-list", "ordered-list", "|",
        "link", "image", "|", "preview", "guide"
      ] as any[],
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title && content) {
      await handleAddPost(title, content, imageUrl);
      navigate('/'); // 게시물 추가 후 메인 페이지로 이동
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New Post</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
            <input
              type="text"
              id="title"
              className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content</label>
            <SimpleMdeReact
              value={content}
              onChange={setContent}
              options={mdeOptions}
            />
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-gray-700 text-sm font-bold mb-2">Image URL (Optional)</label>
            <input
              type="text"
              id="imageUrl"
              className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="border border-gray-400 text-gray-700 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out hover:bg-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border border-blue-500 text-blue-500 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out hover:bg-blue-500 hover:text-white"
            >
              Add Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
