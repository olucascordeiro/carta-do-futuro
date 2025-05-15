// src/hooks/useMercadoPagoCheckout.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Usando React Router DOM
import { supabase } from "../lib/supabase"; // Seu cliente Supabase do frontend

const useMercadoPagoCheckout = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPreferenceAndRedirect = async (planIdentifier: string, planDisplayNameForNav?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Pega a sessão atual do Supabase para obter o token JWT
      const sessionResponse = await supabase.auth.getSession();
      if (sessionResponse.error || !sessionResponse.data.session) {
        // Se não houver sessão, redireciona para o login/registro,
        // passando o planIdentifier para ser pego depois.
        console.log("[useMercadoPagoCheckout] Usuário não logado, redirecionando para registro.");
        const targetUrl = `/register?planIdentifier=${planIdentifier}${planDisplayNameForNav ? `&planName=${encodeURIComponent(planDisplayNameForNav)}` : ''}`;
        navigate(targetUrl);
        setIsLoading(false); // Para o loading aqui, pois estamos redirecionando
        return; // Interrompe a execução
      }
      
      const accessToken = sessionResponse.data.session.access_token;

      // 2. Chama o SEU backend (API Route do Next.js / Vercel Serverless Function)
      // Certifique-se de que a URL do seu backend está correta.
      // Se o backend estiver no mesmo deploy Vercel que o frontend, pode ser um caminho relativo.
      // Se for um domínio diferente, use a URL completa.
      console.log(`[useMercadoPagoCheckout] Chamando API backend para criar preferência: /api/mercado-pago/create-checkout`);
      const response = await fetch("/api/mercado-pago/create-checkout", { // <<<< Ajuste este caminho se necessário
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // Envia o token JWT do Supabase para sua API
        },
        body: JSON.stringify({ planIdentifier }), // Envia o identificador do plano
      });

      const data = await response.json();

      if (!response.ok) {
        // Se a resposta não for OK, pega a mensagem de erro do corpo da resposta do seu backend
        console.error("[useMercadoPagoCheckout] Erro da API backend:", data);
        throw new Error(data.error || data.details || "Falha ao criar preferência de pagamento no servidor.");
      }

      // 3. Redireciona para o init_point do Mercado Pago
      if (data.initPoint) {
        console.log("[useMercadoPagoCheckout] Preferência criada, redirecionando para init_point:", data.initPoint);
        window.location.href = data.initPoint;
      } else {
        // Se o init_point não vier, mas o preferenceId sim, você poderia usar o SDK JS do MP aqui,
        // mas para Checkout Pro, o init_point é o esperado.
        console.error("[useMercadoPagoCheckout] init_point não recebido do backend. Resposta:", data);
        throw new Error("Resposta inválida do backend (sem init_point para redirecionamento).");
      }
      // Não setar isLoading para false aqui, pois o redirecionamento deve ocorrer.
      // O estado de loading será resetado se o usuário voltar ou se a página recarregar.

    } catch (err: any) {
      console.error("Erro em createPreferenceAndRedirect:", err);
      setError(err.message || "Ocorreu um erro ao iniciar o pagamento.");
      setIsLoading(false); // Seta loading para false em caso de erro ANTES do redirect
    }
  };

  return { createPreference: createPreferenceAndRedirect, isLoading, error };
};

export default useMercadoPagoCheckout;