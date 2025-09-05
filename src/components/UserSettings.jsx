"use client"

import { useState } from "react"
import { Save, RotateCcw, User, Lock, Bell, Palette, Monitor } from "lucide-react"

const UserSettings = () => {
  const [activeTab, setActiveTab] = useState("preferences")
  const [config, setConfig] = useState({
    maxTokens: 4000,
    temperature: 0.7,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    timeout: 30,
  })

  const [modelPreferences, setModelPreferences] = useState({
    "gpt-4": { enabled: true, priority: 1 },
    "gpt-3.5": { enabled: true, priority: 2 },
    "claude-3": { enabled: true, priority: 3 },
    "gemini-pro": { enabled: false, priority: 4 },
    "llama-2": { enabled: false, priority: 5 },
  })

  const [notifications, setNotifications] = useState({
    testComplete: true,
    weeklyReport: true,
    newFeatures: false,
    systemUpdates: true,
  })

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Engineering",
    role: "Senior Developer",
  })

  const tabs = [
    { id: "preferences", name: "Model Preferences", icon: Monitor },
    { id: "config", name: "Configuration", icon: Palette },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Lock },
  ]

  const handleConfigSave = () => {
    alert("Configuration saved successfully!")
  }

  const handleConfigReset = () => {
    setConfig({
      maxTokens: 4000,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      timeout: 30,
    })
  }

  const handleModelToggle = (modelId) => {
    setModelPreferences((prev) => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        enabled: !prev[modelId].enabled,
      },
    }))
  }

  const handleNotificationToggle = (notificationId) => {
    setNotifications((prev) => ({
      ...prev,
      [notificationId]: !prev[notificationId],
    }))
  }

  const renderPreferences = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-whale-blue mb-4">Available Models</h3>
        <div className="space-y-3">
          {Object.entries(modelPreferences).map(([modelId, settings]) => (
            <div key={modelId} className="flex items-center justify-between p-4 border border-storm-grey/20 rounded-lg">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={() => handleModelToggle(modelId)}
                  className="mr-3 text-vibrant-blue focus:ring-vibrant-blue"
                />
                <div>
                  <div className="font-medium text-whale-blue capitalize">{modelId.replace("-", " ")}</div>
                  <div className="text-sm text-charcoal/70">Priority: {settings.priority}</div>
                </div>
              </div>
              <div
                className={`px-3 py-1 text-xs rounded-full ${
                  settings.enabled ? "bg-vibrant-teal/10 text-vibrant-teal" : "bg-charcoal/10 text-charcoal/50"
                }`}
              >
                {settings.enabled ? "Enabled" : "Disabled"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-whale-blue mb-4">Default Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-whale-blue mb-2">Max Tokens per Request</label>
            <input
              type="number"
              value={config.maxTokens}
              onChange={(e) => setConfig((prev) => ({ ...prev, maxTokens: Number.parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-whale-blue mb-2">Response Timeout (seconds)</label>
            <input
              type="number"
              value={config.timeout}
              onChange={(e) => setConfig((prev) => ({ ...prev, timeout: Number.parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderConfiguration = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-whale-blue">JSON Configuration</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleConfigReset}
            className="flex items-center px-3 py-2 text-charcoal/70 hover:text-charcoal border border-storm-grey/30 rounded-lg hover:bg-lilly-white transition-colors"
          >
            <RotateCcw size={16} className="mr-1" />
            Reset
          </button>
          <button
            onClick={handleConfigSave}
            className="flex items-center px-3 py-2 bg-vibrant-blue text-white rounded-lg hover:bg-vibrant-blue/90 transition-colors"
          >
            <Save size={16} className="mr-1" />
            Save
          </button>
        </div>
      </div>

      <div className="bg-charcoal rounded-lg p-4 font-mono text-sm text-white overflow-x-auto">
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-whale-blue mb-2">Temperature (0.0 - 2.0)</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature}
            onChange={(e) => setConfig((prev) => ({ ...prev, temperature: Number.parseFloat(e.target.value) }))}
            className="w-full"
          />
          <div className="text-sm text-charcoal/70 mt-1">Current: {config.temperature}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-whale-blue mb-2">Top P (0.0 - 1.0)</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.topP}
            onChange={(e) => setConfig((prev) => ({ ...prev, topP: Number.parseFloat(e.target.value) }))}
            className="w-full"
          />
          <div className="text-sm text-charcoal/70 mt-1">Current: {config.topP}</div>
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-whale-blue">Notification Preferences</h3>
      <div className="space-y-4">
        {Object.entries(notifications).map(([key, enabled]) => (
          <div key={key} className="flex items-center justify-between p-4 border border-storm-grey/20 rounded-lg">
            <div>
              <div className="font-medium text-whale-blue capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
              <div className="text-sm text-charcoal/70">
                {key === "testComplete" && "Get notified when your prompt tests are complete"}
                {key === "weeklyReport" && "Receive weekly performance summaries"}
                {key === "newFeatures" && "Stay updated on new platform features"}
                {key === "systemUpdates" && "Important system maintenance notifications"}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => handleNotificationToggle(key)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-vibrant-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vibrant-blue"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-whale-blue">Profile Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-whale-blue mb-2">Full Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-whale-blue mb-2">Email Address</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-whale-blue mb-2">Department</label>
          <input
            type="text"
            value={profile.department}
            onChange={(e) => setProfile((prev) => ({ ...prev, department: e.target.value }))}
            className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-whale-blue mb-2">Role</label>
          <input
            type="text"
            value={profile.role}
            onChange={(e) => setProfile((prev) => ({ ...prev, role: e.target.value }))}
            className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-whale-blue">Security Settings</h3>
      <div className="space-y-4">
        <div className="p-4 border border-storm-grey/20 rounded-lg">
          <h4 className="font-medium text-whale-blue mb-2">Change Password</h4>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            />
            <button className="px-4 py-2 bg-vibrant-blue text-white rounded-lg hover:bg-vibrant-blue/90 transition-colors">
              Update Password
            </button>
          </div>
        </div>

        <div className="p-4 border border-crimson/20 rounded-lg bg-crimson/5">
          <h4 className="font-medium text-crimson mb-2">Danger Zone</h4>
          <p className="text-sm text-charcoal/70 mb-3">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="px-4 py-2 bg-crimson text-white rounded-lg hover:bg-crimson/90 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "preferences":
        return renderPreferences()
      case "config":
        return renderConfiguration()
      case "notifications":
        return renderNotifications()
      case "profile":
        return renderProfile()
      case "security":
        return renderSecurity()
      default:
        return renderPreferences()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-whale-blue mb-2">Settings</h1>
        <p className="text-charcoal/70">Manage your preferences and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "genzeon-gradient text-white"
                        : "text-charcoal/70 hover:bg-lilly-white hover:text-whale-blue"
                    }`}
                  >
                    <Icon size={16} className="mr-3" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default UserSettings
