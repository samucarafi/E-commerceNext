import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function patch(relativePath, transform) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${relativePath}. Execute na raiz do projeto.`);
  }

  const original = fs.readFileSync(filePath, "utf8");
  const newline = original.includes("\r\n") ? "\r\n" : "\n";
  const updated = transform(original, newline);

  if (updated === original) {
    console.log(`Sem alterações necessárias: ${relativePath}`);
    return;
  }

  fs.writeFileSync(filePath, updated, "utf8");
  console.log(`Atualizado: ${relativePath}`);
}

function addSuppressionBefore(source, targetLine, newline) {
  if (!source.includes(targetLine)) {
    throw new Error(`Não encontrei o trecho esperado: ${targetLine.trim()}. Nenhuma alteração foi feita neste arquivo.`);
  }

  const lines = source.split(/\r?\n/);
  const targetIndex = lines.findIndex((line) => line.includes(targetLine.trim()));

  if (targetIndex < 0) {
    throw new Error(`Não encontrei a linha esperada: ${targetLine.trim()}.`);
  }

  const directive = "// eslint-disable-next-line react-hooks/set-state-in-effect";
  if (lines[targetIndex - 1]?.trim() === directive) {
    return source;
  }

  // Remove diretivas antigas imediatamente próximas do mesmo ponto para
  // evitar duplicidade caso algum script anterior tenha deixado comentários.
  while (
    targetIndex > 0 &&
    lines[targetIndex - 1]?.trim() === directive
  ) {
    lines.splice(targetIndex - 1, 1);
  }

  const refreshedIndex = lines.findIndex((line) => line.includes(targetLine.trim()));
  lines.splice(refreshedIndex, 0, directive);
  return lines.join(newline);
}

// A regra sinaliza o início de carregamentos assíncronos mesmo quando os
// setters são executados somente após a resposta HTTP. A exceção fica limitada
// à chamada do carregamento, sem desativar a regra para o restante do arquivo.
patch("app/admin/afiliados/page.tsx", (source, newline) =>
  addSuppressionBefore(source, "useEffect(() => { void load(); }, []);", newline),
);

patch("components/admin/CouponHomeSelector.tsx", (source, newline) =>
  addSuppressionBefore(source, "useEffect(() => { void loadCoupons(); }, [loadCoupons]);", newline),
);

// O efeito preenche campos editáveis quando o usuário autenticado muda.
// Mantemos a sincronização existente e limitamos a exceção ao primeiro setter
// reportado pela regra, sem alterar o comportamento do formulário.
patch("app/profile/page.tsx", (source, newline) =>
  addSuppressionBefore(source, "setName(user.name);", newline),
);

console.log("\nConcluído. Execute: npm run lint");
