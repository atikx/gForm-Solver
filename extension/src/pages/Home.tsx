import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Click below to auto-fill the form");
  const handleClick = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      setStatus("✅ Script injected! Check the form.");
      window.close(); // Close the popup after injection
    } catch (err) {
      console.error("Injection failed:", err);
      setStatus("❌ Failed to inject script.");
    }
  };

  const handleDeleteKey = () => {
    chrome.storage.sync.remove("apiKey", () => {
      setStatus("🗑️ API Key deleted!");
      setTimeout(() => {
        location.reload();
      }, 1000);
    });
  };

  return (
    <div className="w-80 p-6 bg-gray-900 text-gray-100 font-sans min-h-[300px] shadow-2xl">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
          <span className="text-2xl">🧠</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        gForm Solver
      </h1>

      <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
        <p className="text-base text-center text-gray-300 leading-relaxed">
          {status}
        </p>
      </div>

      <button
        onClick={handleClick}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mb-2"
      >
        <span className="mr-2">🚀</span>
        Auto-Fill Form
      </button>

      <button
        onClick={handleDeleteKey}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-lg transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="mr-2">🗑️</span>
        Delete API Key
      </button>

      <footer className="mt-8 text-sm text-center text-gray-500 border-t border-gray-700 pt-4">
        Made with <span className="text-red-400">💡</span> by{" "}
        <span className="text-blue-400 font-medium">Atiksh</span>
      </footer>
    </div>
  );
}
