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
@WebServlet("/registration")
public class RegistrationServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String email = request.getParameter("email");

        try {
            Class.forName("org.postgresql.Driver");
            Connection connection = DatabaseUtil.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
            preparedStatement.setString(1, username);
            preparedStatement.setString(2, password);
            preparedStatement.setString(3, email);

            int rowsInserted = preparedStatement.executeUpdate();
            if (rowsInserted > 0) {
                response.sendRedirect("index.jsp"); // Редірект на головну сторінку після успішної реєстрації
            } else {
                response.sendRedirect("registration.jsp"); // Редірект на сторінку реєстрації при помилці
            }

            connection.close();
        } catch (SQLException e) {
            e.printStackTrace();
            String errorMessage = "Помилка під час підключення до бази даних: " + e.getMessage();
            request.setAttribute("errorMessage", errorMessage);
            request.getRequestDispatcher("error.jsp").forward(request, response);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
}
