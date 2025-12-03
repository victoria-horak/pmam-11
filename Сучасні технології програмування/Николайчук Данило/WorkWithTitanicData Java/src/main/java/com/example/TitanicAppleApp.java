package com.example;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartPanel;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.CategoryAxis;
import org.jfree.chart.axis.CategoryLabelPositions;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.data.category.DefaultCategoryDataset;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.JTableHeader;
import java.awt.*;
import java.io.InputStreamReader;
import java.io.Reader;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

public class TitanicAppleApp {

    public static void main(String[] args) throws Exception {
        JFrame frame = new JFrame("Аналіз Titanic та Apple");
        frame.setSize(1500, 950);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JTabbedPane tabs = new JTabbedPane();
        tabs.setFont(new Font("Arial", Font.BOLD, 18));

        // ==================== TITANIC ====================
        JPanel titanicPanel = new JPanel();
        titanicPanel.setLayout(new BorderLayout());
        titanicPanel.setBorder(new EmptyBorder(10,10,10,10));

        try (Reader inTitanic = new InputStreamReader(
                TitanicAppleApp.class.getResourceAsStream("/titanic.csv"))) {

            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                    .withFirstRecordAsHeader()
                    .parse(inTitanic);

            List<Map<String, String>> titanicData = new ArrayList<>();
            for (CSVRecord r : records) titanicData.add(r.toMap());

            // ---- Числові метрики ----
            long totalPassengers = titanicData.size();
            long survivedCount = titanicData.stream()
                    .filter(r -> r.get("Survived").equals("1")).count();
            long deadCount = totalPassengers - survivedCount;

            long femaleSurvived = titanicData.stream()
                    .filter(r -> r.get("Sex").equalsIgnoreCase("female") && r.get("Survived").equals("1"))
                    .count();
            long femaleDead = titanicData.stream()
                    .filter(r -> r.get("Sex").equalsIgnoreCase("female") && r.get("Survived").equals("0"))
                    .count();
            long maleSurvived = titanicData.stream()
                    .filter(r -> r.get("Sex").equalsIgnoreCase("male") && r.get("Survived").equals("1"))
                    .count();
            long maleDead = titanicData.stream()
                    .filter(r -> r.get("Sex").equalsIgnoreCase("male") && r.get("Survived").equals("0"))
                    .count();

            double avgAgeSurvived = titanicData.stream()
                    .filter(r -> !r.get("Age").isEmpty() && r.get("Survived").equals("1"))
                    .mapToDouble(r -> Double.parseDouble(r.get("Age")))
                    .average().orElse(0.0);

            double avgAgeDead = titanicData.stream()
                    .filter(r -> !r.get("Age").isEmpty() && r.get("Survived").equals("0"))
                    .mapToDouble(r -> Double.parseDouble(r.get("Age")))
                    .average().orElse(0.0);

            DefaultTableModel statsModel = new DefaultTableModel();
            statsModel.addColumn("Metric");
            statsModel.addColumn("Value");
            statsModel.addRow(new Object[]{"Total Passengers", totalPassengers});
            statsModel.addRow(new Object[]{"Survived", survivedCount});
            statsModel.addRow(new Object[]{"Died", deadCount});
            statsModel.addRow(new Object[]{"Female Survived", femaleSurvived});
            statsModel.addRow(new Object[]{"Female Dead", femaleDead});
            statsModel.addRow(new Object[]{"Male Survived", maleSurvived});
            statsModel.addRow(new Object[]{"Male Dead", maleDead});
            statsModel.addRow(new Object[]{"Average Age (Survived)", String.format("%.2f", avgAgeSurvived)});
            statsModel.addRow(new Object[]{"Average Age (Dead)", String.format("%.2f", avgAgeDead)});

            JTable statsTable = new JTable(statsModel);
            statsTable.setBackground(new Color(220, 235, 245));
            styleTable(statsTable);

            // ---- Групування по класу, статі та вижив/загинув ----
            DefaultTableModel groupModel = new DefaultTableModel();
            groupModel.addColumn("Class");
            groupModel.addColumn("Sex");
            groupModel.addColumn("Survived");
            groupModel.addColumn("Count");

            Map<String, Long> groupByClassSexSurvived = titanicData.stream()
                    .collect(Collectors.groupingBy(
                            r -> r.get("Pclass") + "_" + r.get("Sex") + "_" + r.get("Survived"),
                            Collectors.counting()
                    ));

            for (Map.Entry<String, Long> entry : groupByClassSexSurvived.entrySet()) {
                String[] parts = entry.getKey().split("_");
                String pclass = parts[0];
                String sex = parts[1];
                String survived = parts[2].equals("1") ? "Yes" : "No";
                groupModel.addRow(new Object[]{pclass, sex, survived, entry.getValue()});
            }

            JTable groupTable = new JTable(groupModel);
            groupTable.setBackground(new Color(220, 245, 220));
            styleTable(groupTable);

            // ---- Графік виживших по класу та статі ----
            DefaultCategoryDataset dataset = new DefaultCategoryDataset();
            groupByClassSexSurvived.forEach((k, v) -> {
                String[] parts = k.split("_");
                String pclass = parts[0];
                String sex = parts[1];
                String survived = parts[2].equals("1") ? "Survived" : "Dead";
                dataset.addValue(v, survived + " (" + sex + ")", pclass);
            });

            JFreeChart chart = ChartFactory.createBarChart(
                    "Titanic: Survival by Class & Sex",
                    "Class",
                    "Count",
                    dataset
            );

            // ---- Графік виживших по віковим категоріям ----
            String[] ageGroups = {"0-9","10-19","20-29","30-39","40-49","50-59","60+"};
            Map<String, Map<String, Integer>> ageGroupCounts = new LinkedHashMap<>();
            for (String g : ageGroups) {
                ageGroupCounts.put(g, new HashMap<>());
                ageGroupCounts.get(g).put("Survived", 0);
                ageGroupCounts.get(g).put("Dead", 0);
            }

            titanicData.stream()
                    .filter(r -> !r.get("Age").isEmpty())
                    .forEach(r -> {
                        double age = Double.parseDouble(r.get("Age"));
                        String ageGroup = age < 10 ? "0-9" :
                                          age < 20 ? "10-19" :
                                          age < 30 ? "20-29" :
                                          age < 40 ? "30-39" :
                                          age < 50 ? "40-49" :
                                          age < 60 ? "50-59" :
                                          "60+";
                        String survived = r.get("Survived").equals("1") ? "Survived" : "Dead";
                        ageGroupCounts.get(ageGroup).put(survived, ageGroupCounts.get(ageGroup).get(survived)+1);
                    });

            DefaultCategoryDataset ageDataset = new DefaultCategoryDataset();
            for (String g : ageGroups) {
                ageDataset.addValue(ageGroupCounts.get(g).get("Survived"), "Survived", g);
                ageDataset.addValue(ageGroupCounts.get(g).get("Dead"), "Dead", g);
            }

            JFreeChart ageChart = ChartFactory.createBarChart(
                    "Titanic: Survival by Age Group",
                    "Age Group",
                    "Count",
                    ageDataset
            );

            // Панель з таблицями і графіками
            JPanel topPanel = new JPanel(new GridLayout(1, 2, 20, 20));
            topPanel.add(new JScrollPane(statsTable));
            topPanel.add(new JScrollPane(groupTable));

            JPanel chartPanel = new JPanel(new GridLayout(1, 2, 20, 20));
            chartPanel.add(new ChartPanel(chart));
            chartPanel.add(new ChartPanel(ageChart));

            titanicPanel.add(topPanel, BorderLayout.NORTH);
            titanicPanel.add(chartPanel, BorderLayout.CENTER);
        }

        tabs.add("Titanic Analysis", titanicPanel);

        // ==================== APPLE ====================
        JPanel applePanel = new JPanel(new BorderLayout());
        applePanel.setBorder(new EmptyBorder(10,10,10,10));

        try (Reader inApple = new InputStreamReader(
                TitanicAppleApp.class.getResourceAsStream("/apple.csv"))) {

            Iterable<CSVRecord> appleRecords = CSVFormat.DEFAULT
                    .withFirstRecordAsHeader()
                    .parse(inApple);

            Map<Integer, List<Double>> weekOpenPrices = new HashMap<>();
            Map<Integer, Date> weekStartDates = new HashMap<>();
            Set<Integer> yearsAbove = new HashSet<>();

            SimpleDateFormat sdf = new SimpleDateFormat("M/d/yyyy");
            Calendar cal = Calendar.getInstance();

            for (CSVRecord r : appleRecords) {
                String dateStr = r.get("Date");
                double open = Double.parseDouble(r.get("Open"));
                double close = Double.parseDouble(r.get("Close"));

                Date date = sdf.parse(dateStr);
                cal.setTime(date);
                int year = cal.get(Calendar.YEAR);
                int week = cal.get(Calendar.WEEK_OF_YEAR);

                cal.set(Calendar.DAY_OF_WEEK, cal.getFirstDayOfWeek());
                Date weekStart = cal.getTime();

                weekOpenPrices.putIfAbsent(week, new ArrayList<>());
                weekOpenPrices.get(week).add(open);

                weekStartDates.putIfAbsent(week, weekStart);

                if (close > 110.2) yearsAbove.add(year);
            }

            Map<Date, Double> avgWeekOpen = new TreeMap<>();
            for (Map.Entry<Integer, List<Double>> e : weekOpenPrices.entrySet()) {
                Date weekStart = weekStartDates.get(e.getKey());
                avgWeekOpen.put(weekStart,
                        e.getValue().stream().mapToDouble(d -> d).average().orElse(0.0));
            }

            DefaultTableModel appleModel = new DefaultTableModel();
            appleModel.addColumn("Week Start");
            appleModel.addColumn("Avg Open");
            DecimalFormat df = new DecimalFormat("#.##");
            avgWeekOpen.forEach((date, value) -> appleModel.addRow(new Object[]{sdf.format(date), df.format(value)}));

            JTable appleTable = new JTable(appleModel);
            appleTable.setBackground(new Color(230, 245, 230));
            styleTable(appleTable);

            DefaultCategoryDataset appleDataset = new DefaultCategoryDataset();
            avgWeekOpen.forEach((date, value) -> appleDataset.addValue(value, "Avg Open", sdf.format(date)));

            JFreeChart appleChart = ChartFactory.createLineChart(
                    "Apple: Average Open Price per Week",
                    "Week Start",
                    "Avg Open Price",
                    appleDataset
            );

            CategoryPlot plot = appleChart.getCategoryPlot();
            CategoryAxis xAxis = plot.getDomainAxis();
            xAxis.setCategoryLabelPositions(CategoryLabelPositions.UP_45);

            DefaultTableModel yearsModel = new DefaultTableModel();
            yearsModel.addColumn("Years with Close > 110.2");
            yearsAbove.forEach(y -> yearsModel.addRow(new Object[]{y}));
            JTable yearsTable = new JTable(yearsModel);
            yearsTable.setBackground(new Color(245, 230, 230));
            styleTable(yearsTable);

            JPanel topApplePanel = new JPanel(new GridLayout(1, 2, 20, 20));
            topApplePanel.add(new JScrollPane(appleTable));
            topApplePanel.add(new JScrollPane(yearsTable));

            JPanel chartApplePanel = new JPanel(new BorderLayout());
            chartApplePanel.add(new ChartPanel(appleChart), BorderLayout.CENTER);

            applePanel.add(topApplePanel, BorderLayout.NORTH);
            applePanel.add(chartApplePanel, BorderLayout.CENTER);
        }

        tabs.add("Apple Analysis", applePanel);

        frame.add(tabs, BorderLayout.CENTER);
        frame.setVisible(true);
    }

    private static void styleTable(JTable table) {
        Font font = new Font("Arial", Font.PLAIN, 16);
        table.setFont(font);
        table.setRowHeight(24);

        JTableHeader header = table.getTableHeader();
        header.setFont(new Font("Arial", Font.BOLD, 18));
        header.setBackground(new Color(70, 130, 180));
        header.setForeground(Color.WHITE);

        table.setDefaultRenderer(Object.class, new DefaultTableCellRenderer() {
            @Override
            public Component getTableCellRendererComponent(JTable table, Object value,
                                                           boolean isSelected, boolean hasFocus,
                                                           int row, int column) {
                Component c = super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);
                if (!isSelected) {
                    c.setBackground(row % 2 == 0 ? new Color(245, 245, 245) : Color.WHITE);
                }
                return c;
            }
        });
    }
}
