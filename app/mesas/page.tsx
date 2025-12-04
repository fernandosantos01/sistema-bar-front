"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Users, LogOut, Settings, QrCode, BookOpen } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface Mesa {
    id: number
    numero: number
    status: "LIVRE" | "OCUPADA"
    comandaId?: number
}

export default function MesasPage() {
    const router = useRouter()

    // isLoading começa TRUE para bloquear a tela enquanto verificamos o login
    const [isLoading, setIsLoading] = useState(true)
    const [mesas, setMesas] = useState<Mesa[]>([])

    const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null)
    const [quantidadePessoas, setQuantidadePessoas] = useState("")
    const [isOpeningMesa, setIsOpeningMesa] = useState(false)
    const [showQrModal, setShowQrModal] = useState(false)
    const [qrMesa, setQrMesa] = useState<Mesa | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = () => {
        // 1. Verifica se tem token
        const token = localStorage.getItem("token")

        if (!token) {
            // Se não tem, manda pro login e NEM CARREGA o resto
            router.push("/login")
            return
        }

        // 2. Se tem token, configura perfil e busca dados
        const perfil = localStorage.getItem("perfil_usuario")
        setIsAdmin(perfil === "ADMIN")
        fetchMesas()
    }

    const fetchMesas = async () => {
        try {
            // Não setamos isLoading(true) aqui para não piscar a tela se já estivermos carregando
            const response = await api.get("/comandas/mesas")
            setMesas(response.data)
        } catch (error) {
            console.error("Erro ao buscar mesas:", error)
        } finally {
            // Libera a tela para aparecer
            setIsLoading(false)
        }
    }

    const handleMesaClick = (mesa: Mesa) => {
        if (mesa.status === "LIVRE") {
            setSelectedMesa(mesa)
            setQuantidadePessoas("")
        } else if (mesa.comandaId) {
            router.push(`/comanda/${mesa.comandaId}`)
        }
    }

    const handleAbrirMesa = async () => {
        if (!selectedMesa || !quantidadePessoas) return

        try {
            setIsOpeningMesa(true)
            await api.post("/comandas/abrir", {
                numeroMesa: selectedMesa.numero,
                qtdPessoas: Number.parseInt(quantidadePessoas),
            })
            setSelectedMesa(null)
            setQuantidadePessoas("")
            fetchMesas()
        } catch (error) {
            console.error("Erro ao abrir mesa:", error)
            alert("Erro ao abrir mesa. Tente novamente.")
        } finally {
            setIsOpeningMesa(false)
        }
    }

    const handleOpenQrCode = (e: React.MouseEvent, mesa: Mesa) => {
        e.stopPropagation()
        setQrMesa(mesa)
        setShowQrModal(true)
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("usuario")
        localStorage.removeItem("perfil_usuario")
        router.push("/login")
    }

    // BLOQUEIO VISUAL: Se estiver carregando ou verificando auth, mostra spinner
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando sistema...</p>
                </div>
            </div>
        )
    }

    // Se passou pelo isLoading, renderiza a tela normal
    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard de Mesas</h1>
                        <p className="text-sm text-muted-foreground">Selecione uma mesa para gerenciar</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        <Button variant="outline" size="sm" onClick={() => router.push("/cardapio")}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Cardápio
                        </Button>

                        {isAdmin && (
                            <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
                                <Settings className="h-4 w-4 mr-2" />
                                Admin
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sair
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {mesas.map((mesa) => (
                        <Card
                            key={mesa.id}
                            className={`relative cursor-pointer transition-all hover:scale-105 ${
                                mesa.status === "LIVRE"
                                    ? "bg-green-500/20 border-green-500 hover:bg-green-500/30"
                                    : "bg-red-500/20 border-red-500 hover:bg-red-500/30"
                            }`}
                            onClick={() => handleMesaClick(mesa)}
                        >
                            {mesa.status === "OCUPADA" && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1 right-1 h-8 w-8 hover:bg-background/20"
                                    onClick={(e) => handleOpenQrCode(e, mesa)}
                                    title="Ver QR Code do Cliente"
                                >
                                    <QrCode className="h-4 w-4" />
                                </Button>
                            )}

                            <CardContent className="p-6 text-center">
                                <div className="text-4xl font-bold mb-2">{mesa.numero}</div>
                                <div
                                    className={`text-sm font-semibold ${
                                        mesa.status === "LIVRE" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                                    }`}
                                >
                                    {mesa.status}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>

            <Dialog open={selectedMesa !== null} onOpenChange={(open: boolean) => !open && setSelectedMesa(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Abrir Mesa {selectedMesa?.numero}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantidadePessoas">Quantas pessoas?</Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="quantidadePessoas"
                                    type="number"
                                    min="1"
                                    placeholder="Ex: 4"
                                    value={quantidadePessoas}
                                    onChange={(e) => setQuantidadePessoas(e.target.value)}
                                    className="pl-10"
                                    disabled={isOpeningMesa}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedMesa(null)} disabled={isOpeningMesa}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAbrirMesa} disabled={!quantidadePessoas || isOpeningMesa}>
                            {isOpeningMesa ? "Abrindo..." : "Abrir Mesa"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showQrModal} onOpenChange={(open: boolean) => setShowQrModal(open)}>
                <DialogContent className="sm:max-w-sm text-center">
                    <DialogHeader>
                        <DialogTitle>Mesa {qrMesa?.numero} - Acesso do Cliente</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        {qrMesa && qrMesa.comandaId && (
                            <div className="bg-white p-4 rounded-lg shadow-inner">
                                <img
                                    src={`http://localhost:8080/qrcode/mesa/${qrMesa.comandaId}`}
                                    alt={`QR Code Mesa ${qrMesa.numero}`}
                                    className="w-48 h-48 object-contain"
                                />
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground">
                            Peça para o cliente escanear este código com a câmera do celular.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setShowQrModal(false)}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}