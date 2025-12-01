package com.example.webapp;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class OrdersDAO {
    private static final String URL = "jdbc:postgresql://localhost:5432/postgres";
    private static final String USER = "postgres";
    private static final String PASSWORD = "1234";

    // Метод для отримання з'єднання з базою даних
    private static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
    public static Orders getOrderById(int carId) {
        Orders orders = null;
        Connection connection = null;
        PreparedStatement statement = null;
        ResultSet resultSet = null;

        try {
            Class.forName("org.postgresql.Driver");
            connection = DriverManager.getConnection(URL, USER, PASSWORD);

            String query = "SELECT * FROM orders WHERE id = ?";
            statement = connection.prepareStatement(query);
            statement.setInt(1, carId);
            resultSet = statement.executeQuery();

            if (resultSet.next()) {
                orders = new Orders();
                orders.setId(resultSet.getInt("id"));
                orders.setUsername(resultSet.getString("username"));
                orders.setAdress(resultSet.getString("address"));
                orders.setPhone_Number(resultSet.getString("phone_number"));
                // Встановлення інших властивостей, якщо вони є
            }
            if (orders==null)
            {
                orders=new Orders();
                orders.setId(carId);
                orders.setUsername("f");
                orders.setPhone_Number("gf");
                orders.setAdress("12");
            }

        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
            // Обробка винятків
        } finally {
            // Закриття ресурсів (resultSet, statement, connection)
            try {
                if (resultSet != null) resultSet.close();
                if (statement != null) statement.close();
                if (connection != null) connection.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        return orders;
    }
    public boolean deleteOrder(int orderId) {
        boolean deleted = false;
        try (Connection connection = DriverManager.getConnection(URL, USER, PASSWORD)) {
            String query = "DELETE FROM orders WHERE id = ?";
            PreparedStatement statement = connection.prepareStatement(query);
            statement.setInt(1, orderId);

            int rowsDeleted = statement.executeUpdate();
            if (rowsDeleted > 0) {
                deleted = true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            // Обробка винятків
        }
        return deleted;
    }
    // Метод для отримання списку всіх десертів з бази даних
    public static List<Orders> getAllOrders() {
        List<Orders> orders = new ArrayList<>();
        try (Connection conn = getConnection();

             PreparedStatement statement = conn.prepareStatement("SELECT * FROM orders");
             ResultSet resultSet = statement.executeQuery()) {
            Class.forName("org.postgresql.Driver");
            while (resultSet.next()) {
                Orders order = new Orders();
                order.setId(resultSet.getInt("id"));
                order.setUsername(resultSet.getString("username"));
                order.setAdress(resultSet.getString("address"));
                order.setPhone_Number(resultSet.getString("phone_number"));
                // Інші поля, якщо необхідно
                orders.add(order);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            // Обробка винятків при роботі з БД
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
        return orders;
    }

    // Інші методи для роботи з даними в БД (додавання, видалення, оновлення)
}
