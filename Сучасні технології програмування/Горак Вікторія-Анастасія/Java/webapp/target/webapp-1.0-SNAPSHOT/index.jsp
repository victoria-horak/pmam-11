<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="com.example.webapp.User, com.example.webapp.OrdersDAO, com.example.webapp.Orders" %>
<%@ page import="java.util.List" %>
<!-- Замініть your.package на фактичний шлях до ваших пакетів та класів -->

<%
    User user = (User) session.getAttribute("user"); // Отримання користувача з сесії

    // Функція для перевірки, чи користувач увійшов у систему
    boolean isLoggedIn = (user != null);
%>

<!DOCTYPE html>
<html>
<head>
    <title>JSP - Orders</title>
    <style>
        /* Стилі для меню */
        ul.menu {
            background-color: #333; /* Темний фон меню */
            color: #fff; /* Білий текст */
            padding: 10px 0;
        }

        ul.menu li a {
            color: #fff; /* Білий текст посилань */
            padding: 8px 16px;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }

        ul.menu li a:hover {
            background-color: #555; /* Темніше при наведенні */
        }

        /* Стилі для таблиці */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-family: Arial, sans-serif;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        th, td:nth-child(4), td:nth-child(5) {
            text-align: center;
        }

        /* Стилі для кнопок у таблиці */
        .action-buttons input[type="submit"] {
            background-color: #4caf50;
            color: #fff;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .action-buttons input[type="submit"]:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
<ul class="menu">
    <%-- Відображення меню залежно від статусу користувача --%>
    <% if (isLoggedIn) { %>
    <li><a href="logout">Logout</a></li>
    <li><a href="Add.jsp">Add</a></li>
    <% } else { %>
    <li><a href="login.jsp">Login</a></li>
    <li><a href="registration.jsp">Register</a></li>
    <li><a href="Add.jsp">Add</a></li>
    <% } %>
</ul>

<div class="catalog">
    <table>
        <tr>
            <th>Username</th>
            <th>Address</th>
            <th>Phone Number</th>
            <th></th>
            <th></th>
        </tr>
        <% List<Orders> orders = OrdersDAO.getAllOrders(); %>
        <% for (Orders order : orders) { %>
        <tr>
            <td><%= order.getUsername() %></td>
            <td><%= order.getAdress() %></td>
            <td><%= order.getPhone_Number() %></td>
            <td class="action-buttons">
                <form action="update.jsp" method="get">
                    <input type="hidden" name="id" value="<%= order.getId() %>">
                    <input type="submit" value="Update">
                </form>
            </td>
            <td class="action-buttons">
                <form action="deletedessert" method="post">
                    <input type="hidden" name="orderId" value="<%= order.getId() %>">
                    <input type="submit" value="Delete">
                </form>
            </td>
        </tr>
        <% } %>
    </table>
</div>
</body>
</html>
