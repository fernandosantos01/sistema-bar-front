"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import {
  Plus,
  Edit,
  ArrowLeft,
  Settings,
  Trash2,
  LayoutGrid,
  BarChart3,
  TrendingUp,
  DollarSign,
} from "lucide-react";

// --- INTERFACES ---
interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  categoria: "COMIDA" | "BEBIDA";
  disponivel: boolean;
}

interface Mesa {
  id: number;
  numero: number;
  status: string;
}

interface RelatorioItem {
  nomeProduto: string;
  quantidadeVendida: number;
  totalFaturado: number;
}

interface RelatorioFaturamento {
  faturamentoTotal: number;
  qtdPagamentos: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Dados Gerais
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);

  // Configurações
  const [editCouvert, setEditCouvert] = useState("");
  const [editGorjetaComida, setEditGorjetaComida] = useState("");
  const [editGorjetaBebida, setEditGorjetaBebida] = useState("");

  // Relatórios
  const [dataInicio, setDataInicio] = useState(
    new Date().toISOString().split("T")[0]
  ); // Hoje
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split("T")[0]
  ); // Hoje
  const [faturamento, setFaturamento] = useState<RelatorioFaturamento | null>(
    null
  );
  const [itensMaisVendidos, setItensMaisVendidos] = useState<RelatorioItem[]>(
    []
  );
  const [itensMaiorFaturamento, setItensMaiorFaturamento] = useState<
    RelatorioItem[]
  >([]);

  // Modais
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduto, setCurrentProduto] = useState<Produto | null>(null);
  const [produtoNome, setProdutoNome] = useState("");
  const [produtoDescricao, setProdutoDescricao] = useState("");
  const [produtoPreco, setProdutoPreco] = useState("");
  const [produtoCategoria, setProdutoCategoria] = useState<"COMIDA" | "BEBIDA">(
    "COMIDA"
  );
  const [produtoDisponivel, setProdutoDisponivel] = useState(true);

  const [showMesaModal, setShowMesaModal] = useState(false);
  const [novaMesaNumero, setNovaMesaNumero] = useState("");

  useEffect(() => {
    fetchData();
    fetchRelatorios(); // Carrega relatórios iniciais
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [produtosRes, configRes, mesasRes] = await Promise.all([
        api.get("/admin/produtos"),
        api.get("/admin/configuracoes"),
        api.get("/comandas/mesas"),
      ]);

      setProdutos(produtosRes.data);
      setMesas(mesasRes.data);

      const config = configRes.data;
      setEditCouvert((config.valorCouvert || 0).toString());
      setEditGorjetaComida((config.percentualGorjetaComida || 0).toString());
      setEditGorjetaBebida((config.percentualGorjetaBebida || 0).toString());
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NOVA FUNÇÃO DE RELATÓRIOS ---
  const fetchRelatorios = async () => {
    try {
      // 1. Faturamento
      const fatRes = await api.get(
        `/admin/relatorios/faturamento?inicio=${dataInicio}&fim=${dataFim}`
      );
      setFaturamento(fatRes.data);

      // 2. Rankings (Independem de data no backend atual, ou você pode adaptar)
      const vendidosRes = await api.get(
        "/admin/relatorios/itens-mais-vendidos"
      );
      setItensMaisVendidos(vendidosRes.data);

      const ricosRes = await api.get(
        "/admin/relatorios/itens-maior-faturamento"
      );
      setItensMaiorFaturamento(ricosRes.data);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    }
  };

  // --- FUNÇÕES DE PRODUTO ---
  const handleOpenNovoProdutoModal = () => {
    setIsEditMode(false);
    setCurrentProduto(null);
    setProdutoNome("");
    setProdutoDescricao("");
    setProdutoPreco("");
    setProdutoCategoria("COMIDA");
    setProdutoDisponivel(true);
    setShowProdutoModal(true);
  };

  const handleOpenEditProdutoModal = (produto: Produto) => {
    setIsEditMode(true);
    setCurrentProduto(produto);
    setProdutoNome(produto.nome);
    setProdutoDescricao(produto.descricao || "");
    setProdutoPreco(produto.preco.toString());
    setProdutoCategoria(produto.categoria);
    setProdutoDisponivel(produto.disponivel);
    setShowProdutoModal(true);
  };

  const handleSaveProduto = async () => {
    if (!produtoNome || !produtoPreco) return;
    try {
      const data = {
        nome: produtoNome,
        descricao: produtoDescricao,
        preco: Number.parseFloat(produtoPreco),
        categoria: produtoCategoria,
        disponivel: produtoDisponivel,
      };
      if (isEditMode && currentProduto) {
        await api.put(`/admin/produtos/${currentProduto.id}`, data);
      } else {
        await api.post("/admin/produtos", data);
      }
      setShowProdutoModal(false);
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto");
    }
  };

  // --- FUNÇÕES DE CONFIGURAÇÃO ---
  const handleSaveConfiguracoes = async () => {
    try {
      await api.put("/admin/configuracoes", {
        valorCouvert: Number.parseFloat(editCouvert),
        percentualGorjetaComida: Number.parseFloat(editGorjetaComida),
        percentualGorjetaBebida: Number.parseFloat(editGorjetaBebida),
      });
      alert("Configurações salvas com sucesso!");
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar configurações");
    }
  };

  // --- FUNÇÕES DE MESA ---
  const handleOpenNovaMesaModal = () => {
    setNovaMesaNumero("");
    setShowMesaModal(true);
  };

  const handleSaveMesa = async () => {
    if (!novaMesaNumero) return;
    try {
      await api.post("/admin/mesas", {
        numero: Number.parseInt(novaMesaNumero),
      });
      setShowMesaModal(false);
      alert("Mesa cadastrada com sucesso!");
      fetchData();
    } catch (error) {
      console.error("Erro ao criar mesa:", error);
      alert("Erro ao criar mesa. Verifique se o número já existe.");
    }
  };

  const handleDeleteMesa = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover esta mesa?")) return;
    try {
      await api.delete(`/admin/mesas/${id}`);
      fetchData();
      alert("Mesa removida com sucesso!");
    } catch (error: any) {
      console.error("Erro ao deletar mesa:", error);
      if (error.response?.status === 409) {
        alert("⚠️ Não é possível deletar: Esta mesa está OCUPADA.");
      } else {
        alert("Erro ao tentar deletar a mesa.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/mesas")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Área Administrativa</h1>
          <p className="text-sm text-muted-foreground">
            Gestão completa do sistema
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="produtos" className="w-full">
          {/* Adicionamos a aba RELATÓRIOS na lista */}
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="mesas">Mesas</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            <TabsTrigger value="configuracoes">Config</TabsTrigger>
          </TabsList>

          {/* --- ABA PRODUTOS --- */}
          <TabsContent value="produtos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Cardápio</h2>
              <Button onClick={handleOpenNovoProdutoModal}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left py-3 px-4">Nome</th>
                        <th className="text-right py-3 px-4">Preço</th>
                        <th className="text-center py-3 px-4">Categoria</th>
                        <th className="text-center py-3 px-4">Status</th>
                        <th className="text-center py-3 px-4 w-24">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtos.map((produto) => (
                        <tr key={produto.id} className="border-b">
                          <td className="py-3 px-4">
                            <div>{produto.nome}</div>
                            <div className="text-xs text-muted-foreground">
                              {produto.descricao}
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            R$ {produto.preco.toFixed(2)}
                          </td>
                          <td className="text-center py-3 px-4">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs ${
                                produto.categoria === "COMIDA"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {produto.categoria}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs ${
                                produto.disponivel
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {produto.disponivel ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleOpenEditProdutoModal(produto)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- ABA MESAS --- */}
          <TabsContent value="mesas" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mesas</h2>
              <Button onClick={handleOpenNovaMesaModal}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Mesa
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {mesas.map((mesa) => (
                <Card key={mesa.id} className="relative overflow-hidden group">
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground uppercase font-bold mb-1">
                      Mesa
                    </span>
                    <span className="text-4xl font-bold">{mesa.numero}</span>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        mesa.status === "LIVRE"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {mesa.status}
                    </span>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteMesa(mesa.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* --- ABA RELATÓRIOS (NOVO) --- */}
          <TabsContent value="relatorios" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-4 rounded-lg border">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> Relatórios Gerenciais
                </h2>
                <p className="text-sm text-muted-foreground">
                  Analise o desempenho do seu bar
                </p>
              </div>
              <div className="flex items-end gap-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="inicio">De</Label>
                  <Input
                    id="inicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="fim">Até</Label>
                  <Input
                    id="fim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <Button onClick={fetchRelatorios}>Filtrar</Button>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Faturamento Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {faturamento?.faturamentoTotal?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No período selecionado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pagamentos Recebidos
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {faturamento?.qtdPagamentos || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Transações realizadas
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mais Vendidos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Itens Mais Vendidos (Qtd)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {itensMaisVendidos.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">
                            {item.nomeProduto}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {item.quantidadeVendida}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              unid.
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {itensMaisVendidos.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Sem dados ainda.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Maior Faturamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Maior Faturamento (R$)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {itensMaiorFaturamento.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">
                            {item.nomeProduto}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            R$ {item.totalFaturado.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {itensMaiorFaturamento.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Sem dados ainda.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- ABA CONFIGURAÇÕES --- */}
          <TabsContent value="configuracoes" className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Configurações Globais</h2>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Valores e Taxas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="couvert">Valor do Couvert (R$)</Label>
                  <Input
                    id="couvert"
                    type="number"
                    step="0.01"
                    value={editCouvert}
                    onChange={(e) => setEditCouvert(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gorjetaComida">Gorjeta Comida (%)</Label>
                    <Input
                      id="gorjetaComida"
                      type="number"
                      step="0.01"
                      value={editGorjetaComida}
                      onChange={(e) => setEditGorjetaComida(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gorjetaBebida">Gorjeta Bebida (%)</Label>
                    <Input
                      id="gorjetaBebida"
                      type="number"
                      step="0.01"
                      value={editGorjetaBebida}
                      onChange={(e) => setEditGorjetaBebida(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveConfiguracoes} className="w-full">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAIS (MANTIDOS IGUAIS) */}
      <Dialog open={showProdutoModal} onOpenChange={setShowProdutoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={produtoNome}
                onChange={(e) => setProdutoNome(e.target.value)}
                placeholder="Ex: Coca-Cola"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={produtoDescricao}
                onChange={(e) => setProdutoDescricao(e.target.value)}
                placeholder="Ex: Lata 350ml"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={produtoPreco}
                onChange={(e) => setProdutoPreco(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={produtoCategoria}
                onValueChange={(value) =>
                  setProdutoCategoria(value as "COMIDA" | "BEBIDA")
                }
              >
                <SelectTrigger id="categoria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMIDA">Comida</SelectItem>
                  <SelectItem value="BEBIDA">Bebida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="disponivel"
                checked={produtoDisponivel}
                onCheckedChange={setProdutoDisponivel}
              />
              <Label htmlFor="disponivel">Produto Disponível</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProdutoModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProduto}
              disabled={!produtoNome || !produtoPreco}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMesaModal} onOpenChange={setShowMesaModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Mesa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="numeroMesa">Número da Mesa</Label>
              <Input
                id="numeroMesa"
                type="number"
                value={novaMesaNumero}
                onChange={(e) => setNovaMesaNumero(e.target.value)}
                placeholder="Ex: 15"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMesaModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMesa} disabled={!novaMesaNumero}>
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
