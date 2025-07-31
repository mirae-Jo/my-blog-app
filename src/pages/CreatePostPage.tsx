import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { usePosts } from '../context/PostContext';
import { supabase } from '../lib/supabaseClient';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CreatePostPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('Hello world!');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { handleAddPost } = usePosts();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setUploading(true);
    let imageUrl = '';

    if (imageFile) {
      const filePath = `post_images/${Date.now()}_${imageFile.name}`;
      const { data: _data, error } = await supabase.storage
        .from('post-images')
        .upload(filePath, imageFile, { cacheControl: '3600' });

      if (error) {
        console.error('Error uploading image:', error);
        alert('이미지 업로드에 실패했습니다: ' + error.message);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        imageUrl = publicUrlData.publicUrl;
      }
    }

    await handleAddPost(title, content, imageUrl);
    setUploading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl" data-color-mode="light">
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
            <MDEditor
              value={content}
              onChange={(value) => setContent(value || '')}
              height={400}
              previewOptions={{
                components: {
                  pre: (props) => <pre className='not-prose' {...props} />,
                  code: ({
                    node,
                    inline,
                    className,
                    children,
                    ...props
                  }: any) => {
                    return !inline ? (
                      <SyntaxHighlighter
                        style={coy as any}
                        language='javascript'
                        PreTag='div'
                        {...props}>
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }
              }}
            />
          </div>
          <div>
            <label htmlFor="imageFile" className="block text-gray-700 text-sm font-bold mb-2">Image Upload (Optional)</label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="border border-gray-400 text-gray-700 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out hover:bg-gray-400 hover:text-white"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border border-blue-500 text-blue-500 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out hover:bg-blue-500 hover:text-white"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Add Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};