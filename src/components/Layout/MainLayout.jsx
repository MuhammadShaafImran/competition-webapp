"use client"
import Header from "./Header"
import Sidebar from "./Sidebar"
import { useAuth } from "../../auth/useAuth"

const MainLayout = ({ children }) => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}

export default MainLayout
