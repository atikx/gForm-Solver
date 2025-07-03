import { useState, useEffect } from "react";
import Home from "./pages/Home";
import GetKey from "./pages/GetKey";

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.sync.get("apiKey", (result) => {
      setApiKey(result.apiKey || null);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-4 text-sm text-gray-600">Loading...</div>;

  return apiKey ? <Home /> : <GetKey />;
}
