// src/pages/auth/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// supabase não é mais invocado diretamente aqui, o hook faz isso
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import useMercadoPagoCheckout from '../../hooks/useMercadoPagoCheckout';

const RegisterPage: React.FC = () => {
  const { register, authState, isAuthenticated } = useAuth();
  const user = authState.user;
  const navigate = useNavigate();
  const location = useLocation();

  const { createPreference, isLoading: isProcessingCheckoutHook, error: paymentErrorHook } = useMercadoPagoCheckout();

  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [formErrors, setFormErrors] = useState({ email: '', password: '', confirmPassword: '', general: '' });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const planIdentifierFromUrl = queryParams.get('planIdentifier');
    const planNameFromUrl = queryParams.get('planName');
    
    console.log("[RegisterPage useEffect] Verificando. Autenticado:", isAuthenticated, "User Plan:", user?.planType, "isLoading Auth:", authState.isLoading, "PlanID URL:", planIdentifierFromUrl, "isProcessingCheckoutHook:", isProcessingCheckoutHook);

    if (planIdentifierFromUrl && planNameFromUrl && isAuthenticated && user && user.planType === 'none' && !authState.isLoading && !isProcessingCheckoutHook) {
      console.log(`[RegisterPage useEffect] CONDIÇÕES ATENDIDAS. Iniciando checkout para: ${planIdentifierFromUrl}`);
      navigate(location.pathname, { replace: true }); 
      createPreference(planIdentifierFromUrl, planNameFromUrl); 
    } else {
      console.log("[RegisterPage useEffect] Condições para checkout automático NÃO atendidas.");
    }
  }, [isAuthenticated, user, location, navigate, authState.isLoading, createPreference, isProcessingCheckoutHook]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) setFormErrors(prev => ({ ...prev, [name]: '' }));
     setFormErrors(prev => ({ ...prev, general: ''}));
  };
  
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { email: '', password: '', confirmPassword: '', general: '' };
    if (!formData.email.trim()) { newErrors.email = 'Email é obrigatório'; valid = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = 'Email inválido'; valid = false; }
    if (!formData.password) { newErrors.password = 'Senha é obrigatória'; valid = false; }
    else if (formData.password.length < 6) { newErrors.password = 'Senha deve ter pelo menos 6 caracteres'; valid = false; }
    if (formData.password !== formData.confirmPassword) { newErrors.confirmPassword = 'As senhas não coincidem'; valid = false; }
    setFormErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(prev => ({ ...prev, general: ''}));
    if (!validateForm()) return;
    
    try {
      await register(formData.email, formData.password);
      // O useEffect agora lida com o início do checkout se planIdentifier estiver na URL.
      // Se não houver planIdentifier, e o registro for bem-sucedido, o usuário
      // será autenticado, e o useEffect não fará nada. Podemos redirecionar para /dashboard/plano
      // para que ele veja "Nenhum plano ativo" e escolha um.
      const queryParams = new URLSearchParams(location.search);
      if (!queryParams.get('planIdentifier') && !isProcessingCheckoutHook) { 
          navigate('/dashboard/plano');
      }
    } catch (error: any) {
      setFormErrors(prev => ({ ...prev, general: error.message || 'Falha no registro.'}));
    }
  };
  
  return (
    <MainLayout hideFooter>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold">Crie Sua Conta</h2>
            <p className="mt-2 text-text-secondary">
              Comece sua jornada escrevendo para seu futuro eu.
            </p>
          </div>
          
          <Card glow>
            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm">
                {formErrors.general}
              </div>
            )}
            {/* Mostra o erro do hook de pagamento se ele existir e não houver erro de formulário geral */}
            {paymentErrorHook && !formErrors.general && ( 
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm">
                    Erro ao iniciar pagamento: {paymentErrorHook}
                </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-text-secondary mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2" /> Email
                </label>
                <Input
                  id="email" name="email" type="email" autoComplete="email"
                  value={formData.email} onChange={handleChange} error={formErrors.email}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-text-secondary mb-2 flex items-center">
                  <Lock className="w-4 h-4 mr-2" /> Senha
                </label>
                <Input
                  id="password" name="password" type="password" autoComplete="new-password"
                  value={formData.password} onChange={handleChange} error={formErrors.password}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-text-secondary mb-2 flex items-center">
                  <Lock className="w-4 h-4 mr-2" /> Confirme a Senha
                </label>
                <Input
                  id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
                  value={formData.confirmPassword} onChange={handleChange} error={formErrors.confirmPassword}
                />
              </div>
              <div className="flex items-center">
                <input id="terms" name="terms" type="checkbox" className="h-4 w-4 border-gray-300 rounded" required />
                <label htmlFor="terms" className="ml-2 block text-sm text-text-secondary">
                  Eu concordo com os{' '}
                  <Link to="/terms" className="text-primary hover:underline">Termos de Serviço</Link>
                  {' '}e{' '}
                  <Link to="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>.
                </label>
              </div>
              
              <Button
                type="submit"
                className="w-full flex items-center justify-center"
                isLoading={authState.isLoading || isProcessingCheckoutHook}
                disabled={authState.isLoading || isProcessingCheckoutHook}
              >
                <span>Criar Conta e Continuar</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              
              <div className="text-center text-text-secondary mt-4">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-primary hover:text-primary-light">
                  Fazer Login
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;