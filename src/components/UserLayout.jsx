"use client"

import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { LayoutDashboard, TestTube, History, Settings, LogOut, Menu, X, Sparkles } from "lucide-react"

const UserLayout = ({ user, onLogout }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { name: "Prompt Testing", href: "/user/test", icon: TestTube },
    { name: "Prompt History", href: "/user/history", icon: History },
  ]

  const isActive = (href) => location.pathname === href

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 shadow-2xl bg-white  left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col bg-white  apple-blur m-4 rounded-2xl">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-storm-grey/20">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg genzeon-gradient flex items-center justify-center mr-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-whale-blue">LLM Tester</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-charcoal/50 hover:text-charcoal">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive(item.href)
                      ? "genzeon-gradient text-white shadow-lg"
                      : "text-charcoal/70 hover:bg-lilly-white hover:text-whale-blue"
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4  border-t border-storm-grey/20">
            <div className="flex items-center mb-4">
              <div className="w-10 genzeon-gradient h-10 rounded-full bg-vibrant-teal flex items-center justify-center mr-3">
                <span className="text-white  font-medium text-sm">
                  {user.username || user.email
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-whale-blue">{user.username}</p>
                <p className="text-xs text-charcoal/50">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex text-red-400   items-center w-full px-4 py-2 text-sm text-crimson hover:bg-crimson/10 rounded-lg transition-colors"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-white/20 bg-white/80 apple-blur px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-charcoal/70 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold text-whale-blue">
                {navigation.find((item) => isActive(item.href))?.name || "Dashboard"}
              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default UserLayout
