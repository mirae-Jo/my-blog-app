import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export type Post = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  create_at: Date;
};

interface PostContextType {
  posts: Post[];
  selectedPost: Post | null;
  setSelectedPost: (post: Post | null) => void;
  fetchPosts: () => Promise<void>;
  handleAddPost: (title: string, content: string, imageUrl: string) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("post")
        .select("id, title, content, img_url, create_at")
        .order("create_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        return;
      }

      if (data) {
        const fetchedPosts: Post[] = data.map((post) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          imageUrl: post.img_url || undefined,
          create_at: post.create_at,
        }));
        setPosts(fetchedPosts);
      }
    } catch (networkError) {
      console.error("Network error fetching posts:", networkError);
    }
  }, []);

  const handleAddPost = useCallback(async (title: string, content: string, imageUrl: string) => {
    const newId = uuidv4();
    const now = new Date();
    const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("post")
      .insert({
        id: newId,
        title,
        content,
        img_url: imageUrl || null,
        create_at: kstDate.toISOString(),
      })
      .select();

    if (error) {
      console.error("Error adding post:", error);
      alert("게시글 추가에 실패했습니다: " + error.message);
      return;
    }

    if (data && data.length > 0) {
      const newPost: Post = {
        id: data[0].id,
        title: data[0].title,
        content: data[0].content,
        imageUrl: data[0].img_url || undefined,
        create_at: data[0].create_at,
      };
      setPosts((prevPosts) => {
        const updatedPosts = [...prevPosts, newPost];
        setSelectedPost(newPost);
        return updatedPosts;
      });
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (posts.length > 0 && selectedPost === null) {
      setSelectedPost(posts[0]);
    }
  }, [posts, selectedPost]);

  return (
    <PostContext.Provider value={{ posts, selectedPost, setSelectedPost, fetchPosts, handleAddPost }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};
