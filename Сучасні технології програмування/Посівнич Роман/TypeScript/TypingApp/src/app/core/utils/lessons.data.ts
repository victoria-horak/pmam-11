import { Lesson } from "../modules/interfaces/lesson";

export const LESSONS: Lesson[] = [
  // ==============================
  // 1–8: Home row (вже існуючі уроки)
  // ==============================
  {
    id: 1,
    title: 'Letter Pair: F and J',
    description: 'Practice index fingers on F and J.',
    keys: ['f', 'j'],
    language: 'en'
  },
  {
    id: 1,
    title: 'Друкуємо букви: А та О',
    description: 'Тренування вказівних пальців на літери А і О.',
    keys: ['а', 'о'],
    language: 'uk'
  },
  {
    id: 2,
    title: 'Letter Pair: D and K',
    description: 'Practice middle fingers on D and K.',
    keys: ['d', 'k'],
    language: 'en'
  },
  {
    id: 2,
    title: 'Друкуємо букви: В та Л',
    description: 'Тренування середніх пальців на літери В і Л.',
    keys: ['в', 'л'],
    language: 'uk'
  },
  {
    id: 3,
    title: 'Letter Pair: S and L',
    description: 'Practice ring fingers on S and L.',
    keys: ['s', 'l'],
    language: 'en'
  },
  {
    id: 3,
    title: 'Друкуємо букви: І та Д',
    description: 'Тренування безіменних пальців на літери І і Д.',
    keys: ['і', 'д'],
    language: 'uk'
  },
  {
    id: 4,
    title: 'Letter Pair: A and ;',
    description: 'Practice pinky fingers on A and ;',
    keys: ['a', ';'],
    language: 'en'
  },
  {
    id: 4,
    title: 'Друкуємо букви: Ф та Ж',
    description: 'Тренування мізинців на літери Ф і Ж.',
    keys: ['ф', 'ж'],
    language: 'uk'
  },
  {
    id: 5,
    title: 'Combo: F, J, D, K',
    description: 'Combine index and middle finger keys.',
    keys: ['f', 'j', 'd', 'k'],
    language: 'en'
  },
  {
    id: 5,
    title: 'Комбінація: А, О, В, Л',
    description: 'Комбіноване тренування вказівних і середніх пальців.',
    keys: ['а', 'о', 'в', 'л'],
    language: 'uk'
  },
  {
    id: 6,
    title: 'Combo: S, L, A, ;',
    description: 'Combine ring and pinky finger keys.',
    keys: ['s', 'l', 'a', ';'],
    language: 'en'
  },
  {
    id: 6,
    title: 'Комбінація: І, Д, Ф, Ж',
    description: 'Комбінація безіменних і мізинців.',
    keys: ['і', 'д', 'ф', 'ж'],
    language: 'uk'
  },
  {
    id: 7,
    title: 'Home Row Practice',
    description: 'Practice all home row keys in sequence.',
    keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    language: 'en'
  },
  {
    id: 7,
    title: 'Практика домашнього ряду',
    description: 'Тренуйте всі клавіші домашнього ряду по порядку.',
    keys: ['ф', 'і', 'в', 'а', 'о', 'л', 'д', 'ж'],
    language: 'uk'
  },
  {
    id: 8,
    title: 'Home Row Sentences',
    description: 'Type sentences using only home row letters.',
    keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    language: 'en'
  },
  {
    id: 8,
    title: 'Речення домашнього ряду',
    description: 'Друкуйте речення лише з літер домашнього ряду.',
    keys: ['ф', 'і', 'в', 'а', 'о', 'л', 'д', 'ж'],
    language: 'uk'
  },

  // ==============================
  // 9–16: Top row
  // ==============================
  {
    id: 9,
    title: 'Letter Pair: R and U',
    description: 'Practice index fingers on R and U.',
    keys: ['r', 'u'],
    language: 'en'
  },
  {
    id: 9,
    title: 'Друкуємо букви: Р та У',
    description: 'Тренування вказівних пальців на літери Р і У.',
    keys: ['р', 'у'],
    language: 'uk'
  },
  {
    id: 10,
    title: 'Letter Pair: E and I',
    description: 'Practice middle fingers on E and I.',
    keys: ['e', 'i'],
    language: 'en'
  },
  {
    id: 10,
    title: 'Друкуємо букви: Е та І',
    description: 'Тренування середніх пальців на літери Е і І (топ-ряд).',
    keys: ['е', 'і'],
    language: 'uk'
  },
  {
    id: 11,
    title: 'Letter Pair: W and O',
    description: 'Practice ring fingers on W and O.',
    keys: ['w', 'o'],
    language: 'en'
  },
  {
    id: 11,
    title: 'Друкуємо букви: Ц та О',
    description: 'Тренування безіменних пальців на літери Ц і О.',
    keys: ['ц', 'о'],
    language: 'uk'
  },
  {
    id: 12,
    title: 'Letter Pair: Q and P',
    description: 'Practice pinky fingers on Q and P.',
    keys: ['q', 'p'],
    language: 'en'
  },
  {
    id: 12,
    title: 'Друкуємо букви: Й та П',
    description: 'Тренування мізинців на літери Й і П.',
    keys: ['й', 'п'],
    language: 'uk'
  },
  {
    id: 13,
    title: 'Top Row Practice',
    description: 'Practice all top row keys in sequence.',
    keys: ['q', 'w', 'e', 'r', 'u', 'i', 'o', 'p'],
    language: 'en'
  },
  {
    id: 13,
    title: 'Практика верхнього ряду',
    description: 'Тренуйте всі клавіші верхнього ряду по порядку.',
    keys: ['й', 'ц', 'е', 'р', 'у', 'і', 'о', 'п'],
    language: 'uk'
  },
  {
    id: 14,
    title: 'Top Row Sentences',
    description: 'Type sentences using only top row letters.',
    keys: ['q', 'w', 'e', 'r', 'u', 'i', 'o', 'p'],
    language: 'en'
  },
  {
    id: 14,
    title: 'Речення верхнього ряду',
    description: 'Друкуйте речення лише з літер верхнього ряду.',
    keys: ['й', 'ц', 'е', 'р', 'у', 'і', 'о', 'п'],
    language: 'uk'
  },

  // ==============================
  // 15–22: Bottom row
  // ==============================
  {
    id: 15,
    title: 'Letter Pair: V and N',
    description: 'Practice index fingers on V and N.',
    keys: ['v', 'n'],
    language: 'en'
  },
  {
    id: 15,
    title: 'Друкуємо букви: М та Т',
    description: 'Тренування вказівних пальців на літери М і Т.',
    keys: ['м', 'т'],
    language: 'uk'
  },
  {
    id: 16,
    title: 'Letter Pair: C and M',
    description: 'Practice middle fingers on C and M.',
    keys: ['c', 'm'],
    language: 'en'
  },
  {
    id: 16,
    title: 'Друкуємо букви: С та Б',
    description: 'Тренування середніх пальців на літери С і Б.',
    keys: ['с', 'б'],
    language: 'uk'
  },
  {
    id: 17,
    title: 'Letter Pair: X and ,',
    description: 'Practice ring fingers on X and ,.',
    keys: ['x', ','],
    language: 'en'
  },
  {
    id: 17,
    title: 'Друкуємо букви: Ч та Ю',
    description: 'Тренування безіменних пальців на літери Ч і Ю.',
    keys: ['ч', 'ю'],
    language: 'uk'
  },
  {
    id: 18,
    title: 'Letter Pair: Z and .',
    description: 'Practice pinky fingers on Z and .',
    keys: ['z', '.'],
    language: 'en'
  },
  {
    id: 18,
    title: 'Друкуємо букви: Я та Є',
    description: 'Тренування мізинців на літери Я і Є.',
    keys: ['я', 'є'],
    language: 'uk'
  },
  {
    id: 19,
    title: 'Bottom Row Practice',
    description: 'Practice all bottom row keys in sequence.',
    keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
    language: 'en'
  },
  {
    id: 19,
    title: 'Практика нижнього ряду',
    description: 'Тренуйте всі клавіші нижнього ряду по порядку.',
    keys: ['я', 'ч', 'с', 'м', 'и', 'т', 'б', 'ю', 'є'],
    language: 'uk'
  },
  {
    id: 20,
    title: 'Bottom Row Sentences',
    description: 'Type sentences using only bottom row letters.',
    keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
    language: 'en'
  },
  {
    id: 20,
    title: 'Речення нижнього ряду',
    description: 'Друкуйте речення лише з літер нижнього ряду.',
    keys: ['я', 'ч', 'с', 'м', 'и', 'т', 'б', 'ю', 'є'],
    language: 'uk'
  }
];
