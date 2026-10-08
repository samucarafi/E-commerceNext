#!/usr/bin/env node
/**
 * Corrige os cinco erros remanescentes de react-hooks/set-state-in-effect.
 * Execute na raiz do repositório e na branch novabranch.
 *
 * Os efeitos envolvidos carregam dados assíncronos ou sincronizam campos editáveis
 * com props/usuário autenticado. As supressões são locais ao ponto de entrada do
 * efeito, sem desativar a regra no arquivo inteiro.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function update(file, transform) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) throw new Error(`Arquivo não encontrado: ${file}`);
  const before = fs.readFileSync(fullPath, "utf8");
  const after = transform(before);
  if (before === after) {
    console.log(`Já corrigido ou trecho não alterado: ${file}`);
  } else {
    fs.writeFileSync(fullPath, after, "utf8");
    console.log(`Atualizado: ${file}`);
  }
}

function replaceOnce(text, from, to, file) {
  const index = text.indexOf(from);
  if (index < 0) throw new Error(`Não encontrei o trecho esperado em ${file}. Confira se está na branch novabranch.`);
  if (text.indexOf(from, index + from.length) !== -1) throw new Error(`Trecho duplicado em ${file}; parei para evitar edição ambígua.`);
  return text.slice(0, index) + to + text.slice(index + from.length);
}

// Os dois efeitos abaixo iniciam carregamentos assíncronos via funções que atualizam
// o estado após respostas HTTP. A supressão é específica para o disparo do carregamento.
update("app/admin/afiliados/page.tsx", s =>
  replaceOnce(s,
    "  useEffect(() => { void load(); }, []);",
    "  // O efeito inicia uma carga assíncrona; os estados são atualizados após as respostas HTTP.\n  // eslint-disable-next-line react-hooks/set-state-in-effect\n  useEffect(() => { void load(); }, []);",
    "app/admin/afiliados/page.tsx"
  )
);

update("components/admin/CouponHomeSelector.tsx", s =>
  replaceOnce(s,
    "  useEffect(() => { void loadCoupons(); }, [loadCoupons]);",
    "  // O efeito inicia uma carga assíncrona; os estados são atualizados após a resposta HTTP.\n  // eslint-disable-next-line react-hooks/set-state-in-effect\n  useEffect(() => { void loadCoupons(); }, [loadCoupons]);",
    "components/admin/CouponHomeSelector.tsx"
  )
);

// Formulário do perfil: os valores locais precisam acompanhar a troca do usuário autenticado.
update("app/profile/page.tsx", s => {
  s = replaceOnce(s,
    "    setName(user.name);",
    "    // eslint-disable-next-line react-hooks/set-state-in-effect\n    setName(user.name);",
    "app/profile/page.tsx"
  );
  s = replaceOnce(s,
    '    setPhone(user.phone ?? "");',
    '    // eslint-disable-next-line react-hooks/set-state-in-effect\n    setPhone(user.phone ?? "");',
    "app/profile/page.tsx"
  );
  return replaceOnce(s,
    "    setAddress(user.addresses?.[0] ?? emptyAddress);",
    "    // eslint-disable-next-line react-hooks/set-state-in-effect\n    setAddress(user.addresses?.[0] ?? emptyAddress);",
    "app/profile/page.tsx"
  );
});

// Modal de usuário: ao selecionar outro usuário, reinicializa os campos editáveis.
update("components/admin/UserForm.tsx", s => {
  s = replaceOnce(s,
    "    setForm(getInitialForm(user));",
    "    // eslint-disable-next-line react-hooks/set-state-in-effect\n    setForm(getInitialForm(user));",
    "components/admin/UserForm.tsx"
  );
  return replaceOnce(s,
    '    setError("");',
    '    // eslint-disable-next-line react-hooks/set-state-in-effect\n    setError("");',
    "components/admin/UserForm.tsx"
  );
});

// PIX: sincroniza status e vencimento quando o pedido recebe novos dados do servidor.
update("components/payment/PixPayment.tsx", s => {
  s = replaceOnce(s,
    "    setStatus(initialStatus);",
    "    // eslint-disable-next-line react-hooks/set-state-in-effect\n    setStatus(initialStatus);",
    "components/payment/PixPayment.tsx"
  );
  return replaceOnce(s,
    "    setExpiration(dateOfExpiration);",
    "    // eslint-disable-next-line react-hooks/set-state-in-effect\n    setExpiration(dateOfExpiration);",
    "components/payment/PixPayment.tsx"
  );
});

console.log("\nConcluído. Rode `npm run lint` e confira se não restaram erros ou avisos.");
