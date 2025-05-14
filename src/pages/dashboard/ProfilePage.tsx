// src/pages/dashboard/ProfilePage.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase'; // Importar supabase client
import { User as UserIcon, Mail, Save, Phone, Lock as LockIcon, AlertCircle } from 'lucide-react'; // Adicionado Phone e LockIcon

const ProfilePage: React.FC = () => {
  const { authState, refreshUserProfile } = useAuth(); // Pegar refreshUserProfile
  const { user } = authState;

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');
  const [profileErrorMessage, setProfileErrorMessage] = useState('');

  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  
  const [profileFormData, setProfileFormData] = useState({
    email: '',
    name: '',
    phone: '',
  });

  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '', // Supabase não usa currentPassword para updateUser, mas útil para UI
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileFormData({
        email: user.email || '',
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]); // Popular o formulário quando o usuário do contexto mudar
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
    setProfileSuccessMessage('');
    setProfileErrorMessage('');
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({ ...prev, [name]: value }));
    setPasswordSuccessMessage('');
    setPasswordErrorMessage('');
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsProfileLoading(true);
    setProfileSuccessMessage('');
    setProfileErrorMessage('');
    
    try {
      const updates = {
        // O email não é atualizado aqui, pois geralmente requer um fluxo de verificação.
        // Apenas dados que estão na sua tabela public.users (exceto id e email)
        name: profileFormData.name || null, // Enviar null se vazio para limpar
        phone: profileFormData.phone || null, // Enviar null se vazio para limpar
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users') // Sua tabela de perfis
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfileSuccessMessage('Perfil atualizado com sucesso!');
      await refreshUserProfile(); // Força o AuthContext a buscar os dados atualizados
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      setProfileErrorMessage(error.message || 'Falha ao atualizar o perfil.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
      setPasswordErrorMessage('As novas senhas não coincidem.');
      return;
    }
    if (passwordFormData.newPassword.length < 6) {
      setPasswordErrorMessage('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsPasswordLoading(true);
    setPasswordSuccessMessage('');
    setPasswordErrorMessage('');

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: passwordFormData.newPassword 
      });

      if (error) throw error;

      setPasswordSuccessMessage('Senha alterada com sucesso!');
      setPasswordFormData({ currentPassword: '', newPassword: '', confirmNewPassword: ''}); // Limpa campos
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      setPasswordErrorMessage(error.message || 'Falha ao alterar a senha.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Lógica para exibir o nome do plano e status (similar à PlanPage)
  let planDisplayName = "Nenhum Plano Ativo";
  let showUpgradeButton = true;
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  let isBasicPlanExpired = false;

  if (user) {
      if (user.planType === 'basic') {
          planDisplayName = "Plano Básico";
          if (user.accessExpiresAt && new Date(user.accessExpiresAt) < hoje) {
              planDisplayName += " (Expirado)";
              isBasicPlanExpired = true;
          }
      } else if (user.planType === 'full') {
          planDisplayName = "Plano Completo"; // Removido (Vitalício) para ficar mais curto aqui
          showUpgradeButton = false;
      }
  }
  
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'N/D';
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Configurações do Perfil</h1>
        <p className="text-text-secondary">
          Gerencie suas informações de conta e preferências.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8"> {/* Adicionado space-y-8 */}
          <Card>
            <h2 className="text-xl font-serif mb-6">Informações Pessoais</h2>
            {profileSuccessMessage && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-md text-green-300 text-sm">
                {profileSuccessMessage}
              </div>
            )}
            {profileErrorMessage && (
  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm flex items-center"> {/* Adicionado flex e items-center */}
    <AlertCircle size={18} className="mr-2 flex-shrink-0" /> {/* Ícone usado aqui */}
    {profileErrorMessage}
  </div>
            )}
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <Input
                label="Nome de Exibição" name="name" value={profileFormData.name}
                onChange={handleProfileChange} placeholder="Seu nome completo"
                icon={<UserIcon className="w-4 h-4 text-text-muted" />} // Ícone UserIcon
              />
              <Input
                label="Endereço de Email" name="email" type="email"
                value={profileFormData.email} disabled 
                icon={<Mail className="w-4 h-4 text-text-muted" />}
              />
              <Input
                label="Telefone (Opcional)" name="phone" type="tel"
                value={profileFormData.phone} onChange={handleProfileChange}
                placeholder="(XX) XXXXX-XXXX"
                icon={<Phone className="w-4 h-4 text-text-muted" />} // Ícone Phone
              />
              <div>
                <Button type="submit" isLoading={isProfileLoading} className="flex items-center">
                  <Save className="mr-2" size={18} /> Salvar Alterações
                </Button>
              </div>
            </form>
          </Card>
          
          <Card>
            <h2 className="text-xl font-serif mb-6">Alterar Senha</h2>
            {passwordSuccessMessage && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-md text-green-300 text-sm">
                {passwordSuccessMessage}
              </div>
            )}
            {passwordErrorMessage && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm">
                {passwordErrorMessage}
              </div>
            )}
            <form onSubmit={handleChangePasswordSubmit} className="space-y-6">
              {/* Supabase não exige a senha atual para mudar a senha se o usuário já está logado.
                  Se quiser essa camada extra, precisaria de uma lógica customizada.
              <Input
                label="Senha Atual" name="currentPassword" type="password"
                value={passwordFormData.currentPassword} onChange={handlePasswordChange}
                placeholder="Digite sua senha atual"
                icon={<LockIcon className="w-4 h-4 text-text-muted" />}
              /> */}
              <Input
                label="Nova Senha" name="newPassword" type="password"
                value={passwordFormData.newPassword} onChange={handlePasswordChange}
                placeholder="Mínimo 6 caracteres"
                icon={<LockIcon className="w-4 h-4 text-text-muted" />}
              />
              <Input
                label="Confirmar Nova Senha" name="confirmNewPassword" type="password"
                value={passwordFormData.confirmNewPassword} onChange={handlePasswordChange}
                placeholder="Repita a nova senha"
                icon={<LockIcon className="w-4 h-4 text-text-muted" />}
              />
              <div>
                <Button type="submit" isLoading={isPasswordLoading}>
                  Atualizar Senha
                </Button>
              </div>
            </form>
          </Card>
        </div>
        
        {/* Coluna do Resumo da Conta */}
        {user && ( // Só mostra o resumo se o usuário existir
            <div className="lg:col-span-1">
                <Card className="bg-background-dark sticky top-24"> {/* Adicionado sticky */}
                    <h2 className="text-xl font-serif mb-6 border-b border-primary/10 pb-3">Resumo da Conta</h2>
                    <div className="space-y-5">
                        <div>
                            <h3 className="text-text-muted text-sm font-medium mb-1">Tipo do Plano</h3>
                            <p className="font-semibold text-lg">{planDisplayName}</p>
                        </div>
                        {user.purchasedAt && (
                            <div>
                                <h3 className="text-text-muted text-sm font-medium mb-1">Membro Desde</h3>
                                <p className="font-semibold">{formatDate(user.purchasedAt)}</p>
                            </div>
                        )}
                        {user.planType === 'basic' && user.accessExpiresAt && (
                            <div>
                                <h3 className="text-text-muted text-sm font-medium mb-1">
                                {isBasicPlanExpired ? "Acesso Expirou em" : "Acesso Válido Até"}
                                </h3>
                                <p className={`font-semibold ${isBasicPlanExpired ? 'text-red-400' : ''}`}>
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
                        
                        {/* Informações estáticas de cartas (a serem tornadas dinâmicas) */}
                        {/* <div>
                            <h3 className="text-text-muted text-sm mb-1">Cartas Escritas</h3>
                            <p className="font-medium">0</p> 
                        </div>
                        <div>
                            <h3 className="text-text-muted text-sm mb-1">Cartas Entregues</h3>
                            <p className="font-medium">0</p>
                        </div> */}
                        
                        {(showUpgradeButton || isBasicPlanExpired) && user.planType !== 'full' && (
                        <div className="pt-5 border-t border-primary/20">
                            <Link to="/dashboard/plano">
                            <Button variant="primary" className="w-full">
                                {user.planType === 'none' ? 'Escolher um Plano' : 
                                 isBasicPlanExpired ? 'Renovar ou Fazer Upgrade' : 'Fazer Upgrade'}
                            </Button>
                            </Link>
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

export default ProfilePage;