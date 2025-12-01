package com.example.webapp;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ClothesDAO {
    private static final String URL = "jdbc:postgresql://localhost:5432/postgres";
    private static final String USER = "postgres";
    private static final String PASSWORD = "1234";

    // Метод для отримання з'єднання з базою даних
    private static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
    public static Clothes getClotheById(int clotheId) {
        Clothes clothes = null;
        Connection connection = null;
        PreparedStatement statement = null;
        ResultSet resultSet = null;

        try {
            Class.forName("org.postgresql.Driver");
            connection = DriverManager.getConnection(URL, USER, PASSWORD);

            String query = "SELECT * FROM clothes WHERE id = ?";
            statement = connection.prepareStatement(query);
            statement.setInt(1, clotheId);
            resultSet = statement.executeQuery();

            if (resultSet.next()) {
                clothes = new Clothes();
                clothes.setId(resultSet.getInt("id"));
                clothes.setName(resultSet.getString("name"));
                clothes.setPrice(resultSet.getDouble("price"));
                clothes.setDescription(resultSet.getString("description"));
                // Встановлення інших властивостей, якщо вони є
            }
            if (clothes==null)
            {
                clothes=new Clothes();
                clothes.setId(clotheId);
                clothes.setName("f");
                clothes.setDescription("gf");
                clothes.setPrice(12);
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

        return clothes;
    }
    public boolean deleteClothe(int clotheId) {
        boolean deleted = false;
        try (Connection connection = DriverManager.getConnection(URL, USER, PASSWORD)) {
            String query = "DELETE FROM clothes WHERE id = ?";
            PreparedStatement statement = connection.prepareStatement(query);
            statement.setInt(1, clotheId);

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
    public static List<Clothes> getAllClothes() {
        List<Clothes> clothes = new ArrayList<>();
        try (Connection conn = getConnection();

             PreparedStatement statement = conn.prepareStatement("SELECT * FROM clothes");
             ResultSet resultSet = statement.executeQuery()) {
            Class.forName("org.postgresql.Driver");
            while (resultSet.next()) {
                Clothes clothe = new Clothes();
                clothe.setId(resultSet.getInt("id"));
                clothe.setName(resultSet.getString("name"));
                clothe.setPrice(resultSet.getDouble("price"));
                clothe.setDescription(resultSet.getString("description"));
                // Інші поля, якщо необхідно
                clothes.add(clothe);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            // Обробка винятків при роботі з БД
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
        return clothes;
    }

    // Інші методи для роботи з даними в БД (додавання, видалення, оновлення)
}
