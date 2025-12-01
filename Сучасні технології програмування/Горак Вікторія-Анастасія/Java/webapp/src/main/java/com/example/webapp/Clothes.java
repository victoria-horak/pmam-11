package com.example.webapp;

public class Clothes {
    private int Id;
    private String name;
    private double price;
    private String description;
    // Інші необхідні поля

    // Геттер та сеттер для поля name
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Геттер та сеттер для поля price
    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    // Геттер та сеттер для поля description
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getId() {
        return Id;
    }

    public void setId(int id) {
        Id=id;
    }


    // Інші геттери та сеттери для додаткових полів, якщо потрібно
}
