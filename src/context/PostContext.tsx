import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export type Post = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  create_at: Date;
  is_private: boolean;
};

interface PostContextType {
  posts: Post[];
  selectedPost: Post | null;
  setSelectedPost: (post: Post | null) => void;
  fetchPosts: () => Promise<void>;
  handleAddPost: (
    title: string,
    content: string,
    imageUrl: string,
    isPrivate: boolean
  ) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      let query = supabase
        .from("post")
        .select("id, title, content, img_url, create_at, is_private")
        .order("create_at", { ascending: false });
      console.log("fetchPosts - isAuthenticated:", isAuthenticated);
      if (!isAuthenticated) {
        console.log("비로그인상태");
        query = query.eq("is_private", false);
      }

      const { data, error } = await query;

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
          is_private: post.is_private,
        }));
        setPosts(fetchedPosts);
      }
    } catch (networkError) {
      console.error("Network error fetching posts:", networkError);
    }
  }, [isAuthenticated]);

  const handleAddPost = useCallback(
    async (title: string, content: string, imageUrl: string) => {
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
          create_at: new Date(data[0].create_at),
          is_private: data[0].is_private,
        };
        setPosts((prevPosts) => {
          const updatedPosts = [...prevPosts, newPost];
          setSelectedPost(newPost);
          return updatedPosts;
        });

        // GitHub에 포스트 커밋을 위한 서버리스 함수 호출
        try {
          const githubResponse = await fetch("/api/create-github-post", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: newPost.title,
              content: newPost.content,
              create_at: newPost.create_at.toISOString(),
              imageUrl: newPost.imageUrl,
            }),
          });

          if (!githubResponse.ok) {
            const responseText = await githubResponse.text(); // 응답 본문을 텍스트로 한 번만 읽음
            let errorDetails = "Unknown error";
            try {
              const errorJson = JSON.parse(responseText);
              errorDetails =
                errorJson.error || errorJson.details || responseText;
            } catch (parseError) {
              errorDetails = responseText;
            }
            console.error("Failed to commit post to GitHub:", errorDetails);
            alert("GitHub에 게시글 커밋 실패: " + errorDetails);
          } else {
            console.log("Post successfully committed to GitHub.");
          }
        } catch (githubError) {
          console.error(
            "Error calling GitHub serverless function:",
            githubError
          );
          alert("GitHub 연동 중 오류 발생.");
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, isAuthenticated]);

  useEffect(() => {
    if (posts.length > 0 && selectedPost === null) {
      setSelectedPost(posts[0]);
    }
  }, [posts, selectedPost]);

  return (
    <PostContext.Provider
      value={{
        posts,
        selectedPost,
        setSelectedPost,
        fetchPosts,
        handleAddPost,
      }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostProvider");
  }
  return context;
};
