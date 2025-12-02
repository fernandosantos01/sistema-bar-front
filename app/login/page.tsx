import { LoginForm } from "@/components/login-form"
import { SlashSquare as GlassSquare } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
            <GlassSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sistema de Bar</h1>
          <p className="text-muted-foreground">Entre com suas credenciais para acessar o sistema</p>
        </div>

        <LoginForm />

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao fazer login, você concorda com nossos termos de serviço
        </p>
      </div>
    </div>
  )
}
