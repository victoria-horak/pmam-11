package com.example.webapp;

public class Orders {
    private int Id;
    private String username;
    private String adress;
    private String phone_number;
    // Інші необхідні поля

    // Геттер та сеттер для поля name
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // Геттер та сеттер для поля price
    public String getAdress() {
        return adress;
    }

    public void setAdress(String adress) {
        this.adress = adress;
    }

    // Геттер та сеттер для поля description
    public String getPhone_Number() {
        return phone_number;
    }

    public void setPhone_Number(String phone_Number) {
        this.phone_number = phone_Number;
    }

    public int getId() {
        return Id;
    }

    public void setId(int id) {
        Id=id;
    }


    // Інші геттери та сеттери для додаткових полів, якщо потрібно
}
