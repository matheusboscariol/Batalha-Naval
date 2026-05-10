export const NIVEIS = [
  {
    id: 1,
    nome: 'Nível 1 — Recruta',
    tamanhoGrade: 5,
    navios: [2, 3],
    tipoIA: 'aleatorio',
  },
  {
    id: 2,
    nome: 'Nível 2 — Marinheiro',
    tamanhoGrade: 7,
    navios: [2, 3, 3],
    tipoIA: 'aleatorio',
  },
  {
    id: 3,
    nome: 'Nível 3 — Oficial',
    tamanhoGrade: 8,
    navios: [2, 3, 3, 4],
    tipoIA: 'cacador',
  },
  {
    id: 4,
    nome: 'Nível 4 — Comandante',
    tamanhoGrade: 9,
    navios: [2, 3, 3, 4, 4],
    tipoIA: 'direcional',
  },
  {
    id: 5,
    nome: 'Nível 5 — Almirante',
    tamanhoGrade: 10,
    navios: [2, 3, 3, 4, 4, 5],
    tipoIA: 'probabilidade',
  },
];

export function obterNivel(id) {
  return NIVEIS.find(n => n.id === id);
}
