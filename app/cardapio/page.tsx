"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { ArrowLeft, UtensilsCrossed, Wine } from "lucide-react"

interface Produto {
    id: number
    nome: string
    descricao?: string // <--- Adicionei isso
    preco: number
    categoria: "COMIDA" | "BEBIDA"
    disponivel: boolean
}

export default function CardapioPage() {
    const router = useRouter()
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchCardapio()
    }, [])

    const fetchCardapio = async () => {
        try {
            setIsLoading(true)
            const response = await api.get("/cardapio")
            setProdutos(response.data)
        } catch (error) {
            console.error("Erro ao buscar cardápio:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const produtosComida = produtos.filter((p) => p.categoria === "COMIDA")
    const produtosBebida = produtos.filter((p) => p.categoria === "BEBIDA")

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando cardápio...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Cardápio</h1>
                        <p className="text-sm text-muted-foreground">Produtos disponíveis</p>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-8">

                {/* Seção de Comidas */}
                {produtosComida.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <UtensilsCrossed className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Comidas</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {produtosComida.map((produto) => (
                                <Card key={produto.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-lg">{produto.nome}</CardTitle>
                                            <Badge variant="secondary" className="shrink-0 bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300">
                                                Comida
                                            </Badge>
                                        </div>
                                        {/* Descrição adicionada aqui */}
                                        {produto.descricao && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{produto.descricao}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="mt-auto">
                                        <p className="text-2xl font-bold text-primary">
                                            {produto.preco.toLocaleString("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            })}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Seção de Bebidas */}
                {produtosBebida.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Wine className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Bebidas</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {produtosBebida.map((produto) => (
                                <Card key={produto.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-lg">{produto.nome}</CardTitle>
                                            <Badge variant="secondary" className="shrink-0 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                                                Bebida
                                            </Badge>
                                        </div>
                                        {/* Descrição adicionada aqui */}
                                        {produto.descricao && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{produto.descricao}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="mt-auto">
                                        <p className="text-2xl font-bold text-primary">
                                            {produto.preco.toLocaleString("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            })}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {produtos.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
                    </div>
                )}
            </main>
        </div>
    )
}