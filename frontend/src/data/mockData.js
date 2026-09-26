// Placeholder data so the frontend can be built and reviewed on its own.
// Once the backend/API is ready, swap these constants for real fetch calls
// (e.g. inside a `useEffect` or a data-fetching hook) — the screens already
// consume this shape, so wiring real data in should just mean replacing
// the import with the response from the API.

export const student = {
  name: 'Mariana',
  initials: 'MS',
  school: 'ETEC Rodrigues de Abreu',
  course: 'Técnico em Desenvolvimento de Sistemas',
  moduleInfo: '2º Módulo · Turma B',
  todayLabel: 'Quinta, 23 de junho',
};

export const home = {
  lunchToday: 'Estrogonofe',
  nextClass: 'Lab. de Redes',
  announcements: [
    {
      id: '1',
      title: 'Reunião de pais e mestres',
      description: 'Sábado, 28/06 às 9h no auditório.',
      highlighted: true,
    },
    {
      id: '2',
      title: 'Entrega de projeto · Banco de Dados',
      description: 'Prazo final na próxima sexta-feira.',
      highlighted: false,
    },
  ],
};

export const lunch = {
  dateLabel: 'Quinta-feira, 23 de junho',
  menu: [
    { id: 'main', label: 'Prato principal', value: 'Estrogonofe de frango', icon: '🍛' },
    { id: 'sides', label: 'Acompanhamentos', value: 'Arroz, batata palha e feijão', icon: '🍚' },
    { id: 'salad', label: 'Salada', value: 'Alface, tomate e cenoura', icon: '🥗' },
    { id: 'dessert', label: 'Sobremesa', value: 'Laranja', icon: '🍊' },
  ],
  vegetarianNote: 'Opção vegetariana disponível mediante solicitação prévia.',
};

export const report = {
  bimesterLabel: '2º Bimestre · 2026',
  average: 8.4,
  attendance: 94,
  subjects: [
    { id: '1', name: 'Banco de Dados', grade: 9.2, absences: 1, frequency: 97 },
    { id: '2', name: 'Programação Web', grade: 8.7, absences: 2, frequency: 95 },
    { id: '3', name: 'Matemática', grade: 7.1, absences: 4, frequency: 89 },
    { id: '4', name: 'Inglês Técnico', grade: 8.5, absences: 0, frequency: 100 },
  ],
  observations: [
    {
      id: '1',
      teacher: 'Prof. Ricardo',
      subject: 'Banco de Dados',
      initials: 'RC',
      text: 'Excelente desempenho nas atividades práticas e entregas dentro do prazo.',
    },
  ],
};

// One schedule entry per weekday. Each class has a `color` key used to
// tint the card's left border and the location tag.
export const schedule = {
  Seg: [
    { id: '1', time: '07:30', subject: 'Matemática', teacher: 'Profª. Ana', location: 'Sala 12', color: 'warning' },
    { id: '2', time: '09:20', subject: 'Inglês Técnico', teacher: 'Prof. Diego', location: 'Sala 8', color: 'info' },
    { id: '3', time: '11:00', isBreak: true, label: 'Intervalo · Almoço' },
    { id: '4', time: '12:00', subject: 'Banco de Dados', teacher: 'Prof. Ricardo', location: 'Laboratório 1', color: 'success' },
  ],
  Ter: [
    { id: '1', time: '07:30', subject: 'Programação Web', teacher: 'Prof. Ricardo', location: 'Laboratório 3', color: 'primary' },
    { id: '2', time: '09:20', subject: 'Matemática', teacher: 'Profª. Ana', location: 'Sala 12', color: 'warning' },
    { id: '3', time: '11:00', isBreak: true, label: 'Intervalo · Almoço' },
    { id: '4', time: '12:00', subject: 'Inglês Técnico', teacher: 'Prof. Diego', location: 'Sala 8', color: 'info' },
  ],
  Qua: [
    { id: '1', time: '07:30', subject: 'Banco de Dados', teacher: 'Prof. Ricardo', location: 'Laboratório 1', color: 'success' },
    { id: '2', time: '09:20', subject: 'Laboratório de Redes', teacher: 'Prof. Marcos', location: 'Lab. de Redes', color: 'info' },
    { id: '3', time: '11:00', isBreak: true, label: 'Intervalo · Almoço' },
    { id: '4', time: '12:00', subject: 'Programação Web', teacher: 'Prof. Ricardo', location: 'Laboratório 3', color: 'primary' },
  ],
  Qui: [
    { id: '1', time: '07:30', subject: 'Programação Web', teacher: 'Prof. Ricardo', location: 'Laboratório 3', color: 'primary' },
    { id: '2', time: '09:20', subject: 'Laboratório de Redes', teacher: 'Prof. Marcos', location: 'Lab. de Redes', color: 'info' },
    { id: '3', time: '11:00', isBreak: true, label: 'Intervalo · Almoço' },
    { id: '4', time: '12:00', subject: 'Matemática', teacher: 'Profª. Ana', location: 'Sala 12', color: 'warning' },
    { id: '5', time: '13:40', subject: 'Banco de Dados', teacher: 'Prof. Ricardo', location: 'Laboratório 1', color: 'success' },
  ],
  Sex: [
    { id: '1', time: '07:30', subject: 'Inglês Técnico', teacher: 'Prof. Diego', location: 'Sala 8', color: 'info' },
    { id: '2', time: '09:20', subject: 'Programação Web', teacher: 'Prof. Ricardo', location: 'Laboratório 3', color: 'primary' },
    { id: '3', time: '11:00', isBreak: true, label: 'Intervalo · Almoço' },
    { id: '4', time: '12:00', subject: 'Banco de Dados', teacher: 'Prof. Ricardo', location: 'Laboratório 1', color: 'success' },
  ],
};

export const weekDays = [
  { key: 'Seg', label: 'Seg' },
  { key: 'Ter', label: 'Ter' },
  { key: 'Qua', label: 'Qua' },
  { key: 'Qui', label: 'Qui' },
  { key: 'Sex', label: 'Sex' },
];
