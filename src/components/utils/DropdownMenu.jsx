"use client"

import { useEffect, useState } from "react"
import { Edit, ToggleLeft, ToggleRight, History, MoreHorizontal, Trash2 } from "lucide-react"

const DropdownMenu = ({ 
  user, 
  openConfigModal, 
  toggleUserStatus, 
  setShowDeleteModal,
  setSelectedUser
}) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = () => isOpen && setIsOpen(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={(e) => {
                e.stopPropagation()
                openConfigModal(user)
                setIsOpen(false)
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
            >
              <Edit className="mr-3" size={14} />
              Edit Configuration
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleUserStatus(user.id, user.isActive)
                setIsOpen(false)
              }}
              className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                user.isActive 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
              role="menuitem"
            >
              {user.isActive ? (
                <>
                  <ToggleLeft className="mr-3" size={14} />
                  Deactivate User
                </>
              ) : (
                <>
                  <ToggleRight className="mr-3" size={14} />
                  Activate User
                </>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedUser(user)
                setShowDeleteModal(true)
                setIsOpen(false)
              }}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              role="menuitem"
            >
              <Trash2 className="mr-3" size={14} />
              Delete User
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DropdownMenu