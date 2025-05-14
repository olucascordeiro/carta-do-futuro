// src/components/home/Pricing.tsx (ou o nome do seu componente de preços da HomePage)
import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import { useNavigate, useLocation } from 'react-router-dom'; // Adicionado useLocation
import PricingCard from '../subscription/PricingCard'; // Ajuste o caminho se necessário
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

// Carregar o Stripe fora do componente para não recarregar a cada renderização
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const Pricing: React.FC = () => {
  const { authState, isAuthenticated } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  const location = useLocation(); // Para ler query params

  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null); // 'Básico', 'Completo' ou null
  const [generalError, setGeneralError] = useState<string | null>(null);

  // IDs dos Preços do Stripe (do seu .env.local)
  const basicPlanPriceId = import.meta.env.VITE_STRIPE_PRICE_ID_BASICO!;
  const fullPlanPriceId = import.meta.env.VITE_STRIPE_PRICE_ID_COMPLETO!;
  // Se você tiver um Price ID específico para RECOMPRA do básico (caso o anterior tenha expirado e ele queira o básico de novo)
  // const basicPlanRepurchasePriceId = import.meta.env.VITE_STRIPE_PRICE_ID_BASICO_REPURCHASE || basicPlanPriceId;


  // Verifica se há um priceId na URL (após login/registro) para iniciar o checkout
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const priceIdFromUrl = queryParams.get('priceId');
    const planNameFromUrl = queryParams.get('planName');

    if (priceIdFromUrl && planNameFromUrl && isAuthenticated && user && user.planType === 'none') {
      // Limpa os query params da URL para não tentar o checkout de novo no refresh
      navigate(location.pathname, { replace: true }); 
      console.log(`Usuário autenticado com planType 'none', iniciando checkout para priceId: ${priceIdFromUrl}`);
      handlePurchase(priceIdFromUrl, planNameFromUrl, true); // true indica que o usuário já está logado
    }
  }, [isAuthenticated, user, location, navigate]); // Adicionadas dependências


  const handlePurchase = async (priceId: string, planName: string, userIsAlreadyAuthenticated = isAuthenticated) => {
    setGeneralError(null);
    setIsProcessingPayment(planName);

    if (!userIsAlreadyAuthenticated || !user) {
      console.log("Usuário não autenticado ou dados do usuário não disponíveis, redirecionando para registro com priceId:", priceId);
      navigate(`/register?priceId=${priceId}&planName=${encodeURIComponent(planName)}`);
      // Não resetar isProcessingPayment aqui, pois a navegação ocorre.
      return;
    }

    // Usuário está logado, prosseguir com a criação da sessão de checkout
    try {
      console.log(`[Pricing] Chamando create-checkout-session para usuário ${user.id} e priceId ${priceId}`);
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId: priceId,
          // userId e userEmail são pegos pela função no backend a partir do token JWT
          // stripeCustomerId também pode ser buscado pela função se o usuário já tiver um
        },
      });

      if (functionError) {
        console.error("[Pricing] Erro ao invocar create-checkout-session:", functionError);
        throw new Error(`Erro da função: ${functionError.message || JSON.stringify(functionError)}`);
      }
      if (!data || !data.sessionId) {
        console.error("[Pricing] Session ID não recebido da função. Data:", data);
        throw new Error('Session ID não foi retornado pela função.');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        console.error("[Pricing] Stripe.js não carregou.");
        throw new Error('Stripe.js não carregou.');
      }

      console.log("[Pricing] Redirecionando para Stripe Checkout com session ID:", data.sessionId);
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      
      if (stripeError) {
        console.error("[Pricing] Erro ao redirecionar para o Stripe Checkout:", stripeError);
        setGeneralError(stripeError.message || "Ocorreu um erro durante o redirecionamento para o pagamento.");
      }
    } catch (e: any) {
      console.error("[Pricing] Erro ao processar compra:", e);
      setGeneralError(e.message || "Falha ao iniciar o processo de pagamento.");
    } finally {
      setIsProcessingPayment(null);
    }
  };

  const basicFeatures = [
    { text: 'Cartas apenas com texto', included: true },
    { text: 'Acesso ao painel por 1 ano', included: true },
    { text: 'Agendamento de até 1 ano', included: true },
    { text: 'Suporte padrão', included: true },
    { text: 'Anexar mídia (vídeo, áudio, imagem)', included: false },
    { text: 'Acesso vitalício', included: false },
  ];
  const fullFeatures = [
    // Ajuste as features do Plano Completo. Se ele inclui tudo do básico + mais, liste tudo.
    { text: 'Cartas com texto, áudio e vídeo', included: true },
    { text: 'Acesso vitalício ao painel', included: true },
    { text: 'Agendamento de até 1 ano', included: true },
    { text: 'Suporte prioritário', included: true },
  ];
  
  // Se o usuário já está logado E tem um plano que não seja 'none'
  if (isAuthenticated && user && user.planType !== 'none') {
      return (
        <section id="pricing" className="py-16 md:py-24 bg-background-light"> {/* Use um fundo diferente ou o mesmo */}
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

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif mb-4">Escolha Seu Plano</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Um pagamento único para guardar suas memórias e reflexões.
          </p>
        </div>

        {generalError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-md text-center">
                {generalError}
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Plano Básico"
            price="R$ 23,00"
            features={basicFeatures}
            buttonText={isProcessingPayment === 'Básico' ? 'Processando...' : 'Adquirir Plano Básico'}
            onClick={() => handlePurchase(basicPlanPriceId, 'Básico')}
            disabled={isProcessingPayment !== null}
          />
          
          <PricingCard
            title="Plano Completo"
            price="R$ 30,00"
            features={fullFeatures}
            isPopular={true}
            buttonText={isProcessingPayment === 'Completo' ? 'Processando...' : 'Adquirir Plano Completo'}
            onClick={() => handlePurchase(fullPlanPriceId, 'Completo')}
            disabled={isProcessingPayment !== null}
          />
        </div>
      </div>
    </section>
  );
};

export default Pricing;