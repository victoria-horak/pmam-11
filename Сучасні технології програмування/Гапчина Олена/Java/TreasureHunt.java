import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.Random;

public class TreasureHunt extends JFrame {

    private int gridSize = 3; // DEFAULT 3×3
    private int tries = gridSize * 2;

    private JButton[][] buttons;
    private JPanel gridPanel;
    private int treasureRow;
    private int treasureCol;

    private final JLabel triesLabel;
    private final JLabel statusLabel;
    private final JComboBox<String> difficultyBox;
    private final JButton playAgainButton;

    // ---------- MODERN COLOR PALETTE ----------
    private static final Color DARK_BACKGROUND = new Color(30, 30, 47); // #1E1E2F
    private static final Color GRID_BACKGROUND = new Color(42, 42, 64); // #2A2A40
    private static final Color UNCLICKED_BUTTON = new Color(60, 60, 87); // #3C3C57
    private static final Color UNCLICKED_HOVER = new Color(74, 74, 106); // #4A4A6A
    private static final Color TEXT_COLOR = new Color(230, 230, 240); // #E6E6F0
    private static final Color ACCENT_COLOR = new Color(110, 205, 253); // #6ECDFD
    private static final Color WIN_COLOR = new Color(65, 200, 138); // mint green
    private static final Color REVEAL_COLOR = new Color(255, 211, 107); // warm gold

    private static final Font BUTTON_FONT = new Font("Segoe UI", Font.BOLD, 18);
    private static final Font EMOJI_FONT = new Font("Segoe UI Emoji", Font.PLAIN, 38);

    public TreasureHunt() {

        try {
            UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName());
        } catch (Exception ignored) {
        }

        setTitle("🏴‍☠️ Treasure Hunt Game");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(500, 600);
        setMinimumSize(new Dimension(400, 500));
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // TOP PANEL
        JPanel topPanel = new JPanel();
        topPanel.setLayout(new BoxLayout(topPanel, BoxLayout.Y_AXIS));
        topPanel.setBackground(DARK_BACKGROUND);
        topPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 10, 20));

        JLabel title = new JLabel("Treasure Hunt!");
        title.setForeground(TEXT_COLOR);
        title.setFont(new Font("Segoe UI", Font.BOLD, 28));
        title.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel rules = new JLabel("Find the treasure before you run out of tries!");
        rules.setForeground(TEXT_COLOR);
        rules.setFont(new Font("Segoe UI", Font.PLAIN, 15));
        rules.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Difficulty selector
        JPanel diffPanel = new JPanel();
        diffPanel.setBackground(DARK_BACKGROUND);

        JLabel diffLabel = new JLabel("Difficulty: ");
        diffLabel.setForeground(TEXT_COLOR);
        diffLabel.setFont(new Font("Segoe UI", Font.PLAIN, 15));

        difficultyBox = new JComboBox<>(new String[] { "Easy (3×3)", "Normal (4×4)", "Hard (5×5)" });
        difficultyBox.setFont(new Font("Segoe UI", Font.BOLD, 14));
        difficultyBox.setBackground(new Color(55, 55, 75));
        difficultyBox.setForeground(TEXT_COLOR);

        difficultyBox.addActionListener(e -> {
            String choice = (String) difficultyBox.getSelectedItem();
            assert choice != null;
            if (choice.contains("3"))
                gridSize = 3;
            else if (choice.contains("4"))
                gridSize = 4;
            else
                gridSize = 5;

            tries = gridSize * 2;
            initializeGame();
        });

        diffPanel.add(diffLabel);
        diffPanel.add(difficultyBox);

        topPanel.add(title);
        topPanel.add(Box.createVerticalStrut(10));
        topPanel.add(rules);
        topPanel.add(Box.createVerticalStrut(15));
        topPanel.add(diffPanel);

        add(topPanel, BorderLayout.NORTH);

        // BOTTOM STATUS AREA
        JPanel bottomPanel = new JPanel();
        bottomPanel.setLayout(new BoxLayout(bottomPanel, BoxLayout.Y_AXIS));
        bottomPanel.setBackground(DARK_BACKGROUND);
        bottomPanel.setBorder(BorderFactory.createEmptyBorder(10, 20, 20, 20));

        triesLabel = new JLabel("Tries left: " + tries);
        triesLabel.setForeground(TEXT_COLOR);
        triesLabel.setFont(new Font("Segoe UI", Font.BOLD, 18));
        triesLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        statusLabel = new JLabel("Good luck, captain!");
        statusLabel.setForeground(TEXT_COLOR);
        statusLabel.setFont(new Font("Segoe UI", Font.PLAIN, 16));
        statusLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Play Again Button
        playAgainButton = new JButton("Play Again");
        playAgainButton.setFont(new Font("Segoe UI", Font.BOLD, 16));
        playAgainButton.setForeground(TEXT_COLOR);
        playAgainButton.setBackground(ACCENT_COLOR);
        playAgainButton.setFocusPainted(false);
        playAgainButton.setBorder(BorderFactory.createEmptyBorder(10, 25, 10, 25));
        playAgainButton.setAlignmentX(Component.CENTER_ALIGNMENT);
        playAgainButton.setVisible(false);
        playAgainButton.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        playAgainButton.setOpaque(true);
        playAgainButton.setBorderPainted(false);

        // Hover effect
        playAgainButton.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseEntered(MouseEvent e) {
                playAgainButton.setBackground(ACCENT_COLOR.brighter());
            }

            @Override
            public void mouseExited(MouseEvent e) {
                playAgainButton.setBackground(ACCENT_COLOR);
            }
        });

        playAgainButton.addActionListener(e -> initializeGame());

        bottomPanel.add(Box.createVerticalStrut(5));
        bottomPanel.add(triesLabel);
        bottomPanel.add(Box.createVerticalStrut(5));
        bottomPanel.add(statusLabel);
        bottomPanel.add(Box.createVerticalStrut(15));
        bottomPanel.add(playAgainButton);
        bottomPanel.add(Box.createVerticalStrut(10));

        add(bottomPanel, BorderLayout.SOUTH);

        initializeGame();
        setVisible(true);
    }

    // GAME SETUP
    private void initializeGame() {
        if (gridPanel != null)
            remove(gridPanel);

        tries = gridSize * 2;
        triesLabel.setText("Tries left: " + tries);
        statusLabel.setText("New game started!");
        playAgainButton.setVisible(false);
        difficultyBox.setEnabled(true);

        buttons = new JButton[gridSize][gridSize];

        gridPanel = new JPanel(new GridLayout(gridSize, gridSize, 8, 8));
        gridPanel.setBackground(GRID_BACKGROUND);
        gridPanel.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));

        Random rand = new Random();
        treasureRow = rand.nextInt(gridSize);
        treasureCol = rand.nextInt(gridSize);

        // Create buttons
        for (int r = 0; r < gridSize; r++) {
            for (int c = 0; c < gridSize; c++) {
                JButton btn = getJButton(r, c);

                buttons[r][c] = btn;
                gridPanel.add(btn);
            }
        }

        add(gridPanel, BorderLayout.CENTER);
        revalidate();
        repaint();
    }

    // BUTTON CREATION
    private JButton getJButton(int r, int c) {
        JButton btn = new JButton("?");

        btn.setFont(BUTTON_FONT);
        btn.setBackground(UNCLICKED_BUTTON);
        btn.setForeground(TEXT_COLOR);
        btn.setOpaque(true);
        btn.setBorderPainted(false);
        btn.setFocusPainted(false);

        btn.setHorizontalAlignment(SwingConstants.CENTER);
        btn.setVerticalAlignment(SwingConstants.CENTER);

        // Hover effect
        btn.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseEntered(MouseEvent e) {
                if (btn.isEnabled())
                    btn.setBackground(UNCLICKED_HOVER);
            }

            @Override
            public void mouseExited(MouseEvent e) {
                if (btn.isEnabled())
                    btn.setBackground(UNCLICKED_BUTTON);
            }
        });

        btn.addActionListener(e -> handleMove(btn, r, c));
        return btn;
    }

    // PLAYER MOVE
    private void handleMove(JButton btn, int r, int c) {
        if (!btn.isEnabled())
            return;

        tries--;
        triesLabel.setText("Tries left: " + tries);

        if (r == treasureRow && c == treasureCol) {
            btn.setBackground(WIN_COLOR);
            btn.setText("💎");
            btn.setFont(EMOJI_FONT);
            statusLabel.setText("🎉 You found the treasure! YOU WIN!");
            disableAll();
            return;
        }

        // HINT SYSTEM
        int rowDist = Math.abs(r - treasureRow);
        int colDist = Math.abs(c - treasureCol);
        int distance = rowDist + colDist;

        String hint;
        Color hintColor;

        if (distance == 1) {
            hint = "HOT";
            hintColor = new Color(255, 70, 70);
            statusLabel.setText("You are one step away! HOT!");
        } else if (distance <= 2) {
            hint = "WARM";
            hintColor = new Color(255, 130, 0);
            statusLabel.setText("You're close! WARM.");
        } else if (distance <= gridSize / 2) {
            hint = "COOL";
            hintColor = new Color(255, 230, 60);
            statusLabel.setText("Getting closer... COOL.");
        } else {
            hint = "COLD";
            hintColor = new Color(80, 120, 255);
            statusLabel.setText("You're far away. COLD.");
        }

        btn.setText(hint);
        btn.setBackground(hintColor);
        btn.setEnabled(false);

        if (tries == 0) {
            statusLabel.setText("You're out of tries! Game Over!");

            JButton treasureBtn = buttons[treasureRow][treasureCol];
            treasureBtn.setText("💎");
            treasureBtn.setFont(EMOJI_FONT);
            treasureBtn.setBackground(REVEAL_COLOR);

            disableAll();
        }
    }

    private void disableAll() {
        for (JButton[] row : buttons)
            for (JButton b : row)
                b.setEnabled(false);

        difficultyBox.setEnabled(false);
        playAgainButton.setVisible(true);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(TreasureHunt::new);
    }
}
