"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  RotateCcw,
  Edit,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Play,
} from "lucide-react";

// Helper to get auth token
const getAuthToken = () => {
  return (
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken") ||
    document.cookie.replace(
      /(?:(?:^|.*;\s*)authToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    ) ||
    null
  );
};

// Helper to get userId
const getUserId = () => {
  const userId =
    localStorage.getItem("userId") || sessionStorage.getItem("userId");
  if (userId) return userId;

  try {
    const token = getAuthToken();
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || payload.sub || payload.id;
    }
  } catch (error) {
    console.error("Error decoding token:", error);
  }

  return null;
};

const PromptHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [promptHistory, setPromptHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = getAuthToken();
        const userId = getUserId();

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/user/get-prompt-history?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (data.success) {
          setPromptHistory(data.history);
        } else {
          console.error("Failed to fetch history:", data.error);
        }
      } catch (error) {
        console.error("Error fetching prompt history:", error);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = promptHistory.filter((item) => {
    const matchesSearch = item.prompt
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesModel =
      modelFilter === "all" ||
      item.models.some((model) =>
        model.toLowerCase().includes(modelFilter.toLowerCase())
      );
    const matchesResult =
      resultFilter === "all" ||
      item.outcome.toLowerCase() === resultFilter.toLowerCase();

    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = item.timestamp.includes("2024-01-07");
    } else if (dateFilter === "week") {
      matchesDate = item.timestamp.includes("2024-01-0");
    }

    return matchesSearch && matchesModel && matchesResult && matchesDate;
  });

  const handleRetest = (prompt) => {
    console.log("Retesting prompt:", prompt.prompt);
    alert(`Retesting: "${prompt.prompt.substring(0, 50)}..."`);
  };

  const handleEdit = (prompt) => {
    console.log("Editing prompt:", prompt.prompt);
    alert(`Editing: "${prompt.prompt.substring(0, 50)}..."`);
  };

  const handleDelete = (promptId) => {
    if (window.confirm("Are you sure you want to delete this prompt?")) {
      console.log("Deleting prompt:", promptId);
    }
  };

  const getFeedbackIcon = (feedback) => {
    return feedback === "positive" ? (
      <ThumbsUp className="w-4 h-4 text-vibrant-teal" />
    ) : (
      <ThumbsDown className="w-4 h-4 text-crimson" />
    );
  };

  const getOutcomeColor = (outcome) => {
    return outcome === "Success"
      ? "text-vibrant-teal bg-vibrant-teal/10"
      : "text-crimson bg-crimson/10";
  };

  const handleStartNewTest = () => {
    // Simple redirect in Vite + React
    window.location.href = "/new-test";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-whale-blue mb-2">
          Prompt History
        </h1>
        <p className="text-charcoal/70">
          Review and manage your previously tested prompts
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/50"
              size={20}
            />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-charcoal/50" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-charcoal/50" />
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            >
              <option value="all">All Models</option>
              <option value="gpt-4">GPT-4</option>
              <option value="claude">Claude</option>
              <option value="gpt-3.5">GPT-3.5</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
          >
            <option value="all">All Results</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white shadow p-4">
        <p className="text-sm text-charcoal/70">
          Showing {filteredHistory.length} of {promptHistory.length} prompts
        </p>
      </div>

      {/* History Table */}
      <div className="bg-white shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-lilly-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">
                  Prompt
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">
                  Models
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">
                  Outcome
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">
                  Performance
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">
                  Feedback
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-storm-grey/20">
              {filteredHistory.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-lilly-white/50 transition-colors"
                >
                  <td className="px-6 py-4 max-w-xs">
                    <div
                      className="text-sm font-medium text-whale-blue truncate"
                      title={item.prompt}
                    >
                      {item.prompt}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal/70 font-mono">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.models.map((model) => (
                      <span
                        key={model._id || model.name}
                        className="inline-flex px-2 py-1 text-xs bg-vibrant-blue/10 text-vibrant-blue rounded"
                        title={`${model.name} (${model.provider}) - ${model.endpoint}`}
                      >
                        {model.name} ({model.provider})
                      </span>
                    ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOutcomeColor(
                        item.outcome
                      )}`}
                    >
                      {item.outcome}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.outcome === "Success" ? (
                      <div className="text-sm">
                        <div className="font-medium text-whale-blue">
                          {item.accuracy}% accuracy
                        </div>
                        <div className="text-charcoal/70">{item.bestModel}</div>
                        <div className="text-xs text-charcoal/50">
                          {item.tokens} tokens • {item.responseTime}ms
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-charcoal/50">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.outcome === "Success" ? (
                      getFeedbackIcon(item.feedback)
                    ) : (
                      <span className="text-charcoal/30">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRetest(item)}
                        className="p-2 text-charcoal/50 hover:text-vibrant-blue hover:bg-vibrant-blue/10 rounded-lg transition-colors"
                        title="Retest"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-charcoal/50 hover:text-dusky-orange hover:bg-dusky-orange/10 rounded-lg transition-colors"
                        title="Edit & Reuse"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-charcoal/50 hover:text-crimson hover:bg-crimson/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredHistory.length === 0 && (
        <div className="bg-white shadow p-12 text-center">
          <div className="text-charcoal/50 mb-4">
            <Search size={48} className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-whale-blue mb-2">
              No prompts found
            </h3>
            <p>
              Try adjusting your search criteria or create a new prompt test.
            </p>
          </div>
          <button
            onClick={handleStartNewTest}
            className="flex items-center justify-center mx-auto px-6 py-3 genzeon-gradient text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Play size={16} className="mr-2" />
            Start New Test
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptHistory;
