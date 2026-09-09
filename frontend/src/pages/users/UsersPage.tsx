import { useEffect, useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserModal } from "./components/UserModal"
import { DeleteUserDialog } from "./components/DeleteUserDialog"
import { usersApi } from "@/lib/api/users"
import { useAuth } from "@/context/AuthContext"
import type { User } from "@/lib/api/auth"
import type { AxiosError } from "axios"

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  MANAGER: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  MEMBER: "bg-slate-100 text-slate-700 hover:bg-slate-100",
}

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await usersApi.listAll()
      setUsers(data)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(
        axiosError.response?.data?.message ?? "Failed to load users",
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const openAddModal = () => {
    setEditingUser(null)
    setModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setModalOpen(true)
  }

  const openDeleteDialog = (user: User) => {
    setDeletingUser(user)
    setDeleteOpen(true)
  }

  if (!currentUser) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 mt-1">
            Manage team members, managers, and administrators
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-800 hover:from-slate-800 hover:via-slate-700 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <UsersIcon className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <div className="text-slate-900 font-medium mb-1">No users yet</div>
          <div className="text-slate-500 text-sm mb-4">
            Invite team members to get started.
          </div>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSelf = user.id === currentUser.id
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                      {isSelf && (
                        <span className="ml-2 text-xs text-slate-500">
                          (you)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={ROLE_STYLES[user.role]}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(user)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!isSelf && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteDialog(user)}
                            title="Deactivate"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadUsers}
        user={editingUser}
        currentUserId={currentUser.id}
      />

      <DeleteUserDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={loadUsers}
        user={deletingUser}
      />
    </div>
  )
}
