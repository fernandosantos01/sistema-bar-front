"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { CheckCircle, Receipt } from "lucide-react";

interface ItemComanda {
  id: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  totalItem: number;
}

interface ComandaCliente {
  id: number;
  mesaNumero: number;
  status: string;
  quantidadePessoas: number;
  itens: ItemComanda[];
  subtotalComida: number;
  subtotalBebida: number;
  taxaServico: number;
  couvert: number;
  totalGeral: number;
  valorPago: number;
  saldoRestante: number;
}

export default function ClienteMesaPage() {
  const params = useParams();
  const mesaId = params.id as string;

  const [comanda, setComanda] = useState<ComandaCliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchComanda();
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchComanda, 30000);
    return () => clearInterval(interval);
  }, [mesaId]);

  const fetchComanda = async () => {
    try {
      setIsLoading(true);
      setError(false);
      // Endpoint público, sem autenticação necessária
      const response = await api.get(`/comandas/${mesaId}/resumo`);
      setComanda(response.data);
    } catch (err) {
      console.error("Erro ao buscar comanda:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando sua conta...</p>
        </div>
      </div>
    );
  }

  if (error || !comanda) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-2">Mesa não encontrada</p>
            <p className="text-sm text-muted-foreground">
              Verifique se você escaneou o QR Code correto
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isContaEncerrada =
    comanda.status === "PAGA" || comanda.status === "FECHADA";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Receipt className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Sua Conta</h1>
          <p className="text-muted-foreground">Mesa {comanda.mesaNumero}</p>
        </div>

        {/* Badge de Conta Encerrada */}
        {isContaEncerrada && (
          <Card className="bg-green-500/10 border-green-500">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                Conta Encerrada
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Obrigado pela preferência!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Informações da Mesa */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detalhes</CardTitle>
              <Badge variant={isContaEncerrada ? "default" : "secondary"}>
                {comanda.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pessoas:</span>
              <span className="font-medium">{comanda.quantidadePessoas}</span>
            </div>
          </CardContent>
        </Card>

        {/* Itens Consumidos */}
        <Card>
          <CardHeader>
            <CardTitle>Itens Consumidos</CardTitle>
          </CardHeader>
          <CardContent>
            {comanda.itens.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum item pedido ainda
              </p>
            ) : (
              <div className="space-y-3">
                {comanda.itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start pb-3 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.produtoNome}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      R$ {item.totalItem.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal Comida:</span>
              <span>R$ {comanda.subtotalComida.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal Bebida:</span>
              <span>R$ {comanda.subtotalBebida.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de Serviço:</span>
              <span>R$ {comanda.taxaServico.toFixed(2)}</span>
            </div>
            {comanda.couvert > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Couvert:</span>
                <span>R$ {comanda.couvert.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total Geral:</span>
              <span>R$ {comanda.totalGeral.toFixed(2)}</span>
            </div>
            {comanda.valorPago > 0 && (
              <>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Valor Já Pago:</span>
                  <span>R$ {comanda.valorPago.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Esta página atualiza automaticamente a cada 30 segundos</p>
          <p className="mt-1">Para adicionar itens, chame o garçom</p>
        </div>
      </div>
    </div>
  );
}
