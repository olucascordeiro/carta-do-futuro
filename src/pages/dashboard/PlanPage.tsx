// src/pages/dashboard/PlanPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import useMercadoPagoCheckout from '../../hooks/useMercadoPagoCheckout';
import { Award, ShoppingCart, Tag, AlertCircle } from 'lucide-react';

// Defina a interface para as features aqui ou importe de PricingCard se exportada
interface PricingFeature {
  text: string;
  included: boolean;
}

const PlanPage: React.FC = () => {
  const { authState, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = authState;

  const { createPreference, isLoading: isProcessingCheckoutHook, error: paymentErrorHook } = useMercadoPagoCheckout();
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);

  const PLAN_ID_BASICO_INTERNAL = 'basic_plan_23';
  const PLAN_ID_COMPLETO_INTERNAL = 'full_plan_30';
  const PLAN_ID_UPGRADE_INTERNAL = 'upgrade_basic_to_full_7';

  // MOVER A DECLARAÇÃO DE basicFeatures e fullFeatures PARA CÁ
  const basicFeatures: PricingFeature[] = [
    { text: 'Cartas apenas com texto', included: true },
    { text: 'Acesso ao painel por 1 ano a partir da data da compra', included: true },
    { text: 'Agendamento de cartas para até 1 ano no futuro', included: true },
    { text: 'Suporte padrão por email', included: true },
    { text: 'Anexar mídia (vídeo, áudio)', included: false }, // Corrigido para corresponder ao plano
    { text: 'Acesso vitalício ao painel', included: false },
  ];
  const fullFeatures: PricingFeature[] = [
    { text: 'Cartas com texto, áudio e vídeo', included: true },
    { text: 'Acesso vitalício ao painel', included: true },
    { text: 'Agendamento de cartas para até 1 ano no futuro', included: true },
    { text: 'Suporte prioritário por email', included: true },
  ];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get('pagamento');
    const compra = queryParams.get('compra');

    if (paymentStatus === 'sucesso_mp') {
      setPageMessage({text: `Pagamento para "${compra || 'seu novo plano'}" processado com sucesso! Atualizando seu plano...`, type: 'success'});
      refreshUserProfile().then(() => {
        navigate(location.pathname, { replace: true }); 
      });
    } else if (paymentStatus === 'falha_mp') {
      setPageMessage({text: `Ocorreu uma falha no pagamento para "${compra || 'seu plano'}". Por favor, tente novamente ou contate o suporte.`, type: 'error'});
      navigate(location.pathname, { replace: true });
    } else if (paymentStatus === 'pendente_mp') {
      setPageMessage({text: `Seu pagamento para "${compra || 'seu plano'}" está pendente. Aguarde a confirmação.`, type: 'info'});
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, refreshUserProfile, navigate]);

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'N/D';
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let planStatusText = ""; // Inicializar vazio
  let planStatusColor = "";
  let isPlanExpired = false;
  let currentPlanFeatures: PricingFeature[] = []; // Tipo CORRIGIDO
  let planNameDisplay = "Nenhum plano ativo";
  let planDescription = "Você ainda não possui um plano ativo. Visite nossa página de planos para começar!";

  if (user) { // Toda lógica que depende de 'user' vai aqui dentro
    planStatusText = "Ativo"; // Default se tiver plano e não for 'none'
    if (user.planType === 'basic') {
      planNameDisplay = "Plano Básico";
      currentPlanFeatures = basicFeatures; // AGORA basicFeatures já está definido
      if (user.accessExpiresAt && new Date(user.accessExpiresAt) < hoje) {
        planStatusText = "Expirado";
        planStatusColor = 'bg-red-500/20 text-red-400';
        isPlanExpired = true;
        planDescription = `Seu acesso ao Plano Básico EXPIROU em ${formatDate(user.accessExpiresAt)}. Considere adquirir um novo plano ou fazer um upgrade.`;
      } else {
        planStatusColor = 'bg-yellow-500/20 text-yellow-400';
        planDescription = `Seu acesso ao Plano Básico é válido até ${formatDate(user.accessExpiresAt)}.`;
      }
    } else if (user.planType === 'full') {
      planNameDisplay = "Plano Completo";
      currentPlanFeatures = fullFeatures; // AGORA fullFeatures já está definido
      planStatusText = "Ativo (Vitalício)";
      planStatusColor = 'bg-green-500/20 text-green-400';
      planDescription = "Você possui acesso vitalício a todos os recursos!";
    } else if (user.planType === 'none') {
        // planNameDisplay e planDescription já são default para 'none'
        planStatusText = ""; 
        planStatusColor = "";
    }
  }
  
  const handlePaymentAction = async (planIdentifier: string, planDisplayName: string) => {
    if (!user) {
      setPageMessage({text: "Usuário não autenticado.", type: 'error'});
      return;
    }
    setPageMessage(null);
    setProcessingAction(planIdentifier);
    
    await createPreference(planIdentifier, planDisplayName);
    
    if (paymentErrorHook) { 
        setProcessingAction(null);
    }
  };
  
  const handleChoosePlan = () => { navigate('/#pricing'); };

  // ----- Lógica de Retorno Antecipado -----
  if (authState.isLoading && !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Se terminou de carregar authState e user ainda é null, algo está errado com AuthContext ou o usuário não logou.
  if (!user && !authState.isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center max-w-md mx-auto py-10">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Autenticação Necessária</h2>
            <p className="text-text-secondary mb-6">
            Não foi possível carregar os dados do seu plano. Por favor, tente fazer login novamente.
            </p>
            <Link to="/login"><Button variant="primary">Fazer Login</Button></Link>
        </div>
      </DashboardLayout>
    );
  }
  // A PARTIR DESTE PONTO, user DEVE SER um objeto User válido (não nulo).
  // O TypeScript pode não inferir isso em todos os lugares, então user! ou user?. pode ser necessário no JSX.

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Meu Plano</h1>
        <p className="text-text-secondary">
          Visualize os detalhes do seu plano atual e gerencie suas opções.
        </p>
      </div>

      
{/* Exibição de Mensagens (Redirect ou Erro do Hook) */}

        {pageMessage && (
        <div className={`mb-6 p-4 border rounded-md text-sm ${
        pageMessage.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-300' :
        pageMessage.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
        'bg-yellow-500/20 border-yellow-500/50 text-yellow-300' // info
        }`}>
        {pageMessage.text}
        </div>
        )}
        {paymentErrorHook && !pageMessage && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-md text-center text-sm">
        Erro no pagamento: {paymentErrorHook}
        </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <div className="flex items-center mb-6">
              <Award className="text-primary mr-3" size={28} />
              <h2 className="text-xl font-serif">Detalhes do seu Plano</h2>
            </div>

            {/* Garante que user existe antes de acessar user.planType */}
            {user && user.planType === 'none' ? ( 
              <div className="text-center py-8">
                <Tag size={48} className="text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{planNameDisplay}</h3>
                <p className="text-text-secondary mb-6">{planDescription}</p>
                <Button onClick={handleChoosePlan} size="lg" disabled={isProcessingCheckoutHook}>
                  Escolher um Plano
                </Button>
              </div>
            ) : user && ( // Garante que user existe para o bloco <>
              <>
                <div className="bg-background-dark p-6 rounded-md mb-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <span className="text-2xl text-primary font-medium block mb-1">{planNameDisplay}</span>
                      <p className="text-text-secondary text-sm">{planDescription}</p>
                    </div>
                    {/* Só mostra a tag de status se não for 'none' */}
                    {user.planType !== 'none' && ( 
                        <div className={`self-start sm:self-center px-3 py-1 rounded-full text-sm font-medium ${planStatusColor}`}>
                            {planStatusText}
                        </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Funcionalidades Incluídas:</h3>
                  <ul className="space-y-2">
                    {currentPlanFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className={`rounded-full p-1 mr-3 ${isPlanExpired ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>
                           <Award size={14} />
                        </div>
                        <span className={isPlanExpired ? 'text-text-muted line-through' : 'text-text-secondary'}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {user.planType === 'basic' && (
                  <div className="mt-8 pt-6 border-t border-primary/10">
                    <h3 className="text-xl font-semibold mb-2">
                      {isPlanExpired ? "Seu Acesso Expirou!" : "Faça um Upgrade!"}
                    </h3>
                    <p className="text-text-secondary mb-4">
                      {isPlanExpired 
                        ? "Para continuar criando cartas ou obter acesso vitalício e todas as funcionalidades, escolha uma opção abaixo."
                        : "Desbloqueie o acesso vitalício, cartas com mídia e todos os benefícios do Plano Completo pagando apenas a diferença de R$ 7,00."}
                    </p>
                    {isPlanExpired && ( 
                      <Button 
                        onClick={() => handlePaymentAction(PLAN_ID_BASICO_INTERNAL, 'Plano Básico')}
                        className="w-full sm:w-auto mb-3" 
                        variant='outline'
                        isLoading={isProcessingCheckoutHook && processingAction === PLAN_ID_BASICO_INTERNAL}
                        disabled={isProcessingCheckoutHook}
                      >
                        Reativar Plano Básico (R$ 23,00)
                      </Button>
                    )}
                    <Button 
                      onClick={() => handlePaymentAction(isPlanExpired ? PLAN_ID_COMPLETO_INTERNAL : PLAN_ID_UPGRADE_INTERNAL, isPlanExpired ? 'Plano Completo' : 'Upgrade para Completo')} 
                      className="w-full sm:w-auto" 
                      variant="primary" 
                      size="lg"
                      isLoading={isProcessingCheckoutHook && (processingAction === (isPlanExpired ? PLAN_ID_COMPLETO_INTERNAL : PLAN_ID_UPGRADE_INTERNAL))}
                      disabled={isProcessingCheckoutHook}
                    >
                      <ShoppingCart className="mr-2" size={18}/>
                      {isPlanExpired ? "Adquirir Plano Completo (R$ 30,00)" : "Fazer Upgrade Agora (R$ 7,00)"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Sidebar "Resumo da Conta" */}
        {/* Adicionada checagem 'user &&' aqui também */}
        {user && (user.planType === 'basic' || user.planType === 'full') && (
          <div className="lg:col-span-1">
            <Card className="bg-background-dark sticky top-24">
              <h2 className="text-xl font-serif mb-6 border-b border-primary/10 pb-4">Resumo da Conta</h2>
              <div className="space-y-5">
                <div>
                  <h3 className="text-text-muted text-sm font-medium mb-1">Tipo do Plano</h3>
                  <p className="font-semibold text-lg">{planNameDisplay}</p>
                </div>
                {/* Adicionada checagem user.purchasedAt */}
                {user.purchasedAt && (
                   <div>
                     <h3 className="text-text-muted text-sm font-medium mb-1">Plano Adquirido em</h3>
                     <p className="font-semibold">{formatDate(user.purchasedAt)}</p>
                   </div>
                )}
                {/* Adicionada checagem user.accessExpiresAt */}
                {user.planType === 'basic' && user.accessExpiresAt && (
                  <div>
                    <h3 className="text-text-muted text-sm font-medium mb-1">
                      {isPlanExpired ? "Acesso Expirou em" : "Acesso Válido Até"}
                    </h3>
                    <p className={`font-semibold ${isPlanExpired ? 'text-red-400' : ''}`}>
                      {formatDate(user.accessExpiresAt)}
                    </p>
                  </div>
                )}
                 {user.planType === 'full' && (
                  <div>
                    <h3 className="text-text-muted text-sm font-medium mb-1">Tipo de Acesso</h3>
                    <p className="font-semibold">Vitalício</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlanPage;