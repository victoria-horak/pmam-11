package com.example.webapp;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.postgresql.Driver;
@WebServlet("/add")
public class AddServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String address = request.getParameter("address");
        String username = request.getParameter("username");
        String phone_number = request.getParameter("phone_number");

        try {
            Class.forName("org.postgresql.Driver");
            Connection connection = DatabaseUtil.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "INSERT INTO orders (address, username, phone_number) VALUES (?, ?, ?)");
            preparedStatement.setString(1, address);
            preparedStatement.setString(2, username);
            preparedStatement.setString(3, phone_number);
            preparedStatement.executeUpdate();

            connection.close();

            // Після успішного додавання десерту перенаправлення на головну сторінку або іншу сторінку
            response.sendRedirect("index.jsp");
        } catch (SQLException e) {

            e.printStackTrace();
            String errorMessage = "Помилка під час підключення до бази даних: " + e.getMessage();
            request.setAttribute("errorMessage", errorMessage);
            request.getRequestDispatcher("error.jsp").forward(request, response);

        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            e.printStackTrace(); // Обробка винятків IO
            // Можна відправити користувачеві повідомлення про помилку
        }

        // Якщо редірект не відбувся, можна вивести повідомлення, що щось пішло не так
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // Встановлення статусу помилки сервера
        response.getWriter().write("Виникла помилка при спробі додати замовлення"); // Відправлення повідомлення про помилку користувачеві
    }
}
