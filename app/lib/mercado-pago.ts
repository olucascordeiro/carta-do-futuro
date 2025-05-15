// Caminho: app/lib/mercado-pago.ts (ou api/lib/mercado-pago.ts)
import { MercadoPagoConfig } from "mercadopago";
import { NextRequest, NextResponse } from "next/server"; // Se estiver no ecossistema Next.js/Vercel Functions
import crypto from "crypto";

// Busque do ambiente do SERVIDOR (configurado no Vercel)
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST as string;

if (!accessToken) {
  console.error("LIB MP: MERCADO_PAGO_ACCESS_TOKEN_TEST não está configurado no ambiente do backend!");
  // Lançar um erro aqui pode ser apropriado para impedir a inicialização se o token for crítico
}

const mpClientConfig = new MercadoPagoConfig({
  accessToken: accessToken,
  options: {
    timeout: 5000,
  }
});

export default mpClientConfig; // Exporta a configuração para ser usada para instanciar Preference, Payment, etc.

// Função para verificar assinatura do webhook (OPCIONAL - você pode validar buscando o pagamento)
// Se for usar, certifique-se que MERCADO_PAGO_WEBHOOK_SECRET está configurado no Vercel
export function verifyMercadoPagoSignature(request: NextRequest): boolean | NextResponse {
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET as string;
  if (!webhookSecret) {
    console.warn("LIB MP: MERCADO_PAGO_WEBHOOK_SECRET não configurado. Verificação de assinatura x-signature pulada.");
    return true; // Permite prosseguir, a validação principal virá da consulta à API.
  }

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id"); // Opcional, mas pode ser parte da string assinada

  if (!xSignature) {
    console.error("LIB MP: Cabeçalho x-signature ausente na notificação.");
    return NextResponse.json({ error: "Missing x-signature header" }, { status: 400 });
  }

  const parts = xSignature.split(",");
  const tsPart = parts.find(part => part.trim().startsWith("ts="));
  const hashPart = parts.find(part => part.trim().startsWith("v1="));

  if (!tsPart || !hashPart) {
    console.error("LIB MP: Formato inválido do x-signature. Faltando ts ou v1.");
    return NextResponse.json({ error: "Invalid x-signature header format" }, { status: 400 });
  }
  const ts = tsPart.split("=")[1];
  const receivedHash = hashPart.split("=")[1];

  // O 'signed_content_template' que o Mercado Pago usa para gerar a assinatura.
  // Precisa ser construído com os dados da requisição.
  // O formato exato é: id do pagamento (data.id);request-id (se enviado pelo MP);ts (timestamp).
  // O ID do pagamento geralmente vem nos query params da URL do webhook ou no corpo da notificação.
  // Esta parte é a mais complexa de acertar.
  const searchParams = request.nextUrl.searchParams;
  const paymentIdFromQuery = searchParams.get("data.id") || searchParams.get("id"); // Tenta pegar dos query params

  if (!paymentIdFromQuery && request.method === 'POST') {
      // Se POST e não está no query param, pode estar no corpo (requer clonar e ler o corpo)
      // Para simplificar, vamos assumir que para validação de assinatura, o ID relevante está no query.
      // A documentação do MP sobre 'x-signature' precisa ser seguida à risca.
      console.warn("LIB MP: ID do pagamento não encontrado nos query params para validação de x-signature. A validação pode falhar.");
  }
  
  // Construção do template da assinatura (consulte a doc do MP para o formato exato)
  // O template geralmente é: data_id;request-id;ts
  // data_id é o id do evento ou pagamento, que pode estar no query param data.id ou id
  const template = `id:${paymentIdFromQuery};request-id:${xRequestId};ts:${ts};`;
  
  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(template);
  const calculatedSignature = hmac.digest("hex");

  console.log(`LIB MP: Assinatura Calculada: ${calculatedSignature}, Assinatura Recebida: ${receivedHash}`);

  if (calculatedSignature === receivedHash) {
    console.log("LIB MP: Assinatura x-signature VERIFICADA.");
    return true;
  } else {
    console.error("LIB MP: Assinatura x-signature INVÁLIDA.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
}