import { type ReactNode, useState } from "react"
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom"
import {
    LayoutDashboard,
    FileText,
    History,
    FolderKanban,
    Users,
    LogOut,
    Menu,
    User as UserIcon,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import logo from "@/assets/logo.png"

interface NavItem {
    label: string
    to: string
    icon: typeof LayoutDashboard
    roles: Array<"MEMBER" | "MANAGER" | "ADMIN">
}

const NAV_ITEMS: NavItem[] = [
    {
        label: "Dashboard",
        to: "/dashboard",
        icon: LayoutDashboard,
        roles: ["MANAGER", "ADMIN"],
    },
    {
        label: "Current Report",
        to: "/reports/current",
        icon: FileText,
        roles: ["MEMBER"],
    },
    {
        label: "Report History",
        to: "/reports/history",
        icon: History,
        roles: ["MEMBER"],
    },
    {
        label: "All Reports",
        to: "/reports",
        icon: FileText,
        roles: ["MANAGER", "ADMIN"],
    },
    {
        label: "Projects",
        to: "/projects",
        icon: FolderKanban,
        roles: ["MANAGER", "ADMIN"],
    },
    {
        label: "Users",
        to: "/users",
        icon: Users,
        roles: ["ADMIN"],
    },
    {
        label: "My Profile",
        to: "/profile",
        icon: UserIcon,
        roles: ["MEMBER", "MANAGER", "ADMIN"],
    },
]

export function AppLayout({ children }: { children?: ReactNode }) {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    if (!user) return null

    const visibleNavItems = NAV_ITEMS.filter((item) =>
        item.roles.includes(user.role),
    )

    const handleLogout = () => {
        logout()
        navigate("/login", { replace: true })
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-950 text-white
          flex flex-col transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <img src={logo} alt="Sisenco Digital" className="h-14 w-auto" />
                        {/* <div className="text-sm font-semibold">Weekly Reports</div> */}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {visibleNavItems.map((item) => {
                        const Icon = item.icon
                        const isActive =
                            location.pathname === item.to ||
                            (item.to !== "/reports" && location.pathname.startsWith(item.to))
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                  transition-colors
                  ${isActive
                                        ? "bg-blue-800 text-white"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }
                `}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* User info + logout */}
                <div className="p-4 border-t border-slate-800">
                    <div className="mb-3 px-3">
                        <div className="text-sm font-medium truncate">{user.name}</div>
                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                        <div className="text-xs text-blue-400 mt-1">{user.role}</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile header */}
                <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-slate-100 rounded-md"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="text-sm font-semibold">Weekly Reports</div>
                    <div className="w-9" />
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
                        {children ?? <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    )
}
