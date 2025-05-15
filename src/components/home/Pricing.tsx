// src/components/home/Pricing.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Adicionado Link
import PricingCard, { PricingFeature } from '../subscription/PricingCard'; // Ajuste o caminho
import Button from '../common/Button'; // Ajuste o caminho
import { useAuth } from '../../contexts/AuthContext'; // Ajuste o caminho
import useMercadoPagoCheckout from '../../hooks/useMercadoPagoCheckout'; // Ajuste o caminho

const Pricing: React.FC = () => {
  const { authState, isAuthenticated } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  const location = useLocation();

  const { createPreference, isLoading: isProcessingCheckoutHook, error: paymentErrorHook } = useMercadoPagoCheckout();

  // Estado local para feedback no botão específico clicado, se desejar.
  // Ou pode usar apenas isProcessingCheckoutHook para todos.
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  // Identificadores internos dos seus planos
  const PLAN_ID_BASICO_INTERNAL = 'basic_plan_23';
  const PLAN_ID_COMPLETO_INTERNAL = 'full_plan_30';

  const handlePurchase = async (planIdentifier: string, planDisplayName: string) => {
    setProcessingPlan(planIdentifier); // Para feedback visual no botão
    await createPreference(planIdentifier, planDisplayName); // Chama a função do hook
    // Se não houver redirecionamento (erro), o hook setará isLoading para false.
    // Se houver erro, paymentErrorHook no hook terá a mensagem.
    // Podemos resetar processingPlan se houver erro e quisermos permitir nova tentativa.
    if (useMercadoPagoCheckout().error) { // Acesso direto ao estado do hook pode precisar de ajuste
        setProcessingPlan(null);
    }
  };

  // useEffect para lidar com o checkout após o registro
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const planIdentifierFromUrl = queryParams.get('planIdentifier');
    const planNameFromUrl = queryParams.get('planName');

    if (planIdentifierFromUrl && planNameFromUrl && isAuthenticated && user && user.planType === 'none' && !authState.isLoading && !isProcessingCheckoutHook) {
      console.log(`[Pricing - useEffect] Usuário autenticado (planType: 'none'). Iniciando checkout para: ${planIdentifierFromUrl}`);
      navigate(location.pathname, { replace: true }); 
      createPreference(planIdentifierFromUrl, planNameFromUrl);
    }
  }, [isAuthenticated, user, location, navigate, authState.isLoading, createPreference, isProcessingCheckoutHook]);

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
      const isBasicPlanActiveAndNotExpired = user.planType === 'basic' && user.accessExpiresAt && new Date(user.accessExpiresAt) >= hoje;
      const isFullPlanActive = user.planType === 'full';
      
      if (isFullPlanActive || isBasicPlanActiveAndNotExpired) {
        return (
            <section id="pricing" className="py-16 md:py-24 bg-background-light">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <h2 className="text-3xl font-serif mb-4">Você Já Tem um Plano!</h2>
                    <p className="text-text-secondary mb-6">
                        Atualmente você possui o <span className="font-semibold text-primary">{user.planType === 'basic' ? 'Plano Básico' : 'Plano Completo'}</span>.
                    </p>
                    <Link to="/dashboard/plano">
                        <Button>Ver Detalhes do Meu Plano</Button>
                    </Link>
                </div>
            </section>
        );
      }
      // Se for básico expirado, permite a recompra mostrando os cards de preço abaixo.
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

        {paymentErrorHook && ( // Exibe o erro do hook
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-md text-center text-sm">
                {paymentErrorHook}
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Plano Básico"
            price="R$ 23,00"
            features={basicFeatures}
            buttonText={isProcessingCheckoutHook && processingPlan === PLAN_ID_BASICO_INTERNAL ? 'Processando...' : 'Adquirir Plano Básico'}
            onClick={() => handlePurchase(PLAN_ID_BASICO_INTERNAL, 'Plano Básico')}
            disabled={isProcessingCheckoutHook}
          />
          
          <PricingCard
            title="Plano Completo"
            price="R$ 30,00"
            features={fullFeatures}
            isPopular={true}
            buttonText={isProcessingCheckoutHook && processingPlan === PLAN_ID_COMPLETO_INTERNAL ? 'Processando...' : 'Adquirir Plano Completo'}
            onClick={() => handlePurchase(PLAN_ID_COMPLETO_INTERNAL, 'Plano Completo')}
            disabled={isProcessingCheckoutHook}
          />
        </div>
      </div>
    </section>
  );
};

export default Pricing;