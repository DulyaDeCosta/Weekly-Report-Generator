import { useEffect, useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Plus, Pencil, Trash2, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProjectModal } from "../components/ProjectModal"
import { DeleteProjectDialog } from "../components/DeleteProjectDialog"
import { projectsApi } from "@/lib/api/projects"
import type { Project } from "@/lib/api/reports"
import type { AxiosError } from "axios"

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const data = await projectsApi.listAll()
      setProjects(data)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(
        axiosError.response?.data?.message ?? "Failed to load projects",
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const openAddModal = () => {
    setEditingProject(null)
    setModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setModalOpen(true)
  }

  const openDeleteDialog = (project: Project) => {
    setDeletingProject(project)
    setDeleteOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">
            Manage the projects team members can select for their reports
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-800 hover:from-slate-800 hover:via-slate-700 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <FolderKanban className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <div className="text-slate-900 font-medium mb-1">No projects yet</div>
          <div className="text-slate-500 text-sm mb-4">
            Create your first project so team members can start reporting on it.
          </div>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell className="text-slate-600 max-w-md">
                    <div className="truncate">
                      {project.description ?? "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {format(new Date(project.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(project)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteDialog(project)}
                        title="Delete"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadProjects}
        project={editingProject}
      />

      <DeleteProjectDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={loadProjects}
        project={deletingProject}
      />
    </div>
  )
}
