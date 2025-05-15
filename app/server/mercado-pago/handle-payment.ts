// app/server/mercado-pago/handle-payment.ts
import { createClient } from '@supabase/supabase-js'; // Cliente Supabase

// --- Variáveis de Ambiente para o Cliente Supabase Admin ---
// Estas devem estar configuradas no seu ambiente Vercel
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string; // Ou apenas process.env.SUPABASE_URL se não exposta ao client
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SERVER: Supabase URL ou Service Role Key não configuradas para handle-payment.");
    // Lançar um erro ou ter um fallback pode ser necessário em produção
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Identificadores de Plano Internos (devem ser os mesmos usados em create-checkout)
const PLAN_ID_BASICO = 'basic_plan_23';
const PLAN_ID_COMPLETO = 'full_plan_30';
const PLAN_ID_UPGRADE = 'upgrade_basic_to_full_7';

// Tipagem para os dados do pagamento que esperamos do Mercado Pago
// Ajuste conforme os campos que você realmente precisa e que vêm da API do MP
interface MercadoPagoPaymentData {
    id?: number | string; // ID do pagamento no Mercado Pago
    external_reference?: string; // Nosso userId do Supabase
    payer?: {
        id?: number | string; // ID do pagador no Mercado Pago
        email?: string;
    };
    additional_info?: {
        items?: Array<{
            id?: string; // Nosso planIdentifier
            title?: string;
            quantity?: number;
            unit_price?: number;
        }>;
    };
    transaction_amount?: number; // Valor total pago
    date_approved?: string; // Data da aprovação
    // Adicione outros campos que você possa precisar do objeto de pagamento do MP
}

export async function handleMercadoPagoPayment(paymentData: MercadoPagoPaymentData) {
  const userId = paymentData.external_reference;
  const mercadopagoPaymentId = paymentData.id?.toString();
  const mercadopagoPayerId = paymentData.payer?.id?.toString() || null;

  if (!userId) {
    console.error("[HandlePayment] External reference (userId) não encontrado no pagamento:", paymentData);
    // Poderia lançar um erro para ser pego pelo handler do webhook
    throw new Error("External reference (userId) ausente nos dados do pagamento.");
  }

  let planIdentifierFromItems: string | null = null;
  if (paymentData.additional_info?.items && paymentData.additional_info.items.length > 0) {
    planIdentifierFromItems = paymentData.additional_info.items[0].id || null;
  }
  const amountPaid = paymentData.transaction_amount ? parseFloat(paymentData.transaction_amount.toString()) : 0;

  let planTypeUpdate: 'basic' | 'full' | null = null;
  let accessExpiresAtUpdate: string | null = null;
  const purchasedAtUpdate = paymentData.date_approved 
                            ? new Date(paymentData.date_approved).toISOString() 
                            : new Date().toISOString();

  if (planIdentifierFromItems === PLAN_ID_BASICO || (!planIdentifierFromItems && amountPaid === 23.00)) {
    planTypeUpdate = 'basic';
    const expiryDate = new Date(purchasedAtUpdate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    accessExpiresAtUpdate = expiryDate.toISOString();
  } else if (planIdentifierFromItems === PLAN_ID_COMPLETO || (!planIdentifierFromItems && amountPaid === 30.00)) {
    planTypeUpdate = 'full';
    accessExpiresAtUpdate = null;
  } else if (planIdentifierFromItems === PLAN_ID_UPGRADE || (!planIdentifierFromItems && amountPaid === 7.00)) {
    planTypeUpdate = 'full'; // Upgrade resulta em plano 'full'
    accessExpiresAtUpdate = null;
  } else {
    console.warn(`[HandlePayment] Identificador de plano/valor pago (${planIdentifierFromItems} / ${amountPaid}) não reconhecido para usuário ${userId}. Payment ID: ${mercadopagoPaymentId}`);
    throw new Error("Plano/valor pago não reconhecido.");
  }

  console.log(`[HandlePayment] Processando atualização para Usuário: ${userId}, Plano: ${planTypeUpdate}, Payer ID MP: ${mercadopagoPayerId}, Payment ID MP: ${mercadopagoPaymentId}`);

  const { error: updateError, data: updateData } = await supabaseAdmin
    .from("users") // Sua tabela de perfis
    .update({
      plan_type: planTypeUpdate,
      access_expires_at: accessExpiresAtUpdate,
      purchased_at: purchasedAtUpdate,
      mercadopago_payer_id: mercadopagoPayerId, // Sua nova coluna
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select(); // Para retornar os dados atualizados

  if (updateError) {
    console.error(`[HandlePayment] Erro ao atualizar DB para usuário ${userId}:`, updateError);
    throw new Error(`Falha na atualização do DB: ${updateError.message}`);
  }
  if (!updateData || updateData.length === 0) {
    console.error(`[HandlePayment] Usuário ${userId} não encontrado no DB para atualização. Payment ID: ${mercadopagoPaymentId}`);
    throw new Error(`Usuário ${userId} não encontrado no DB para atualização.`);
  }

  console.log(`[HandlePayment] Usuário ${userId} atualizado para o plano ${planTypeUpdate} com sucesso.`);
  // Aqui você poderia, por exemplo, enviar um email de confirmação para o usuário
}