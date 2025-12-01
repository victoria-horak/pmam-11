package com.example.webapp;
import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/deletedessert")
public class DeleteServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        int orderId = Integer.parseInt(request.getParameter("orderId"));

        OrdersDAO taskDAO = new OrdersDAO();
        boolean deleted = taskDAO.deleteOrder(orderId);

        if (deleted) {
            // Перенаправлення на сторінку індексу після видалення
            response.sendRedirect("index.jsp");
        } else {
            // Обробка помилки видалення
            response.getWriter().println("Помилка видалення десерту");
        }
    }
}

