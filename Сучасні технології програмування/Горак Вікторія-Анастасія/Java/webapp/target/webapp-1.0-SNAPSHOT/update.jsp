<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.example.webapp.OrdersDAO, com.example.webapp.Orders" %>
<!-- інші імпорти, стилі, заголовок сторінки і т.д. -->

<!DOCTYPE html>
<html>
<head>
  <title>Update Order</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }

    h1 {
      text-align: center;
    }

    form {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      background-color: #f9f9f9; /* Зміна колірного фону форми */
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold; /* Зміна жирності тексту міток */
    }

    input[type="text"],
    input[type="number"],
    textarea {
      width: calc(100% - 12px);
      padding: 8px;
      margin-bottom: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 16px; /* Збільшення розміру шрифту для полів вводу */
    }

    input[type="submit"] {
      background-color: #4caf50;
      color: #fff;
      padding: 12px 24px; /* Збільшення відступів кнопки */
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 18px; /* Збільшення розміру шрифту кнопки */
      text-transform: uppercase; /* Перетворення тексту кнопки на верхній регістр */
    }

    input[type="submit"]:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body>
<h1>Update order</h1>
<%
  int orderId = Integer.parseInt(request.getParameter("id"));
  Orders order = OrdersDAO.getOrderById(orderId);
%>

<form action="update" method="post">
  <input type="hidden" name="id" value="<%= order.getId() %>">
  <label for="username">New username:</label>
  <input type="text" id="username" name="username" value="<%= order.getUsername() %>" required><br>
  <label for="address">New adress:</label>
  <input type="text" id="address" name="address" value="<%= order.getAdress() %>" required><br>
  <label for="phone_number">New phone:</label><br>
  <input id="phone_number" name="phone_number" value=" <%= order.getPhone_Number() %>" required><br>
  <input type="submit" value="Update">
</form>
</body>
</html>
