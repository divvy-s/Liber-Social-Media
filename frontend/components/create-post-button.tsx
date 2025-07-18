"use client"

import { useState } from "react";
import { useWeb3 } from "@/components/web3-provider";

export function CreatePostButton({ onPostCreated }: { onPostCreated?: (post: any) => void }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useWeb3();
  const userId = user?._id;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setImage(data.url);
  };

  const handleCreatePost = async () => {
    setLoading(true);
    if (file && !image) await handleUpload();
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: userId, content, image }),
    });
    const newPost = await res.json();
    setContent("");
    setImage("");
    setFile(null);
    setLoading(false);
    if (onPostCreated) onPostCreated(newPost);
  };

  return (
    <div className="border border-border/50 rounded-lg p-4 mb-4 bg-card/50">
      <textarea
        className="w-full p-2 rounded border border-border/30 mb-2"
        placeholder="What's on your mind?"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
      />
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
      {file && !image && (
        <button onClick={handleUpload} className="bg-primary text-white px-3 py-1 rounded mb-2">Upload Image</button>
      )}
      {image && <img src={image} alt="Preview" className="max-h-32 mb-2" />}
      <button
        onClick={handleCreatePost}
        className="bg-primary text-white px-4 py-2 rounded"
        disabled={loading || !content}
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
}

