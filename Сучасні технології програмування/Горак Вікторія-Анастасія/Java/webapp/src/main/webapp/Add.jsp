<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Add Car</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
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
<form action="add" method="post">
    <label for="address">adress:</label>
    <input type="text" id="address" name="address" required><br><br>

    <label for="username">username:</label>
    <input type="text" id="username" name="username" required><br><br>

    <label for="phone_number">phone_number:</label><br>
    <textarea id="phone_number" name="phone_number"  required></textarea><br><br>

    <input type="submit" value="Add">
</form>
</body>
</html>
