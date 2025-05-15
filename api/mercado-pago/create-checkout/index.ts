// api/mercado-pago/create-checkout/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig, Preference } from "mercadopago"; // SDK do Mercado Pago
import { createClient } from '@supabase/supabase-js'; // Cliente Supabase

// --- Variáveis de Ambiente do Backend (Configuradas no Vercel) ---
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN_TEST as string;
const APP_BASE_URL = process.env.APP_BASE_URL as string; // Sua URL Vercel (ex: https://carta-do-futuro.vercel.app)
const MP_WEBHOOK_URL = `${APP_BASE_URL}/api/mercado-pago/webhook`; // Seu endpoint de webhook

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string; // Ou VITE_SUPABASE_URL se assim configurado no Vercel
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string; // Ou VITE_SUPABASE_ANON_KEY

// Validação inicial das variáveis de ambiente
if (!MERCADOPAGO_ACCESS_TOKEN || !APP_BASE_URL || !MP_WEBHOOK_URL || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("CREATE-CHECKOUT: Variáveis de ambiente críticas não configuradas!");
    // Em um cenário de produção, você pode querer que a função falhe mais explicitamente aqui.
}

// Inicialização do Cliente MercadoPago
const mpClient = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Lidar com CORS Preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Em produção, restrinja ao seu domínio frontend
        res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
        res.setHeader('Access-Control-Allow-Methods', 'POST');
        return res.status(200).send('OK');
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        console.log("[API Create Checkout] Requisição POST recebida.");

        // --- Autenticação do Usuário via JWT Supabase ---
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error("[API Create Checkout] Cabeçalho de Autorização JWT ausente ou mal formatado.");
            return res.status(401).json({ error: 'Autorização JWT ausente ou inválida' });
        }
        const jwt = authHeader.split(' ')[1];

        // Cliente Supabase para validar o JWT e pegar o usuário
        const supabaseClientAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: `Bearer ${jwt}` } }
        });
        const { data: { user }, error: userError } = await supabaseClientAuth.auth.getUser();

        if (userError || !user) {
            console.error("[API Create Checkout] Erro ao autenticar usuário com JWT:", userError?.message);
            return res.status(401).json({ error: userError?.message || 'Falha na autenticação do usuário via JWT' });
        }
        const userId = user.id;
        const userEmail = user.email;
        console.log(`[API Create Checkout] Usuário autenticado: ${userId}, Email: ${userEmail}`);

        // --- Extrair planIdentifier do Corpo da Requisição ---
        const { planIdentifier } = req.body; // Vercel Functions populam req.body para JSON
        if (!planIdentifier) {
            console.error("[API Create Checkout] planIdentifier não fornecido.");
            return res.status(400).json({ error: 'Identificador do plano é obrigatório' });
        }
        console.log(`[API Create Checkout] planIdentifier recebido: ${planIdentifier}`);

        // --- Definir Detalhes do Item com Base no planIdentifier ---
        let itemTitle = '';
        let itemUnitPrice: number = 0;
        // Estes IDs são os que seu frontend envia
        if (planIdentifier === 'basic_plan_23') {
            itemTitle = 'Plano Básico - Carta do Futuro'; itemUnitPrice = 23.00;
        } else if (planIdentifier === 'full_plan_30') {
            itemTitle = 'Plano Completo - Carta do Futuro'; itemUnitPrice = 30.00;
        } else if (planIdentifier === 'upgrade_basic_to_full_7') {
            itemTitle = 'Upgrade: Básico para Completo'; itemUnitPrice = 7.00;
        } else {
            console.error(`[API Create Checkout] planIdentifier inválido: ${planIdentifier}`);
            return res.status(400).json({ error: 'Identificador do plano inválido' });
        }
        console.log(`[API Create Checkout] Item: "${itemTitle}", Preço: ${itemUnitPrice}`);

        // --- Criar Preferência de Pagamento no Mercado Pago ---
        const preference = new Preference(mpClient);
        const preferenceBody = {
            items: [{
                id: planIdentifier, title: itemTitle, quantity: 1,
                unit_price: itemUnitPrice, currency_id: "BRL",
            }],
            payer: userEmail ? { email: userEmail } : undefined,
            back_urls: {
                success: `<span class="math-inline">\{APP\_BASE\_URL\}/dashboard/plano?pagamento\=sucesso\_mp&compra\=</span>{encodeURIComponent(planIdentifier)}`,
                failure: `${APP_BASE_URL}/dashboard/plano?pagamento=falha_mp`,
                pending: `${APP_BASE_URL}/dashboard/plano?pagamento=pendente_mp`, // Ou a rota /api/mercado-pago/pending
            },
            auto_return: "approved",
            notification_url: MP_WEBHOOK_URL, // URL da sua função /api/mercado-pago/webhook
            external_reference: userId,
        };
        console.log("[API Create Checkout] Corpo da preferência para MP:", JSON.stringify(preferenceBody, null, 2));

        const createdPreference = await preference.create({ body: preferenceBody });

        if (!createdPreference.id || !createdPreference.init_point) {
            console.error("[API Create Checkout] Falha ao criar preferência no MP:", createdPreference);
            throw new Error("Não foi possível obter os detalhes da preferência do Mercado Pago.");
        }

        console.log("[API Create Checkout] Preferência MP criada:", { id: createdPreference.id, init_point: createdPreference.init_point });
        return res.status(200).json({
            preferenceId: createdPreference.id,
            initPoint: createdPreference.init_point,
        });

    } catch (err: any) {
        console.error("[API Create Checkout] Erro geral:", err);
        const errorMessage = err.response?.data?.message || err.message || "Erro desconhecido.";
        return res.status(500).json({ error: "Falha ao criar preferência de pagamento.", details: errorMessage });
    }
}