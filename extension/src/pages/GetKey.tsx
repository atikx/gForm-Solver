import { useState } from "react";

export default function GetKey() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState("");

  const handleSave = () => {
    if (!apiKey || (!apiKey.startsWith("AIza") && !apiKey.startsWith("G"))) {
      setStatus("❌ Invalid API Key");
      return;
    }

    chrome.storage.sync.set({ apiKey }, () => {
      setStatus("✅ API Key saved!");
      setTimeout(() => {
        location.reload();
      }, 1000);
    });
  };

  return (
    <div className="w-80 bg-gray-900 text-gray-100 font-sans shadow-2xl">
      <div className="p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-full">
            <span className="text-2xl">🔐</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Enter Gemini API Key
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Key
            </label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-base text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Paste your API key here..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="mr-2">💾</span>
            Save Key
          </button>

          {status && (
            <div
              className={`p-3 rounded-lg text-center font-medium text-base ${
                status.includes("✅")
                  ? "bg-green-900/50 text-green-300 border border-green-700"
                  : "bg-red-900/50 text-red-300 border border-red-700"
              }`}
            >
              {status}
            </div>
          )}
        </div>
      </div>

      <footer className="px-6 pb-6 text-sm text-center text-gray-500 border-t border-gray-700 pt-4 mt-6">
        Made with <span className="text-red-400">💖</span> by{" "}
        <span className="text-blue-400 font-medium">Atiksh</span>
      </footer>
    </div>
  );
}
