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
import jakarta.servlet.http.HttpSession;
import org.postgresql.Driver;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String username = request.getParameter("username");
        String password = request.getParameter("password");

        try {
            Class.forName("org.postgresql.Driver");

            Connection connection = DatabaseUtil.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "SELECT * FROM users WHERE username = ? AND password = ?");
            preparedStatement.setString(1, username);
            preparedStatement.setString(2, password);

            ResultSet resultSet = preparedStatement.executeQuery();

            if (resultSet.next()) {
                User user = new User();
                user.setUsername(username);
                user.setPassword("username");

                // Створення сесії та збереження об'єкта User в сесії
                HttpSession session = request.getSession();
                session.setAttribute("user", user);
                // Логін успішний, перенаправлення на головну сторінку
                response.sendRedirect("index.jsp");
            } else {
                // Неправильні дані логіну, перенаправлення на сторінку логіну з повідомленням
                request.setAttribute("errorMessage", "Неправильне ім'я користувача або пароль");
                request.getRequestDispatcher("login.jsp").forward(request, response);
            }

            connection.close();
        }
        catch (SQLException e) {

            e.printStackTrace();
            String errorMessage = "Помилка під час підключення до бази даних: " + e.getMessage();
            request.setAttribute("errorMessage", errorMessage);
            request.getRequestDispatcher("error.jsp").forward(request, response);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
}
