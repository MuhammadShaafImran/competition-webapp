"use client"
import { useState } from "react"
import Header from "./Header"
import Sidebar from "./Sidebar"
import { useAuth } from "../../auth/useAuth"

const MainLayout = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header onMenuClick={toggleSidebar} />
      <div className="flex flex-1">
        {isAuthenticated && (
          <>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div
              className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
                isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              style={{ left: "16rem" }}
              onClick={() => setIsSidebarOpen(false)}
            />
          </>
        )}
        <main className={`flex-1 p-6 bg-gray-50 ${isAuthenticated ? "ml-0" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
