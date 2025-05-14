// src/pages/dashboard/PlanPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Adicionado Link
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase'; // Importar supabase
import { Award, ShoppingCart, Tag, AlertCircle } from 'lucide-react'; // Adicionado AlertCircle

const PlanPage: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const { user } = authState;

  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Renomeado de isUpgrading para ser mais genérico
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Identificadores dos planos (devem corresponder aos da Edge Function e do .env para o frontend)
  const PLAN_ID_BASICO_RENEW = import.meta.env.VITE_STRIPE_PRICE_ID_BASICO!; // Ou como você nomeou sua var de ambiente para o preço do básico
  const PLAN_ID_FULL_FROM_EXPIRED_BASIC = import.meta.env.VITE_STRIPE_PRICE_ID_COMPLETO!; // Preço cheio do completo
  const PLAN_ID_UPGRADE = import.meta.env.VITE_STRIPE_PRICE_ID_UPGRADE!; // Preço do upgrade (R$7)

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'N/D';
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let planStatusText = "Ativo";
  let planStatusColor = "";
  let isPlanExpired = false;

  if (user?.planType === 'basic' && user.accessExpiresAt && new Date(user.accessExpiresAt) < hoje) {
    planStatusText = "Expirado";
    planStatusColor = 'bg-red-500/20 text-red-400';
    isPlanExpired = true;
  } else if (user?.planType === 'full') {
    planStatusText = "Ativo (Vitalício)";
    planStatusColor = 'bg-green-500/20 text-green-400';
  } else if (user?.planType === 'basic') {
    planStatusText = "Ativo";
    planStatusColor = 'bg-yellow-500/20 text-yellow-400';
  }

  // Função genérica para iniciar checkout, usada por vários botões
  const startCheckout = async (planIdentifierForFunction: string, buttonLoadingStateSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!user) {
      setGeneralError("Usuário não autenticado.");
      return;
    }
    setGeneralError(null);
    buttonLoadingStateSetter(true);

    try {
      console.log(`[PlanPage] Usuário ${user.id}. Chamando create-mp-preference para: ${planIdentifierForFunction}`);
      const { data, error: functionError } = await supabase.functions.invoke('create-mp-preference', {
        body: { planIdentifier: planIdentifierForFunction },
      });

      if (functionError) throw new Error(functionError.message || JSON.stringify(functionError));
      if (!data || !data.initPoint) throw new Error('Resposta inválida do servidor (sem initPoint).');

      window.location.href = data.initPoint;
    } catch (e: any) {
      console.error("[PlanPage] Erro ao processar checkout:", e);
      setGeneralError(e.message || "Falha ao iniciar o processo de pagamento.");
      buttonLoadingStateSetter(false);
    }
    // Não resetar loading no finally se houve redirecionamento
  };
  
  const handleChoosePlan = () => { navigate('/#pricing'); };

  const basicFeatures = [
    "Cartas apenas com texto",
    "Acesso ao painel por 1 ano a partir da data da compra",
    "Agendamento de cartas para até 1 ano no futuro",
    "Suporte padrão por email",
  ];
  const fullFeatures = [
    "Cartas com texto, áudio e vídeo",
    "Acesso vitalício ao painel",
    "Agendamento de cartas para até 1 ano no futuro",
    "Suporte prioritário por email",
  ];

  let currentPlanFeatures: string[] = [];
  let planNameDisplay = "Nenhum plano ativo";
  let planDescription = "Você ainda não possui um plano ativo. Escolha um para começar!";

  if (user) { // Garante que user não é nulo para as próximas checagens
    if (user.planType === 'basic') {
      planNameDisplay = "Plano Básico";
      currentPlanFeatures = basicFeatures;
      if (isPlanExpired) {
        planDescription = `Seu acesso ao Plano Básico EXPIROU em ${formatDate(user.accessExpiresAt)}. Considere adquirir um novo plano ou fazer um upgrade.`;
      } else {
        planDescription = `Seu acesso ao Plano Básico é válido até ${formatDate(user.accessExpiresAt)}.`;
      }
    } else if (user.planType === 'full') {
      planNameDisplay = "Plano Completo";
      currentPlanFeatures = fullFeatures;
      planDescription = "Você possui acesso vitalício a todos os recursos!";
    }
  }


  if (authState.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) { // Se, mesmo após o loading, o user for nulo (erro no AuthContext)
    return (
      <DashboardLayout>
        <div className="text-center max-w-md mx-auto py-10">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro na Autenticação</h2>
            <p className="text-text-secondary mb-6">
            Não foi possível carregar os dados do seu plano. Por favor, tente fazer login novamente.
            </p>
            <Link to="/login"><Button variant="primary">Fazer Login</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  // A partir daqui, user é garantidamente não-nulo.
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Meu Plano</h1>
        <p className="text-text-secondary">
          Visualize os detalhes do seu plano atual e gerencie suas opções.
        </p>
      </div>

      {generalError && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-md text-center text-sm">
            {generalError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <div className="flex items-center mb-6">
              <Award className="text-primary mr-3" size={28} />
              <h2 className="text-xl font-serif">Detalhes do seu Plano</h2>
            </div>

            {user.planType === 'none' ? (
              <div className="text-center py-8">
                <Tag size={48} className="text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{planNameDisplay}</h3>
                <p className="text-text-secondary mb-6">{planDescription}</p>
                <Button onClick={handleChoosePlan} size="lg">
                  Escolher um Plano
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-background-dark p-6 rounded-md mb-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <span className="text-2xl text-primary font-medium block mb-1">{planNameDisplay}</span>
                      <p className="text-text-secondary text-sm">{planDescription}</p>
                    </div>
                    <div className={`self-start sm:self-center px-3 py-1 rounded-full text-sm font-medium ${planStatusColor}`}>
                        {planStatusText}
                    </div>
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
                        <span className={isPlanExpired ? 'text-text-muted line-through' : 'text-text-secondary'}>{feature}</span>
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
                        onClick={() => startCheckout('basic_plan_23', setIsProcessingPayment)} // Assumindo 'basic_plan_23' é o ID para recompra do básico
                        className="w-full sm:w-auto mb-3" 
                        variant='outline'
                        isLoading={isProcessingPayment}
                        disabled={isProcessingPayment}
                      >
                        Reativar Plano Básico (R$ 23,00)
                      </Button>
                    )}
                    <Button 
                      onClick={() => startCheckout(isPlanExpired ? 'full_plan_30' : PLAN_ID_UPGRADE, setIsProcessingPayment)} 
                      className="w-full sm:w-auto" 
                      variant="primary" 
                      size="lg"
                      isLoading={isProcessingPayment}
                      disabled={isProcessingPayment}
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

        {(user.planType === 'basic' || user.planType === 'full') && (
          <div className="lg:col-span-1">
            <Card className="bg-background-dark sticky top-24">
              <h2 className="text-xl font-serif mb-6 border-b border-primary/10 pb-4">Resumo da Conta</h2>
              {/* ... JSX do Resumo da Conta como antes ... */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-text-muted text-sm font-medium mb-1">Tipo do Plano</h3>
                  <p className="font-semibold text-lg">{planNameDisplay}</p>
                </div>
                {user.purchasedAt && (
                   <div>
                     <h3 className="text-text-muted text-sm font-medium mb-1">Plano Adquirido em</h3>
                     <p className="font-semibold">{formatDate(user.purchasedAt)}</p>
                   </div>
                )}
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