// src/components/home/Pricing.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Se PricingFeature é exportado de PricingCard.tsx:
import PricingCard, { PricingFeature } from '../subscription/PricingCard'; 
// Se não, defina PricingFeature localmente aqui:
// interface PricingFeature { text: string; included: boolean; }
import Button from '../common/Button'; 
import { useAuth } from '../../contexts/AuthContext'; 
import { supabase } from '../../lib/supabase'; 
// loadStripe e stripePromise removidos

const Pricing: React.FC = () => {
  const { authState, isAuthenticated } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  const location = useLocation();

  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Identificadores dos seus planos para Mercado Pago
  const PLAN_ID_BASICO = 'basic_plan_23'; // Exemplo, use o identificador que sua Edge Function espera
  const PLAN_ID_COMPLETO = 'full_plan_30'; // Exemplo

  const startMercadoPagoCheckout = async (planIdentifier: string, planDisplayName: string) => {
    setGeneralError(null);
    setIsProcessingPayment(planIdentifier);

    if (!isAuthenticated || !user) {
      console.log(`[Pricing] Usuário não autenticado. Redirecionando para /register com planIdentifier: ${planIdentifier}`);
      navigate(`/register?planIdentifier=${planIdentifier}&planName=${encodeURIComponent(planDisplayName)}`);
      return;
    }

    try {
      console.log(`[Pricing] Usuário ${user.id} autenticado. Chamando create-mp-preference para: ${planIdentifier}`);
      const { data, error: functionError } = await supabase.functions.invoke('create-mp-preference', {
        body: { planIdentifier: planIdentifier },
      });

      if (functionError) {
        console.error("[Pricing] Erro ao invocar create-mp-preference:", functionError);
        let detailedError = 'Erro ao contatar nosso servidor.';
        if (functionError.message) {
            detailedError = functionError.message;
        } else if (typeof functionError === 'object' && functionError !== null && 'error' in functionError) {
            detailedError = (functionError as any).error?.message || JSON.stringify(functionError);
        } else {
            detailedError = JSON.stringify(functionError);
        }
        throw new Error(detailedError);
      }
      if (!data || (!data.initPoint && !data.preferenceId)) {
        console.error("[Pricing] Resposta da função create-mp-preference inválida. Data:", data);
        throw new Error('Resposta inválida do servidor ao criar preferência de pagamento.');
      }

      if (data.initPoint) {
        console.log("[Pricing] Redirecionando para Mercado Pago init_point:", data.initPoint);
        window.location.href = data.initPoint;
      } else {
        console.warn("[Pricing] init_point não recebido. Verifique a resposta da função create-mp-preference ou se seu fluxo MP requer o SDK com preferenceId.");
        setGeneralError("Não foi possível obter o link de pagamento. Tente novamente ou contate o suporte.");
        setIsProcessingPayment(null);
      }
    } catch (e: any) {
      console.error("[Pricing] Erro ao processar compra com Mercado Pago:", e);
      setGeneralError(e.message || "Falha ao iniciar o processo de pagamento.");
      setIsProcessingPayment(null); 
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const planIdentifierFromUrl = queryParams.get('planIdentifier');
    const planNameFromUrl = queryParams.get('planName');

    if (planIdentifierFromUrl && planNameFromUrl && isAuthenticated && user && user.planType === 'none' && !authState.isLoading && !isProcessingPayment) {
      console.log(`[Pricing - useEffect] Usuário autenticado após registro (planType: 'none'). Iniciando checkout para: ${planIdentifierFromUrl}`);
      navigate(location.pathname, { replace: true });
      startMercadoPagoCheckout(planIdentifierFromUrl, planNameFromUrl); 
    }
  }, [isAuthenticated, user, location, navigate, authState.isLoading, isProcessingPayment]);

  const basicFeatures: PricingFeature[] = [
    { text: 'Cartas apenas com texto', included: true },
    { text: 'Acesso ao painel por 1 ano', included: true },
    { text: 'Agendamento de até 1 ano', included: true },
    { text: 'Suporte padrão', included: true },
    { text: 'Anexar mídia (vídeo, áudio, imagem)', included: false },
    { text: 'Acesso vitalício', included: false },
  ];
  const fullFeatures: PricingFeature[] = [
    { text: 'Cartas com texto, áudio e vídeo', included: true },
    { text: 'Acesso vitalício ao painel', included: true },
    { text: 'Agendamento de até 1 ano', included: true },
    { text: 'Suporte prioritário', included: true },
  ];
  
  if (isAuthenticated && user && user.planType !== 'none') {
      const hoje = new Date();
      hoje.setHours(0,0,0,0);
      const isBasicExpired = user.planType === 'basic' && user.accessExpiresAt && new Date(user.accessExpiresAt) < hoje;
      
      if (!isBasicExpired) {
        return (
            <section id="pricing" className="py-16 md:py-24 bg-background-light">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <h2 className="text-3xl font-serif mb-4">Você Já Tem um Plano!</h2>
                    <p className="text-text-secondary mb-6">
                        Atualmente você possui o <span className="font-semibold text-primary">{user.planType === 'basic' ? 'Plano Básico' : 'Plano Completo'}</span>.
                    </p>
                    <Button onClick={() => navigate('/dashboard/plano')}>
                        Ver Detalhes do Meu Plano
                    </Button>
                </div>
            </section>
        );
      }
  }

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif mb-4">Escolha Seu Plano</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Um pagamento único para criar suas cápsulas do tempo.
          </p>
        </div>

        {generalError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-md text-center text-sm">
                {generalError}
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Plano Básico"
            price="R$ 23,00"
            features={basicFeatures}
            buttonText={isProcessingPayment === PLAN_ID_BASICO ? 'Processando...' : 'Adquirir Plano Básico'}
            onClick={() => startMercadoPagoCheckout(PLAN_ID_BASICO, 'Plano Básico')}
            disabled={isProcessingPayment !== null}
          />
          
          <PricingCard
            title="Plano Completo"
            price="R$ 30,00"
            features={fullFeatures}
            isPopular={true}
            buttonText={isProcessingPayment === PLAN_ID_COMPLETO ? 'Processando...' : 'Adquirir Plano Completo'}
            onClick={() => startMercadoPagoCheckout(PLAN_ID_COMPLETO, 'Plano Completo')}
            disabled={isProcessingPayment !== null}
          />
        </div>
      </div>
    </section>
  );
};

export default Pricing;