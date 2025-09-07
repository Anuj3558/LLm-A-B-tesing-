"use client";

import { useState } from "react";
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

const PromptHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");

  const promptHistory = [
    {
      id: 1,
      prompt:
        "Explain the concept of machine learning and its applications in modern technology",
      timestamp: "2024-01-07 14:30:00",
      models: ["GPT-4", "Claude 3"],
      outcome: "Success",
      feedback: "positive",
      accuracy: 92,
      bestModel: "GPT-4",
      tokens: 156,
      responseTime: 1200,
    },
    {
      id: 2,
      prompt: "Write a Python function to implement binary search algorithm",
      timestamp: "2024-01-07 11:15:00",
      models: ["GPT-4", "GPT-3.5", "Claude 3"],
      outcome: "Success",
      feedback: "positive",
      accuracy: 88,
      bestModel: "Claude 3",
      tokens: 89,
      responseTime: 950,
    },
    {
      id: 3,
      prompt: "Summarize the key points from the attached research paper",
      timestamp: "2024-01-06 16:45:00",
      models: ["GPT-3.5"],
      outcome: "Error",
      feedback: "negative",
      accuracy: 0,
      bestModel: null,
      tokens: 0,
      responseTime: 0,
    },
    {
      id: 4,
      prompt:
        "Generate creative content for a marketing campaign about sustainable energy",
      timestamp: "2024-01-06 09:20:00",
      models: ["GPT-4", "Gemini"],
      outcome: "Success",
      feedback: "positive",
      accuracy: 85,
      bestModel: "GPT-4",
      tokens: 234,
      responseTime: 1450,
    },
    {
      id: 5,
      prompt: "Explain quantum computing principles for beginners",
      timestamp: "2024-01-05 13:10:00",
      models: ["Claude 3", "GPT-3.5"],
      outcome: "Success",
      feedback: "negative",
      accuracy: 75,
      bestModel: "Claude 3",
      tokens: 198,
      responseTime: 1100,
    },
    {
      id: 6,
      prompt: "Create a detailed project plan for developing a mobile app",
      timestamp: "2024-01-05 10:30:00",
      models: ["GPT-4"],
      outcome: "Success",
      feedback: "positive",
      accuracy: 90,
      bestModel: "GPT-4",
      tokens: 312,
      responseTime: 1800,
    },
  ];

  const filteredHistory = promptHistory.filter((item) => {
    const matchesSearch = item.prompt
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesModel =
      modelFilter === "all" || item.models.some((model) => model.toLowerCase().includes(modelFilter.toLowerCase()))
      {/*modelFilter === "all" ||
      (Array.isArray(item.models)
        ? item.models.some((model) =>
            model.toLowerCase().includes(modelFilter.toLowerCase())
          )
        : item.model?.toLowerCase().includes(modelFilter.toLowerCase()));*/}
    const matchesResult =
      resultFilter === "all" ||
      item.outcome.toLowerCase() === resultFilter.toLowerCase();

    // Simple date filtering (in a real app, you'd use proper date comparison)
    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = item.timestamp.includes("2024-01-07");
    } else if (dateFilter === "week") {
      matchesDate = item.timestamp.includes("2024-01-0");
    }

    return matchesSearch && matchesModel && matchesResult && matchesDate;
  });

  const handleRetest = (prompt) => {
    // In a real app, this would navigate to the test page with the prompt pre-filled
    console.log("Retesting prompt:", prompt.prompt);
    alert(`Retesting: "${prompt.prompt.substring(0, 50)}..."`);
  };

  const handleEdit = (prompt) => {
    // In a real app, this would navigate to the test page with the prompt pre-filled for editing
    console.log("Editing prompt:", prompt.prompt);
    alert(`Editing: "${prompt.prompt.substring(0, 50)}..."`);
  };

  const handleDelete = (promptId) => {
    if (window.confirm("Are you sure you want to delete this prompt?")) {
      console.log("Deleting prompt:", promptId);
      // In a real app, this would make an API call to delete the prompt
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
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.models.map((model, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs bg-vibrant-blue/10 text-vibrant-blue rounded"
                        >
                          {model}
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
          <button className="flex items-center justify-center mx-auto px-6 py-3 genzeon-gradient text-white rounded-lg hover:opacity-90 transition-opacity">
            <Play size={16} className="mr-2" />
            Start New Test
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptHistory;
