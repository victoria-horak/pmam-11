using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace RpgInventorySystem
{
    // МОДЕЛЬ ДАНИХ 

    // Типи предметів
    public enum ItemType { Weapon, Armor, Potion, Resource, Artifact }

    // Рідкісність 
    public enum Rarity { Common, Rare, Epic, Legendary }

    // Клас Предмета.
    public class Item
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ItemType Type { get; set; }
        public Rarity Rarity { get; set; }
        public double Price { get; set; } 
        public double Weight { get; set; }

        public override string ToString()
        {
            // Форматований вивід для таблиці
            return string.Format(
                "| {0,-4} | {1,-25} | {2,-10} | {3,-10} | {4,7} gold | {5,5} kg |",
                Id, Name, Type, Rarity, Price, Weight
            );
        }
    }

    // ГЕНЕРАТОР ПРЕДМЕТІВ 

    public static class InventoryGenerator
    {
        private static Random _rand = new Random();

        // Списки слів для генерації випадкових назв
        private static string[] _adjectives = { "Rusty", "Shiny", "Broken", "Magic", "Ancient", "Dark", "Holy", "Vorpal" };
        private static string[] _nouns = { "Sword", "Shield", "Breastplate", "Potion", "Ring", "Amulet", "Bone", "Gem" };

        public static List<Item> Generate(int count)
        {
            var items = new List<Item>();

            for (int i = 1; i <= count; i++)
            {
                var type = (ItemType)_rand.Next(0, 5);
                
                // Вага і ціна залежать від типу
                double weight = type == ItemType.Potion ? 0.5 : _rand.Next(1, 15) + _rand.NextDouble();
                double price = _rand.Next(10, 1000);

                // Випадкова рідкісність
                // 70% Common, 20% Rare, 8% Epic, 2% Legendary
                int rarityRoll = _rand.Next(100);
                Rarity rarity = Rarity.Common;
                if (rarityRoll > 98) rarity = Rarity.Legendary;
                else if (rarityRoll > 90) rarity = Rarity.Epic;
                else if (rarityRoll > 70) rarity = Rarity.Rare;

                if (rarity == Rarity.Legendary) price *= 10;

                items.Add(new Item
                {
                    Id = i,
                    Name = $"{_adjectives[_rand.Next(_adjectives.Length)]} {_nouns[_rand.Next(_nouns.Length)]}",
                    Type = type,
                    Rarity = rarity,
                    Price = Math.Round(price, 0),
                    Weight = Math.Round(weight, 1)
                });
            }

            return items;
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.OutputEncoding = Encoding.UTF8;

            Console.WriteLine(" Генерація світу RPG... Створення 100 предметів...");
            
            List<Item> inventory = InventoryGenerator.Generate(100);

            while (true)
            {
                Console.WriteLine("\n================= RPG ІНВЕНТАР =================");
                Console.WriteLine("1. Показати всі Легендарні предмети");
                Console.WriteLine("2. Знайти найдорожчий предмет");
                Console.WriteLine("3. Зброя дешевше 100 золотих ");
                Console.WriteLine("4. Порахувати загальну вагу та вартість");
                Console.WriteLine("5. Згрупувати по Рідкісності - Статистика");
                Console.WriteLine("6. Відсортувати найважчі предмети");
                Console.WriteLine("7. Знайти предмет за частиною назви");
                Console.WriteLine("0. Вихід");
                Console.Write("Ваш вибір: ");

                var choice = Console.ReadLine();
                Console.WriteLine();

                switch (choice)
                {
                    case "1":
                        ShowLegendaryItems(inventory);
                        break;
                    case "2":
                        ShowMostExpensive(inventory);
                        break;
                    case "3":
                        ShowCheapWeapons(inventory);
                        break;
                    case "4":
                        ShowTotalStats(inventory);
                        break;
                    case "5":
                        ShowRarityStats(inventory);
                        break;
                    case "6":
                        ShowHeaviestItems(inventory);
                        break;
                    case "7":
                        SearchByName(inventory);
                        break;
                    case "0":
                        return;
                    default:
                        Console.WriteLine("Невідома команда.");
                        break;
                }

                Console.WriteLine("\nНатисніть Enter, щоб продовжити...");
                Console.ReadLine();
            }
        }

        static void ShowLegendaryItems(List<Item> items)
        {
            Console.WriteLine("--- ЛЕГЕНДАРНІ ПРЕДМЕТИ (Where) ---");

            var legendaries = items.Where(i => i.Rarity == Rarity.Legendary).ToList();

            if (legendaries.Any())
            {
                foreach (var item in legendaries)
                {
                    Console.WriteLine(item);
                }
            }
            else
            {
                Console.WriteLine("На жаль, легендарок не випало. Спробуйте перезапустити.");
            }
        }

        static void ShowMostExpensive(List<Item> items)
        {
            Console.WriteLine("--- НАЙДОРОЖЧИЙ ПРЕДМЕТ ---");

            var expensive = items.OrderByDescending(i => i.Price).FirstOrDefault();

            Console.WriteLine(expensive);
        }

        static void ShowCheapWeapons(List<Item> items)
        {
            Console.WriteLine("--- НАЙДЕШЕВША ЗБРОЯ ---");

            var cheapWeapons = items
                .Where(i => i.Type == ItemType.Weapon && i.Price < 100)
                .OrderBy(i => i.Price);

            foreach (var item in cheapWeapons)
            {
                Console.WriteLine(item);
            }
        }

        static void ShowTotalStats(List<Item> items)
        {
            Console.WriteLine("--- СТАТИСТИКА РЮКЗАКА ---");

            double totalWeight = items.Sum(i => i.Weight);
            double totalPrice = items.Sum(i => i.Price);
            double avgPrice = items.Average(i => i.Price);

            Console.WriteLine($"Кількість предметів: {items.Count}");
            Console.WriteLine($"Загальна вага:       {totalWeight:F1} kg");
            Console.WriteLine($"Загальна вартість:   {totalPrice:N0} gold");
            Console.WriteLine($"Середня ціна:        {avgPrice:N0} gold");
        }

        static void ShowRarityStats(List<Item> items)
        {
            Console.WriteLine("--- ГРУПУВАННЯ ---");

            var groups = items.GroupBy(i => i.Rarity);

            foreach (var group in groups)
            {
                Console.WriteLine($"{group.Key}: {group.Count()} шт.");
            }
        }

        static void ShowHeaviestItems(List<Item> items)
        {
            Console.WriteLine("--- ТОП-5 ВАЖКИХ ПРЕДМЕТІВ ---");

            var heavyItems = items
                .OrderByDescending(i => i.Weight)
                .Take(5);

            foreach (var item in heavyItems)
            {
                Console.WriteLine(item);
            }
        }

        static void SearchByName(List<Item> items)
        {
            Console.Write("Введіть частину назви (напр. 'Sword'): ");
            string search = Console.ReadLine();

            var results = items
                .Where(i => i.Name.IndexOf(search, StringComparison.OrdinalIgnoreCase) >= 0)
                .ToList();

            Console.WriteLine($"Знайдено: {results.Count}");
            foreach (var item in results)
            {
                Console.WriteLine(item);
            }
        }
    }
}