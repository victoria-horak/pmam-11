import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.JTableHeader;
import java.awt.*;
import java.io.*;
import java.util.*;
import java.util.List;

public class TeacherApp extends JFrame {

    private JTable table;
    private DefaultTableModel model;
    private JButton btnLoad, btnClear, btnStats;
    private JLabel lblResult;

    public TeacherApp() {
        super("Teacher Stats App");

        // Напівпрозорий фон (glassmorphism)
        setContentPane(new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g;
                GradientPaint gp = new GradientPaint(
                        0, 0, new Color(240, 242, 245, 220),
                        getWidth(), getHeight(), new Color(224, 226, 229, 220));
                g2.setPaint(gp);
                g2.fillRect(0, 0, getWidth(), getHeight());
            }
        });
        setLayout(new BorderLayout(20, 20));

        // Стиль картки для таблиці
        JPanel cardPanel = new JPanel(new BorderLayout()) {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g;
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                g2.setColor(new Color(255, 255, 255, 180));
                g2.fillRoundRect(0, 0, getWidth(), getHeight(), 25, 25);

                g2.setColor(new Color(200, 200, 200, 120));
                g2.drawRoundRect(0, 0, getWidth() - 1, getHeight() - 1, 25, 25);
            }
        };
        cardPanel.setOpaque(false);
        cardPanel.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));

        // --- Таблиця ---
        model = new DefaultTableModel(new String[]{"Name", "Age", "Experience", "Bonus"}, 0);
        table = new JTable(model) {
            @Override
            public Component prepareRenderer(javax.swing.table.TableCellRenderer renderer, int row, int column) {
                Component c = super.prepareRenderer(renderer, row, column);

                if (!isRowSelected(row)) {
                    if (row % 2 == 0) {
                        c.setBackground(new Color(236, 245, 255));
                    } else {
                        c.setBackground(new Color(255, 255, 255));
                    }
                }

                if (row == getSelectedRow()) {
                    c.setBackground(new Color(186, 230, 253));
                }

                return c;
            }
        };
        table.setRowHeight(30);
        table.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        table.setForeground(new Color(15, 23, 42));
        table.setGridColor(new Color(203, 213, 225));

        JTableHeader header = table.getTableHeader();
        header.setFont(new Font("Segoe UI Semibold", Font.BOLD, 14));
        header.setBackground(new Color(59, 130, 246));
        header.setForeground(Color.WHITE);
        header.setPreferredSize(new Dimension(header.getWidth(), 35));

        cardPanel.add(new JScrollPane(table), BorderLayout.CENTER);
        add(cardPanel, BorderLayout.CENTER);

        // Панель кнопок
        JPanel panelButtons = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 10));
        panelButtons.setOpaque(false);

        btnLoad = createButton("Завантажити");
        btnClear = createButton("Очистити");
        btnStats = createButton("Статистика");

        panelButtons.add(btnLoad);
        panelButtons.add(btnClear);
        panelButtons.add(btnStats);

        add(panelButtons, BorderLayout.NORTH);

        // Результати
        lblResult = new JLabel("Результати з’являться тут...");
        lblResult.setForeground(new Color(25, 35, 90));
        lblResult.setFont(new Font("Segoe UI Semibold", Font.BOLD, 15));
        lblResult.setHorizontalAlignment(SwingConstants.CENTER);
        add(lblResult, BorderLayout.SOUTH);

        // Обробники подій
        btnLoad.addActionListener(e -> loadDataFromFile("teachers.csv"));
        btnClear.addActionListener(e -> model.setRowCount(0));
        btnStats.addActionListener(e -> calculateStats());

        setSize(900, 550);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setVisible(true);
    }

    // --- Кнопки ---
    private JButton createButton(String text) {
        JButton btn = new JButton(text) {
            @Override
            protected void paintComponent(Graphics g) {
                Graphics2D g2 = (Graphics2D) g;
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                GradientPaint gp = new GradientPaint(
                        0, 0, new Color(6, 182, 212),
                        getWidth(), getHeight(), new Color(59, 130, 246));
                g2.setPaint(gp);
                g2.fillRoundRect(0, 0, getWidth(), getHeight(), 25, 25);

                super.paintComponent(g);
            }
        };

        btn.setContentAreaFilled(false);
        btn.setForeground(Color.WHITE);
        btn.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btn.setFocusPainted(false);
        btn.setBorder(BorderFactory.createEmptyBorder(10, 20, 10, 20));
        btn.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));

        // Лише зміна кольору при hover
        btn.addMouseListener(new java.awt.event.MouseAdapter() {
            @Override
            public void mouseEntered(java.awt.event.MouseEvent evt) {
                btn.setBackground(new Color(37, 99, 235)); // темніший синій
                btn.setOpaque(true);
            }

            @Override
            public void mouseExited(java.awt.event.MouseEvent evt) {
                btn.setOpaque(false);
            }
        });

        return btn;
    }

    private void loadDataFromFile(String filename) {
        model.setRowCount(0);
        try (BufferedReader br = new BufferedReader(new FileReader(filename))) {
            String line;
            br.readLine(); // пропускаємо заголовки
            while ((line = br.readLine()) != null) {
                model.addRow(line.split(","));
            }
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Помилка: " + ex.getMessage());
        }
    }

    private void calculateStats() {
        int rows = model.getRowCount();
        if (rows == 0) {
            lblResult.setText("Дані відсутні!");
            return;
        }

        List<Double> ages = new ArrayList<>();
        List<Double> bonuses = new ArrayList<>();
        List<String> names = new ArrayList<>();

        for (int i = 0; i < rows; i++) {
            ages.add(Double.parseDouble(model.getValueAt(i, 1).toString()));
            bonuses.add(Double.parseDouble(model.getValueAt(i, 3).toString()));
            names.add(model.getValueAt(i, 0).toString());
        }

        double maxBonus = Collections.max(bonuses);
        double minBonus = Collections.min(bonuses);

        int maxIndex = bonuses.indexOf(maxBonus);
        int minIndex = bonuses.indexOf(minBonus);

        String maxName = names.get(maxIndex);
        String minName = names.get(minIndex);

        double corr = correlation(ages, bonuses);

        lblResult.setText(String.format(
                "Максимум доплата – %s – %.2f | Мінімум доплата – %s – %.2f | Кореляція: %.3f",
                maxName, maxBonus, minName, minBonus, corr
        ));
    }


    private double correlation(List<Double> x, List<Double> y) {
        int n = x.size();
        double avgX = x.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double avgY = y.stream().mapToDouble(Double::doubleValue).average().orElse(0);

        double numerator = 0, denomX = 0, denomY = 0;
        for (int i = 0; i < n; i++) {
            double dx = x.get(i) - avgX;
            double dy = y.get(i) - avgY;
            numerator += dx * dy;
            denomX += dx * dx;
            denomY += dy * dy;
        }
        return numerator / Math.sqrt(denomX * denomY);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(TeacherApp::new);
    }
}
