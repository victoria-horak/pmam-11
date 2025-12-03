import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Інтерфейс Switchable.
 */
interface Switchable {
    void turnOn();
    void turnOff();
    boolean isOn();
    String getName();
    String getType();
    String getStatusText();
}

/**
 * Базовий абстрактний клас для пристроїв.
 */
abstract class SmartDevice implements Switchable {
    protected String name;
    protected boolean on;

    public SmartDevice(String name) {
        this.name = name;
        this.on = false; // За замовчуванням вимкнено
    }

    @Override
    public boolean isOn() { return on; }

    @Override
    public String getName() { return name; }

    // Методи turnOn/turnOff реалізують конкретні класи,
    // бо лампа вмикається інакше, ніж термостат.
}

// Лампа
class Light extends SmartDevice {
    public Light(String name) { super(name); }

    @Override
    public void turnOn() {
        on = true;
    }

    @Override
    public void turnOff() {
        on = false;
    }

    @Override
    public String getType() { return "Лампа"; }

    @Override
    public String getStatusText() { return on ? "Світить" : "Темно"; }
}

// Телевізор
class TV extends SmartDevice {
    public TV(String name) { super(name); }

    @Override
    public void turnOn() {
        on = true;
    }

    @Override
    public void turnOff() {
        on = false;
    }

    @Override
    public String getType() { return "TV"; }

    @Override
    public String getStatusText() { return on ? "Ефір" : "Вимкнено"; }
}

// Термостат
class Thermostat extends SmartDevice {
    public Thermostat(String name) { super(name); }

    @Override
    public void turnOn() {
        on = true;
    }

    @Override
    public void turnOff() {
        on = false;
    }

    @Override
    public String getType() { return "Термостат"; }

    @Override
    public String getStatusText() { return on ? "Нагрів" : "Пауза"; }
}

/**
 * Центральний контролер.
 * Керує списком пристроїв.
 */
class HomeController {
    private List<Switchable> devices = new ArrayList<>();

    public void addDevice(Switchable device) {
        devices.add(device);
    }

    public List<Switchable> getDevices() {
        return devices;
    }

    public void turnAllOff() {
        for (Switchable device : devices) {
            device.turnOff();
        }
    }

    public void turnAllOn() {
        for (Switchable device : devices) {
            device.turnOn();
        }
    }
}

// ================== ГРАФІЧНИЙ ІНТЕРФЕЙС (Swing) ==================

public class SmartHomeApp extends JFrame {

    private HomeController controller;
    private JPanel devicesPanel; // Панель, де будуть картки пристроїв

    public SmartHomeApp() {
        // Ініціалізація логіки
        controller = new HomeController();
        controller.addDevice(new Light("Кухня"));
        controller.addDevice(new Light("Вітальня"));
        controller.addDevice(new TV("Samsung 4K"));
        controller.addDevice(new Thermostat("Головний"));
        controller.addDevice(new Light("Спальня"));

        // Налаштування вікна
        setTitle("Smart Home Controller");
        setSize(450, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null); // По центру екрану
        setLayout(new BorderLayout());

        // Стилі 
        Color darkBg = new Color(30, 30, 35);
        Color accentColor = new Color(75, 110, 240);

        // --- Верхня панель (Заголовок) ---
        JPanel headerPanel = new JPanel();
        headerPanel.setBackground(darkBg);
        headerPanel.setBorder(new EmptyBorder(15, 15, 15, 15));
        JLabel titleLabel = new JLabel("Мій Дім");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 24));
        headerPanel.add(titleLabel);
        add(headerPanel, BorderLayout.NORTH);

        // --- Центральна панель (Список пристроїв) ---
        devicesPanel = new JPanel();
        devicesPanel.setLayout(new GridLayout(0, 1, 10, 10));
        devicesPanel.setBackground(new Color(240, 242, 245));
        devicesPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        
        // Додаємо скрол, якщо пристроїв багато
        JScrollPane scrollPane = new JScrollPane(devicesPanel);
        scrollPane.setBorder(null);
        add(scrollPane, BorderLayout.CENTER);

        // --- Нижня панель (Глобальні кнопки) ---
        JPanel bottomPanel = new JPanel(new GridLayout(1, 2, 20, 0));
        bottomPanel.setBackground(darkBg);
        bottomPanel.setBorder(new EmptyBorder(15, 15, 15, 15));

        JButton allOnBtn = createStyledButton("Увімкнути Все", new Color(46, 204, 113));
        JButton allOffBtn = createStyledButton("Вимкнути Все", new Color(231, 76, 60));

        allOnBtn.addActionListener(e -> {
            controller.turnAllOn();
            refreshUI();
        });

        allOffBtn.addActionListener(e -> {
            controller.turnAllOff();
            refreshUI();
        });

        bottomPanel.add(allOnBtn);
        bottomPanel.add(allOffBtn);
        add(bottomPanel, BorderLayout.SOUTH);

        refreshUI();
    }

    // Метод для оновлення карток пристроїв
    private void refreshUI() {
        devicesPanel.removeAll();

        for (Switchable device : controller.getDevices()) {
            JPanel card = createDeviceCard(device);
            devicesPanel.add(card);
        }

        devicesPanel.revalidate();
        devicesPanel.repaint();
    }

    // Створення гарної картки для одного пристрою
    private JPanel createDeviceCard(Switchable device) {
        JPanel card = new JPanel(new BorderLayout());
        card.setBackground(Color.WHITE);
        card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(220, 220, 220), 1),
                new EmptyBorder(10, 15, 10, 15)
        ));
        
        // Тип та назва
        JLabel nameLabel = new JLabel(device.getType() + ": " + device.getName());
        nameLabel.setFont(new Font("Segoe UI", Font.BOLD, 16));
        
        // Статус і кнопка
        JPanel rightPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        rightPanel.setOpaque(false);

        JLabel statusLabel = new JLabel(device.getStatusText());
        statusLabel.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        statusLabel.setForeground(device.isOn() ? new Color(46, 204, 113) : Color.GRAY);
        
        JToggleButton toggleBtn = new JToggleButton(device.isOn() ? "ON" : "OFF");
        toggleBtn.setSelected(device.isOn());
        
        toggleBtn.addActionListener(e -> {
            if (toggleBtn.isSelected()) {
                device.turnOn();
            } else {
                device.turnOff();
            }
            refreshUI();
        });

        rightPanel.add(statusLabel);
        rightPanel.add(toggleBtn);

        card.add(nameLabel, BorderLayout.WEST);
        card.add(rightPanel, BorderLayout.EAST);
        
        // Змінюється фон картки, якщо пристрій увімкнено (легкий ефект світіння)
        if (device.isOn()) {
            card.setBackground(new Color(245, 255, 245));
        }

        return card;
    }

    private JButton createStyledButton(String text, Color bg) {
        JButton btn = new JButton(text);
        btn.setBackground(bg);
        btn.setForeground(Color.WHITE);
        btn.setFocusPainted(false);
        btn.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btn.setBorder(BorderFactory.createEmptyBorder(10, 20, 10, 20));
        return btn;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new SmartHomeApp().setVisible(true);
        });
    }
}