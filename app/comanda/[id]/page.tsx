"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { ArrowLeft, Plus, Trash2, DollarSign, CheckCircle } from "lucide-react";

interface ItemComanda {
  id: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  totalItem: number;
}

interface Comanda {
  id: number;
  mesaNumero: number;
  status: string;
  qtdPessoasMesa: number;
  couvertHabilitado: boolean; // No Java é 'couvertHabilitado', verifique se o JSON bate ou ajuste aqui
  itens: ItemComanda[];
  subtotalComida: number;
  subtotalBebida: number;

  // CORREÇÃO AQUI: Substitua taxaServico e couvert pelos nomes do Java
  valorGorjetaComida: number;
  valorGorjetaBebida: number;
  valorCouvert: number; // O Java manda 'valorCouvert', não 'couvert'

  totalGeral: number;
  totalPago: number; // No Java é 'totalPago'
  saldoRestante: number;
}

interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: "COMIDA" | "BEBIDA";
}

export default function ComandaPage() {
  const router = useRouter();
  const params = useParams();
  const comandaId = params.id as string;

  const [comanda, setComanda] = useState<Comanda | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos modais
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [itemToCancel, setItemToCancel] = useState<number | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedProdutoId, setSelectedProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("1");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");

  useEffect(() => {
    fetchComanda();
  }, [comandaId]);

  const fetchComanda = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/comandas/${comandaId}/resumo`);
      setComanda(response.data);
    } catch (error) {
      console.error("Erro ao buscar comanda:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCouvert = async () => {
    if (!comanda) return;
    try {
      const novoStatus = !comanda.couvertHabilitado;

      await api.patch(
        `/comandas/${comandaId}/couvert?habilitado=${novoStatus}`
      );

      fetchComanda();
    } catch (error) {
      console.error("Erro ao alterar couvert:", error);
      alert("Erro ao alterar o couvert.");
    }
  };

  const handleOpenCancelModal = (itemId: number) => {
    setItemToCancel(itemId);
    setMotivoCancelamento("");
    setShowCancelModal(true);
  };

  const handleCancelItem = async () => {
    if (!itemToCancel || !motivoCancelamento.trim()) return;
    try {
      await api.delete(`/comandas/${comandaId}/itens/${itemToCancel}`, {
        data: { motivo: motivoCancelamento },
      });
      setShowCancelModal(false);
      setItemToCancel(null);
      setMotivoCancelamento("");
      fetchComanda();
    } catch (error) {
      console.error("Erro ao cancelar item:", error);
      alert("Erro ao cancelar item");
    }
  };

  const handleOpenAddItemModal = async () => {
    try {
      const response = await api.get("/cardapio");
      setProdutos(response.data);
      setShowAddItemModal(true);
      setSelectedProdutoId("");
      setQuantidade("1");
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const handleAddItem = async () => {
    if (!selectedProdutoId || !quantidade) return;
    try {
      await api.post(`/comandas/${comandaId}/itens`, {
        produtoId: Number.parseInt(selectedProdutoId),
        quantidade: Number.parseInt(quantidade),
      });
      setShowAddItemModal(false);
      fetchComanda();
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      alert("Erro ao adicionar item");
    }
  };

  const handleOpenPaymentModal = () => {
    setValorPagamento("");
    setFormaPagamento("");
    setShowPaymentModal(true);
  };

  const handleRegistrarPagamento = async () => {
    if (!valorPagamento || !formaPagamento) return;
    try {
      await api.post(`/comandas/${comandaId}/pagar`, {
        valor: Number.parseFloat(valorPagamento),
        formaPagamento,
      });

      setShowPaymentModal(false);
      fetchComanda();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      alert("Erro ao registrar pagamento");
    }
  };

  const handleFecharConta = async () => {
    if (comanda && comanda.saldoRestante > 0) {
      alert(
        "Ainda há saldo restante. Registre o pagamento completo antes de fechar a conta."
      );
      return;
    }
    try {
      await api.post(`/comandas/${comandaId}/fechar`);
      alert("Conta fechada com sucesso!");
      router.push("/mesas");
    } catch (error) {
      console.error("Erro ao fechar conta:", error);
      alert("Erro ao fechar conta");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando comanda...</p>
        </div>
      </div>
    );
  }

  if (!comanda) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Comanda não encontrada</p>
          <Button onClick={() => router.push("/mesas")} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b bg-card sticky top-0 z-10">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Mesa {comanda.mesaNumero}</h1>
              <p className="text-sm text-muted-foreground">
                {comanda.qtdPessoasMesa} pessoa(s) - Status: {comanda.status}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="couvert"
                // Use o nome correto vindo do Java
                checked={comanda.couvertHabilitado}
                onCheckedChange={handleToggleCouvert}
              />
              <Label htmlFor="couvert" className="cursor-pointer">
                Couvert Ativo
              </Label>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Itens da Comanda</CardTitle>
          </CardHeader>
          <CardContent>
            {comanda.itens.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum item adicionado
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Produto</th>
                      <th className="text-center py-2 px-2">Qtd</th>
                      <th className="text-right py-2 px-2">Preço Unit.</th>
                      <th className="text-right py-2 px-2">Total</th>
                      <th className="text-center py-2 px-2 w-16">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comanda.itens.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-2">{item.produtoNome}</td>
                        <td className="text-center py-3 px-2">
                          {item.quantidade}
                        </td>
                        <td className="text-right py-3 px-2">
                          R$ {item.precoUnitario.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-2 font-semibold">
                          R$ {item.totalItem.toFixed(2)}
                        </td>
                        <td className="text-center py-3 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenCancelModal(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal Comida:</span>
              <span>R$ {comanda.subtotalComida?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal Bebida:</span>
              <span>R$ {comanda.subtotalBebida?.toFixed(2) || "0.00"}</span>
            </div>

            {/* CORREÇÃO: Exibindo as gorjetas separadas ou somadas */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gorjeta (Comida):</span>
              <span>R$ {comanda.valorGorjetaComida?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gorjeta (Bebida):</span>
              <span>R$ {comanda.valorGorjetaBebida?.toFixed(2) || "0.00"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Couvert:</span>
              {/* CORREÇÃO: Usando valorCouvert */}
              <span>R$ {comanda.valorCouvert?.toFixed(2) || "0.00"}</span>
            </div>

            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total Geral:</span>
              <span>R$ {comanda.totalGeral?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Valor Já Pago:</span>
              <span>R$ {comanda.totalPago.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Saldo Restante:</span>
              <span
                className={
                  comanda.saldoRestante > 0
                    ? "text-destructive"
                    : "text-green-600"
                }
              >
                R$ {comanda.saldoRestante.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-card p-4">
        <div className="container mx-auto flex gap-2">
          <Button onClick={handleOpenAddItemModal} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
          <Button
            onClick={handleOpenPaymentModal}
            variant="outline"
            className="flex-1 bg-transparent"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Registrar Pagamento
          </Button>
          <Button
            onClick={handleFecharConta}
            disabled={comanda.saldoRestante > 0}
            variant="default"
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Fechar Conta
          </Button>
        </div>
      </div>

      {/* Modal Cancelar Item */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo do Cancelamento</Label>
              <Textarea
                id="motivo"
                placeholder="Informe o motivo..."
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelItem}
              disabled={!motivoCancelamento.trim()}
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Item */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="produto">Produto</Label>
              <Select
                value={selectedProdutoId}
                onValueChange={setSelectedProdutoId}
              >
                <SelectTrigger id="produto">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id.toString()}>
                      {produto.nome} - R$ {produto.preco.toFixed(2)} (
                      {produto.categoria})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddItemModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddItem}
              disabled={!selectedProdutoId || !quantidade}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Registrar Pagamento */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={valorPagamento}
                onChange={(e) => setValorPagamento(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger id="formaPagamento">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="CARTAO">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRegistrarPagamento}
              disabled={!valorPagamento || !formaPagamento}
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
