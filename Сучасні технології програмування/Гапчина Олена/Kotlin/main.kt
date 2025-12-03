import kotlin.system.exitProcess
import kotlin.random.Random

// ANSI кольори для консолі
const val RESET = "\u001B[0m"   // скидання кольору
const val GREEN = "\u001B[32m"  // зелений для успіху
const val YELLOW = "\u001B[33m" // жовтий для попередження
const val RED = "\u001B[31m"    // червоний для помилок
const val CYAN = "\u001B[36m"   // бірюзовий для підказок та банк інгредієнтів

// Клас IngredientBank
// Керує списком всіх можливих інгредієнтів та їх показом
class IngredientBank(private val allIngredients: List<String>) {
    // Показати банк інгредієнтів у вигляді таблиці
    fun show() {
        val shuffled = allIngredients.shuffled(Random(System.currentTimeMillis())) // перемішати для випадкового порядку
        val rowSize = 3 // кількість інгредієнтів в одному рядку
        println("${CYAN}Available ingredients:${RESET}\n")
        shuffled.chunked(rowSize).forEach { row -> // ділимо на рядки по rowSize
            println(row.joinToString(" | ")) // відображення через '|'
        }
        println()
    }
}

// Абстрактний клас Stage
// Клас-шаблон для етапів гри
abstract class Stage {
    abstract fun start() // Метод, який запускає етап
}

// Stage 1: Вибір інгредієнтів
class StageSelectIngredients(
    private val bank: IngredientBank,           // посилання на банк інгредієнтів
    private val targetIngredients: Set<String>  // правильні інгредієнти для Margherita
) : Stage() {

    lateinit var selectedIngredients: Set<String> // Збережені інгредієнти користувача

    override fun start() {
        val selected = mutableSetOf<String>() // множина вибраних інгредієнтів користувача
        printRetroBox(listOf("Stage 1: Find all ingredients for Pizza Margherita!"))
        println("Choose ${targetIngredients.size} ingredients one by one. Type '${CYAN}BANK$RESET' to see all possible ingredients.\n")

        var count = 1
        while (selected.size < targetIngredients.size) { // поки не обрано всі правильні інгредієнти
            print("Ingredient #$count: ")
            val input = readlnOrNull()?.trim()?.uppercase() ?: continue // зчитування введення та переведення у верхній регістр

            if (input == "BANK") { // якщо користувач хоче переглянути банк
                bank.show()
                continue
            }

            // Перевірка чи введений інгредієнт належить до правильних інгредієнтів Margherita
            if (!targetIngredients.contains(input)) {
                println("${RED}⚠ '$input' is not a Pizza Margherita ingredient!${RESET}\n")
                continue
            }

            // Перевірка чи інгредієнт вже був вибраний
            if (selected.contains(input)) {
                println("${YELLOW}⚠ Already selected!${RESET}\n")
                continue
            }

            // Додаємо інгредієнт до списку обраних
            selected.add(input)
            println("${GREEN}✔ $input added!${RESET}\n")
            count++
        }

        println("\n${GREEN}🎉 You found all ingredients! Now let's arrange them in the correct order.${RESET}\n")
        selectedIngredients = selected // зберігаємо вибрані інгредієнти для наступного етапу
    }
}

// Stage 2: Розташування інгредієнтів у правильному порядку
class StageArrangeIngredients(
    private val selectedIngredients: Set<String>, // обрані користувачем інгредієнти
    private val targetOrder: List<String>         // правильний порядок
) : Stage() {

    override fun start() {
        printRetroBox(listOf("Stage 2: Arrange ingredients in correct order!"))
        println("Your selected ingredients: ${selectedIngredients.joinToString(" | ")}\n")

        val maxTries = 6 // максимальна кількість спроб
        var tries = 0

        while (tries < maxTries) {
            tries++
            print("Attempt #$tries - Enter all ingredients in order, space-separated: ")
            val input = readlnOrNull()?.trim()?.uppercase()?.split(Regex("\\s+")) ?: continue

            // Перевірка кількості введених інгредієнтів
            if (input.size != targetOrder.size) {
                println("${RED}⚠ You must enter exactly ${targetOrder.size} ingredients!${RESET}\n")
                continue
            }

            // Перевірка чи всі інгредієнти взяті з обраних користувачем
            if (!input.all { selectedIngredients.contains(it) }) {
                println("${RED}⚠ All ingredients must come from your selection!${RESET}\n")
                continue
            }

            // Формуємо фідбек по кожному інгредієнту
            val feedback = input.mapIndexed { idx, ing ->
                when {
                    ing == targetOrder[idx] -> "${GREEN}[✅ $ing]$RESET"  // правильний інгредієнт на правильному місці
                    targetOrder.contains(ing) -> "${YELLOW}[⚠ $ing]$RESET" // правильний інгредієнт, але не на своєму місці
                    else -> "${RED}[❌ $ing]$RESET" // неправильний інгредієнт (тут майже немає, бо Stage1 фільтрує)
                }
            }
            println("\n" + feedback.joinToString(" | ") + "\n")

            // Перевірка повної правильності порядку
            if (input == targetOrder) {
                printRetroBox(listOf("🍕 La tua pizza è pronta! Buon appetito!"))
                exitProcess(0) // вихід після успіху
            } else {
                println("😅 Not quite! Try again.\n")
            }
        }

        // Якщо всі спроби використано
        println("${RED}💥 You've run out of attempts! The correct order was:${RESET}")
        println(targetOrder.joinToString(" | "))
    }
}

// Клас PizzaMargheritaGame
// Основний клас гри, який координує етапи
class PizzaMargheritaGame {
    private val allIngredients = listOf(
        "FARINA", "ACQUA", "POMODORI", "MOZZARELLA", "BASILICO",
        "OLIO", "SALE", "PEPE", "AGLIO", "ORIGANO",
        "FUNGHI", "PROVOLONE", "PANCETTA", "CIPOLLA", "TONNO",
        "OLIVE", "CAPRINO", "PEPERONI", "ZUCCHINE", "SALAME"
    )
    private val targetIngredients = setOf("FARINA", "ACQUA", "POMODORI", "MOZZARELLA", "BASILICO", "SALE", "OLIO")
    private val targetOrder = listOf("FARINA", "ACQUA", "POMODORI", "MOZZARELLA", "BASILICO", "SALE", "OLIO")
    private val bank = IngredientBank(allIngredients) // створюємо банк інгредієнтів

    fun start() {
        printRetroBox(listOf("🍕 Welcome to Retro Pizza Margherita Challenge!"))
        println("Your goal: find all ingredients and arrange them in the correct order.\n")

        val stage1 = StageSelectIngredients(bank, targetIngredients) // етап 1: вибір інгредієнтів
        stage1.start()

        val stage2 = StageArrangeIngredients(stage1.selectedIngredients, targetOrder) // етап 2: порядок
        stage2.start()
    }
}

// Функція для красивої рамки
fun printRetroBox(lines: List<String>) {
    val width = lines.maxOf { it.length + it.count { c -> c.toString().matches(Regex("[\uD800-\uDBFF]")) } }
    println("╔" + "═".repeat(width + 2) + "╗")
    for (line in lines) {
        val padding = width - line.length
        println("║ $line" + " ".repeat(padding) + " ║")
    }
    println("╚" + "═".repeat(width + 2) + "╝")
}

fun main() {
    PizzaMargheritaGame().start() // старт гри
}
