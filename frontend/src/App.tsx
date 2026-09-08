import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Weekly Report Generator
        </h1>
        <Button>Get Started</Button>
        <Button variant="outline">Outline Button</Button>
      </div>
    </div>
  )
}

export default App
