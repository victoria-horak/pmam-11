import java.awt.*
import javax.swing.*
import javax.swing.table.DefaultTableModel
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import com.formdev.flatlaf.themes.FlatMacLightLaf

// Константи для кольорів
object Colors {
    val DEPOSIT = Color(40, 167, 69)
    val WITHDRAW = Color(220, 53, 69)
    val INTEREST = Color(255, 193, 7)
    val NEW_ACCOUNT = Color(23, 162, 184)
    val CLOSE_ACCOUNT = Color(108, 117, 125)
    val TRANSFER = Color(111, 66, 193)
    val REFRESH = Color(40, 167, 69)
}
// Клас транзакції - зберігає інформацію про одну операцію (тип, сума, час, опис, результат та баланс після операції)
data class Transaction(
    val type: TransactionType,
    val amount: Double,
    val fromAccount: String? = null,
    val toAccount: String? = null,
    val timestamp: Date = Date(),
    val success: Boolean = true,
    val description: String = "",
    val balanceAfterTransaction: Double = 0.0)

enum class TransactionType { DEPOSIT, WITHDRAW, TRANSFER, INTEREST }

// Клас банківського рахунку
// Основний блок логіки рахунку: баланс, історія транзакцій, нарахування відсотків
class BankAccount(private var balance: Double = 0.0, val accountHolder: String = "") {
    private var isClosed = false
    private val transactionHistory = Collections.synchronizedList(mutableListOf<Transaction>())
    private val interestRate = 0.02
    fun addTransaction(type: TransactionType, amount: Double, success: Boolean, description: String, from: String? = null, to: String? = null) {
        transactionHistory.add(Transaction(type, amount, from, to, Date(), success, description, balance))
        if (transactionHistory.size > 1000) transactionHistory.removeAt(0)
    }
    fun deposit(amount: Double, description: String = "") = synchronized(this) {
        if (isClosed || amount <= 0) {
            addTransaction(TransactionType.DEPOSIT, amount, false, description, to = "Цей рахунок")
            return@synchronized false
        }
        balance += amount
        addTransaction(TransactionType.DEPOSIT, amount, true, description, to = "Цей рахунок")
        true
    }
    fun withdraw(amount: Double, description: String = "") = synchronized(this) {
        if (isClosed || amount <= 0 || amount > balance) {
            addTransaction(TransactionType.WITHDRAW, amount, false, description, from = "Цей рахунок")
            return@synchronized false
        }
        balance -= amount
        addTransaction(TransactionType.WITHDRAW, amount, true, description, from = "Цей рахунок")
        true
    }
    fun calculateInterest() = synchronized(this) {
        val interest = balance * interestRate / 12
        if (interest > 0) {
            balance += interest
            addTransaction(TransactionType.INTEREST, interest, true, "Місячні відсотки", to = "Цей рахунок")
        }
        interest
    }
    fun getBalance() = synchronized(this) { if (isClosed) throw IllegalStateException("Рахунок закрито") else balance }
    fun close() = synchronized(this) { if (isClosed) false else { isClosed = true; true } }
    fun getTransactionHistory() = synchronized(this) { transactionHistory.toList() }
}

// Клас банку керує колекцією рахунків у ConcurrentHashMap для потокобезпечності
// Забезпечує високорівневу бізнес-логіку роботи банку та інтерфейс для UI
class Bank {
    private val accounts = ConcurrentHashMap<String, BankAccount>()
    fun openAccount(accountId: String, initialBalance: Double = 0.0, accountHolder: String = "") =
        accounts.putIfAbsent(accountId, BankAccount(initialBalance, accountHolder)) == null
    fun closeAccount(accountId: String) = accounts[accountId]?.close() ?: false
    fun deposit(accountId: String, amount: Double, description: String = "") = accounts[accountId]?.deposit(amount, "Депозит: $description") ?: false
    fun withdraw(accountId: String, amount: Double, description: String = "") = accounts[accountId]?.withdraw(amount, "Зняття: $description") ?: false
    fun transfer(fromAccount: String, toAccount: String, amount: Double, description: String = "") = synchronized(accounts) {
        val from = accounts[fromAccount] ?: return@synchronized false
        val to = accounts[toAccount] ?: return@synchronized false
        // Перевіряємо стан обох рахунків перед операцією
        val fromBalance = try { from.getBalance() } catch (e: IllegalStateException) {
            // Записуємо невдалу транзакцію - рахунок відправника закритий
            from.addTransaction(TransactionType.TRANSFER, amount, false, "Переказ на $toAccount: $description (рахунок відправника закрито)", fromAccount, toAccount)
            return@synchronized false
        }
        try {
            to.getBalance()
        } catch (e: IllegalStateException) {
            // Записуємо невдалу транзакцію - рахунок отримувача закритий
            from.addTransaction(TransactionType.TRANSFER, amount, false, "Переказ на $toAccount: $description (рахунок отримувача закрито)", fromAccount, toAccount)
            return@synchronized false
        }
        // Перевіряємо достатність коштів
        if (amount <= 0 || amount > fromBalance) {
            // Записуємо невдалу транзакцію через недостатність коштів
            from.addTransaction(TransactionType.TRANSFER, amount, false, "Переказ на $toAccount: $description (недостатньо коштів)", fromAccount, toAccount)
            return@synchronized false
        }
        // Виконуємо операцію
        if (from.withdraw(amount, "Переказ на $toAccount: $description")) {
            val depositSuccess = to.deposit(amount, "Переказ від $fromAccount: $description")
            return@synchronized depositSuccess
        }
        false
    }
    fun getBalance(accountId: String) = try { accounts[accountId]?.getBalance() } catch (e: IllegalStateException) { null }
    fun getTransactionHistory(accountId: String) = accounts[accountId]?.getTransactionHistory() ?: emptyList()
    fun getAllAccounts() = accounts.keys.toList()
    fun calculateAllInterest() = accounts.values.forEach { it.calculateInterest() }
}

// Градієнтні кнопки
class GradientButton(text: String, color: Color) : JButton(text) {
    init {
        isContentAreaFilled = false
        isFocusPainted = false
        foreground = Color.WHITE
        font = Font("Segoe UI", Font.BOLD, 18)
        preferredSize = Dimension(200, 45)
        border = BorderFactory.createEmptyBorder(10, 20, 10, 20)
        background = color
    }

    override fun paintComponent(g: Graphics) {
        val g2 = g as Graphics2D
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
        g2.paint = GradientPaint(0f, 0f, background, width.toFloat(), height.toFloat(), background.darker())
        g2.fillRoundRect(0, 0, width, height, 15, 15)
        super.paintComponent(g)
    }
}

// Головний клас GUI банку
// Створює вікно, вкладки, панелі та елементи для операцій, історії та переказів
class BankModernGUI {
    private val bank = Bank()
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
    private var currentAccount = "Рахунок 1"
    private lateinit var accountComboBox: JComboBox<String>
    private lateinit var balanceLabel: JLabel
    private lateinit var fromAccountCombo: JComboBox<String>
    private lateinit var toAccountCombo: JComboBox<String>

    fun createAndShowGUI() {
        setupFlatLafTheme()
        initializeTestData()

        val frame = JFrame("Банківська система").apply {
            defaultCloseOperation = JFrame.EXIT_ON_CLOSE
            layout = BorderLayout()
            add(createTabbedPane(), BorderLayout.CENTER)
            setSize(1000, 700)
            setLocationRelativeTo(null)
            isVisible = true
        }
    }

    private fun setupFlatLafTheme() = try {
        FlatMacLightLaf.setup()
        with(UIManager::class.java) {
            getDeclaredMethod("put", Any::class.java, Any::class.java).apply {
                arrayOf(
                    "Button.arc" to 15, "Component.arc" to 8, "TextComponent.arc" to 8,
                    "ScrollBar.thumbArc" to 999, "ScrollBar.thumbInsets" to Insets(2, 2, 2, 2),
                    "TabbedPane.selectedBackground" to Color(230, 240, 255),
                    "TabbedPane.selectedForeground" to Color(0, 100, 200)
                ).forEach { (key, value) -> invoke(null, key, value) }
            }
        }
    } catch (e: Exception) {
        try { UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName()) } catch (ex: Exception) { ex.printStackTrace() }
    }

    private fun createTabbedPane() = JTabbedPane().apply {
        background = Color(245, 245, 250)
        addTab("Головна", createMainPanel())
        addTab("Історія", createHistoryPanel())
        addTab("Переказ", createTransferPanel())
    }

    private fun createMainPanel() = JPanel(BorderLayout()).apply {
        background = Color(245, 245, 250)
        add(createTopPanel(), BorderLayout.NORTH)
        add(createCenterPanel(), BorderLayout.CENTER)
    }

    private fun createTopPanel() = JPanel(BorderLayout()).apply {
        background = Color(255, 255, 255)
        border = BorderFactory.createEmptyBorder(20, 20, 20, 20)
        val accountPanel = JPanel(FlowLayout(FlowLayout.LEFT)).apply {
            background = Color(255, 255, 255)

            // Спочатку створюємо комбобокс, потім оновлюємо його
            accountComboBox = JComboBox<String>().apply {
                prototypeDisplayValue = "Рахунок 1"
                font = Font("Segoe UI", Font.PLAIN, 14)
                addActionListener {
                    selectedItem?.toString()?.let {
                        currentAccount = it
                        updateBalanceLabel()
                    }
                }
            }
            balanceLabel = JLabel("Баланс: ${bank.getBalance(currentAccount) ?: "N/A"}").apply {
                font = Font("Segoe UI", Font.BOLD, 24)
                foreground = Color(41, 174, 18)
            }
            add(JLabel("Рахунок:").apply {
                font = Font("Segoe UI", Font.BOLD, 14)
                foreground = Color(100, 100, 100)
            })
            add(accountComboBox)
            add(Box.createHorizontalStrut(30))
            add(balanceLabel)
        }
        add(accountPanel, BorderLayout.CENTER)
        updateAccountComboBox()
    }

    private fun createCenterPanel() = JPanel(GridLayout(1, 2, 20, 0)).apply {
        background = Color(245, 245, 250)
        border = BorderFactory.createEmptyBorder(0, 20, 20, 20)
        add(createOperationsPanel())
        add(createAdditionalFunctionsPanel())
    }

    private fun createOperationsPanel() = createStyledPanel("Основні операції:").apply {
        val amountField = JTextField()
        val descriptionField = JTextField()
        val depositButton = GradientButton("Поповнити", Colors.DEPOSIT)
        val withdrawButton = GradientButton("Зняти", Colors.WITHDRAW)
        add(JPanel(GridLayout(0, 1, 10, 10)).apply {
            background = Color(255, 255, 255)
            add(createFormField("Сума:", amountField))
            add(createFormField("Опис:", descriptionField))
            add(Box.createVerticalStrut(10))
            add(depositButton)
            add(withdrawButton)
        }, BorderLayout.CENTER)
        depositButton.addActionListener { processTransaction(amountField, descriptionField, true) }
        withdrawButton.addActionListener { processTransaction(amountField, descriptionField, false) }
    }

    private fun createAdditionalFunctionsPanel() = createStyledPanel("Додаткові функції:").apply {
        add(JPanel(GridLayout(0, 1, 10, 10)).apply {
            background = Color(255, 255, 255)
            arrayOf(
                GradientButton("Нарахувати відсотки", Colors.INTEREST) to {
                    bank.calculateAllInterest()
                    showMessage("Відсотки нараховані на всі рахунки!", true)
                    updateBalanceLabel()
                },
                GradientButton("Новий рахунок", Colors.NEW_ACCOUNT) to { createNewAccount() },
                GradientButton("Закрити рахунок", Colors.CLOSE_ACCOUNT) to { closeAccount() }
            ).forEach { (button, action) ->
                add(button.apply { addActionListener { action() } })
            }
        }, BorderLayout.CENTER)
    }

    private fun createHistoryPanel() = JPanel(BorderLayout()).apply {
        background = Color(245, 245, 250)
        val tableModel = DefaultTableModel(arrayOf("Дата", "Тип", "Сума", "З рахунку", "На рахунок", "Опис", "Баланс", "Статус"), 0)
        val historyTable = JTable(tableModel).apply {
            font = Font("Segoe UI", Font.PLAIN, 12)
            rowHeight = 30
            setShowGrid(true)
            gridColor = Color(240, 240, 240)
        }
        add(JScrollPane(historyTable).apply {
            border = BorderFactory.createEmptyBorder(20, 20, 10, 20)
        }, BorderLayout.CENTER)
        add(JPanel(FlowLayout(FlowLayout.CENTER)).apply {
            background = Color(245, 245, 250)
            border = BorderFactory.createEmptyBorder(0, 20, 20, 20)
            add(GradientButton("Оновити історію", Colors.REFRESH).apply {
                addActionListener { updateHistoryTable(tableModel) }
            })
        }, BorderLayout.SOUTH)
    }

    private fun createTransferPanel() = JPanel(BorderLayout()).apply {
        background = Color(245, 245, 250)
        border = BorderFactory.createEmptyBorder(20, 20, 20, 20)
        val formPanel = JPanel(GridLayout(5, 2, 15, 15)).apply {
            background = Color(255, 255, 255)
            border = BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(Color(230, 230, 230), 1),
                BorderFactory.createEmptyBorder(30, 30, 30, 30)
            )
            fromAccountCombo = JComboBox<String>()
            toAccountCombo = JComboBox<String>()
            val amountField = JTextField()
            val descriptionField = JTextField()

            // Оновлюємо комбобокси після створення
            updateTransferComboBoxes()
            arrayOf(
                "З рахунку:" to fromAccountCombo,
                "На рахунок:" to toAccountCombo,
                "Сума:" to amountField,
                "Опис:" to descriptionField
            ).forEach { (label, component) ->
                add(createFormLabel(label))
                add(component)
            }
            add(JLabel())
            add(GradientButton("Виконати переказ", Colors.TRANSFER).apply {
                addActionListener {
                    val from = fromAccountCombo.selectedItem as? String
                    val to = toAccountCombo.selectedItem as? String
                    val amount = amountField.text.toDoubleOrNull()
                    val description = descriptionField.text
                    when {
                        from == null || to == null -> showMessage("Виберіть рахунки для переказу!", false)
                        from == to -> showMessage("Не можна переказувати на той самий рахунок!", false)
                        amount == null || amount <= 0 -> showMessage("Неправильна сума!", false)
                        else -> {
                            val success = bank.transfer(from, to, amount, description)
                            showMessage(if (success) "Переказ успішний!" else "Переказ не вдався!", success)
                            updateBalanceLabel()
                            amountField.text = ""
                            descriptionField.text = ""
                        }
                    }
                }
            })
        }
        add(formPanel, BorderLayout.CENTER)
    }

    private fun createStyledPanel(title: String) = JPanel(BorderLayout()).apply {
        background = Color(255, 255, 255)
        border = BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(Color(230, 230, 230), 1),
            BorderFactory.createEmptyBorder(20, 20, 20, 20)
        )
        add(JLabel(title).apply {
            font = Font("Segoe UI", Font.BOLD, 18)
            foreground = Color(50, 50, 50)
        }, BorderLayout.NORTH)
    }

    private fun createFormLabel(text: String) = JLabel(text).apply {
        font = Font("Segoe UI", Font.BOLD, 14)
        foreground = Color(100, 100, 100)
    }

    private fun createFormField(label: String, field: JTextField) = JPanel(BorderLayout(10, 5)).apply {
        background = Color(255, 255, 255)
        add(JLabel(label).apply {
            font = Font("Segoe UI", Font.PLAIN, 14)
            foreground = Color(100, 100, 100)
        }, BorderLayout.NORTH)
        add(field.apply {
            font = Font("Segoe UI", Font.PLAIN, 14)
            border = BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(Color(200, 200, 200), 1),
                BorderFactory.createEmptyBorder(8, 10, 8, 10)
            )
        }, BorderLayout.CENTER)
    }

    private fun processTransaction(amountField: JTextField, descriptionField: JTextField, isDeposit: Boolean) {
        val amount = amountField.text.toDoubleOrNull()
        val description = descriptionField.text
        if (amount != null && amount > 0) {
            val success = if (isDeposit)
                bank.deposit(currentAccount, amount, description)
            else
                bank.withdraw(currentAccount, amount, description)
            showMessage(
                if (success) "${if (isDeposit) "Поповнення" else "Зняття"} успішне!"
                else "${if (isDeposit) "Поповнення" else "Зняття"} не вдалося!",
                success
            )
            updateBalanceLabel()
        } else {
            showMessage("Неправильна сума!", false)
        }
        amountField.text = ""
        descriptionField.text = ""
    }

    private fun createNewAccount() {
        val accountId = JOptionPane.showInputDialog("Введіть ID нового рахунку:")
        if (accountId != null && accountId.isNotBlank()) {
            val initialBalance = JOptionPane.showInputDialog("Введіть початковий баланс:")?.toDoubleOrNull() ?: 0.0
            val accountHolder = JOptionPane.showInputDialog("Введіть ім'я власника:") ?: ""
            if (bank.openAccount(accountId, initialBalance, accountHolder)) {
                showMessage("Рахунок успішно створено!", true)
                safeUpdateAccountComboBox(accountId)
                updateTransferComboBoxes()
            } else {
                showMessage("Рахунок вже існує!", false)
            }
        }
    }

    private fun closeAccount() {
        val success = bank.closeAccount(currentAccount)
        showMessage(
            if (success) "Рахунок успішно закрито!"
            else "Рахунок вже закритий!",
            success
        )
        updateBalanceLabel()
        updateTransferComboBoxes()
    }

    private fun updateAccountComboBox() {
        val selectedItem = accountComboBox.selectedItem
        accountComboBox.removeAllItems()
        bank.getAllAccounts().forEach { accountComboBox.addItem(it) }
        if (selectedItem != null && bank.getAllAccounts().contains(selectedItem)) {
            accountComboBox.selectedItem = selectedItem
        } else if (accountComboBox.itemCount > 0) {
            accountComboBox.selectedIndex = 0
        }
    }

    private fun safeUpdateAccountComboBox(newAccountId: String) {
        accountComboBox.removeAllItems()
        bank.getAllAccounts().forEach { accountComboBox.addItem(it) }
        accountComboBox.selectedItem = newAccountId
        currentAccount = newAccountId
        updateBalanceLabel()
    }

    private fun updateTransferComboBoxes() {
        if (::fromAccountCombo.isInitialized && ::toAccountCombo.isInitialized) {
            val fromSelected = fromAccountCombo.selectedItem
            val toSelected = toAccountCombo.selectedItem
            fromAccountCombo.removeAllItems()
            toAccountCombo.removeAllItems()
           bank.getAllAccounts().forEach {
                fromAccountCombo.addItem(it)
                toAccountCombo.addItem(it)
            }
            if (fromSelected != null && bank.getAllAccounts().contains(fromSelected)) {
                fromAccountCombo.selectedItem = fromSelected
            } else if (fromAccountCombo.itemCount > 0) {
                fromAccountCombo.selectedIndex = 0
            }
            if (toSelected != null && bank.getAllAccounts().contains(toSelected)) {
                toAccountCombo.selectedItem = toSelected
            } else if (toAccountCombo.itemCount > 0) {
                toAccountCombo.selectedIndex = 0
            }
        }
    }

    private fun updateBalanceLabel() {
        balanceLabel.text = "Баланс: ${bank.getBalance(currentAccount) ?: "N/A"}"
    }

    private fun updateHistoryTable(tableModel: DefaultTableModel) {
        tableModel.rowCount = 0
        bank.getTransactionHistory(currentAccount).forEach { transaction ->
            tableModel.addRow(arrayOf(
                dateFormat.format(transaction.timestamp),
                getUkrainianTransactionType(transaction.type),
                "%.2f".format(transaction.amount),
                transaction.fromAccount ?: getDefaultFromAccount(transaction.type),
                transaction.toAccount ?: getDefaultToAccount(transaction.type),
                transaction.description,
                "%.2f".format(transaction.balanceAfterTransaction),
                if (transaction.success) "Успіх" else "Відхилено"
            ))
        }
    }

    private fun getDefaultFromAccount(type: TransactionType) = when (type) {
        TransactionType.DEPOSIT -> "Зовнішнє джерело"
        TransactionType.WITHDRAW -> currentAccount
        TransactionType.TRANSFER -> "Невідомо"
        TransactionType.INTEREST -> "Банк"
    }

    private fun getDefaultToAccount(type: TransactionType) = when (type) {
        TransactionType.DEPOSIT -> currentAccount
        TransactionType.WITHDRAW -> "Користувач"
        TransactionType.TRANSFER -> "Невідомо"
        TransactionType.INTEREST -> currentAccount
    }

    private fun getUkrainianTransactionType(type: TransactionType) = when (type) {
        TransactionType.DEPOSIT -> "Поповнення"
        TransactionType.WITHDRAW -> "Зняття"
        TransactionType.TRANSFER -> "Переказ"
        TransactionType.INTEREST -> "Відсотки"
    }

    private fun showMessage(message: String, success: Boolean) {
        JOptionPane.showMessageDialog(
            null,
            message,
            if (success) "Успіх" else "Помилка",
            if (success) JOptionPane.INFORMATION_MESSAGE else JOptionPane.ERROR_MESSAGE
        )
    }

    private fun initializeTestData() {
        bank.openAccount("Рахунок 1", 1000.0, "Іван Петренко")
        bank.openAccount("Рахунок 2", 500.0, "Марія Коваленко")
        bank.openAccount("Рахунок 3", 2000.0, "Петро Іванов")
        bank.deposit("Рахунок 1", 200.0, "Початковий депозит")
        bank.withdraw("Рахунок 1", 50.0, "Обід")
        bank.transfer("Рахунок 1", "Рахунок 2", 100.0, "Повернення боргу")
    }
}
// Точка входу програми. Викликає GUI у потоці Swing
fun main() = SwingUtilities.invokeLater {
    BankModernGUI().createAndShowGUI()
}