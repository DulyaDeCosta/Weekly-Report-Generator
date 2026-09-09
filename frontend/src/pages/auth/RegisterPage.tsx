import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth.schema"
import { AuthLayout } from "@/layouts/AuthLayout"
import type { AxiosError } from "axios"

export function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true)
    try {
      const user = await registerUser(values.name, values.email, values.password)
      toast.success(`Welcome, ${user.name}!`)

      if (user.role === "MEMBER") {
        navigate("/reports/current", { replace: true })
      } else {
        navigate("/dashboard", { replace: true })
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      const message = axiosError.response?.data?.message ?? "Something went wrong. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="relative -translate-y-5 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="text-slate-500">
            Get started with your weekly reports
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              disabled={isSubmitting}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
              disabled={isSubmitting}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                disabled={isSubmitting}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                disabled={isSubmitting}
                className="pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="h-9 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-blue-800 text-base hover:from-slate-800 hover:via-slate-700 hover:to-blue-700 text-white font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
