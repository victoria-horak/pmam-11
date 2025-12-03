#    ASCII Color Mixer Game 
#  гра у консолі, де можна змішувати базові кольори
#  для отримання вторинних та третинних кольорів.
#  Використовує ASCII рамки та ANSI кольори.

# ANSI Кольори 
#  Мапа кольорів: ключ - назва кольору, значення - ANSI 256-color код
COLOR_CODES = {
  "red"       => 196, # яскраво-червоний
  "blue"      => 27,  # глибокий синій
  "yellow"    => 226, # насичений жовтий
  "orange"    => 208, # помаранчевий
  "green"     => 46,  # яскраво-зелений
  "purple"    => 129, # фіолетовий
  "vermilion" => 202, # червоно-помаранчевий
  "teal"      => 44,  # бірюзовий
  "amber"     => 214  # бурштиновий
}

# Функція для забарвлення тексту
def colorize_by_key(text, key)
  code = COLOR_CODES[key]
  return text unless code
  "\e[38;5;#{code}m#{text}\e[0m"
end

#  У терміналі деякі символи (emoji, CJK) займають ширину 2
#  Для правильного малювання рамок треба враховувати це

# Видаляє ANSI escape-послідовності для коректного обчислення ширини
def strip_ansi(s)
  s.gsub(/\e\[[\d;]*m/, "")
end

# Перевіряє, чи символ займає ширину 2 (emoji/CJK)
def wide_char?(ch)
  code = ch.ord
  return true if (0x1F300..0x1F6FF).include?(code) # emoji / піктограми
  return true if (0x1F900..0x1F9FF).include?(code) # додаткові emoji
  return true if (0x2600..0x26FF).include?(code)   # символи
  return true if (0x2700..0x27BF).include?(code)   # дінгбати
  return true if (0x4E00..0x9FFF).include?(code)   # китайські ієрогліфи
  return true if (0x3040..0x30FF).include?(code)   # хірагана / катакана
  return true if (0x1100..0x11FF).include?(code)   # хангиль
  false
end

# Обчислює ширину тексту з урахуванням широких символів
def display_width(s)
  clean = strip_ansi(s)
  clean.chars.sum { |ch| wide_char?(ch) ? 2 : 1 }
end

#  Обгортає текст у рамку, враховуючи ширину emoji
def retro_box(text)
  lines = text.split("\n")
  width = lines.map { |l| display_width(l) }.max || 0

  top    = "╔" + "═" * (width + 2) + "╗"
  bottom = "╚" + "═" * (width + 2) + "╝"

  box = [top]
  lines.each do |line|
    pad = width - display_width(line)
    box << "║ #{line}#{' ' * pad} ║"
  end
  box << bottom
  box.join("\n")
end

#  Рецепти 
#  Кожен колір, який можна створити, має:
#    - requires: потрібні кольори та їх кількість
#    - type: Secondary (2-й) або Tertiary (3-й)
COLOR_RECIPES = {
  "orange"    => { requires: { "red" => 1, "yellow" => 1 }, type: "Secondary" },
  "green"     => { requires: { "blue" => 1, "yellow" => 1 }, type: "Secondary" },
  "purple"    => { requires: { "red" => 1, "blue" => 1 },   type: "Secondary" },
  "vermilion" => { requires: { "red" => 1, "orange" => 1 }, type: "Tertiary" },
  "teal"      => { requires: { "blue" => 1, "green" => 1 }, type: "Tertiary" },
  "amber"     => { requires: { "yellow" => 1, "orange" => 1 }, type: "Tertiary" }
}

#  Інвентар 
#  Тут зберігаються всі кольори гравця та їх кількість
$inventory = Hash.new(0)

# Показує інвентар гравця
def view_inventory
  puts retro_box("YOUR PALETTE")

  primary = %w[red blue yellow]

  puts "\nPrimary Colors:"
  primary.each do |c|
    puts "  - #{colorize_by_key(c.capitalize, c)}: #{$inventory[c]}" if $inventory[c] > 0
  end

  puts "\nMixed Colors:"
  ($inventory.keys - primary).sort.each do |c|
    puts "  - #{colorize_by_key(c.capitalize, c)}: #{$inventory[c]}" if $inventory[c] > 0
  end

  puts "\n" + ("-" * 40)
end

#  Команди 
#  ADD <color> <qty> — додає базові кольори до інвентаря
def add_item(parts)
  return puts "Usage: ADD <color> <qty>" if parts.size < 3

  color = parts[1].downcase
  qty   = parts[2].to_i

  return puts "You can only ADD: red, blue, yellow." unless %w[red blue yellow].include?(color)
  return puts "Quantity must be positive." if qty <= 0

  $inventory[color] += qty
  puts ">> Added #{qty} #{colorize_by_key(color.capitalize, color)}."
end

#  RECIPES — показує таблицю всіх рецептів змішування
def view_recipes
  text = "COLOR RECIPES:\n"
  COLOR_RECIPES.each do |result, data|
    req = data[:requires].map { |c, q| "#{q} #{c.capitalize}" }.join(" + ")
    text += "- #{colorize_by_key(result.capitalize, result)}: #{req}\n"
  end
  puts retro_box(text)
end

#  MIX <color> — створює змішаний колір, якщо є інгредієнти
def craft_item(color)
  color = color.downcase
  recipe = COLOR_RECIPES[color]
  return puts "No recipe for this color." unless recipe

  missing = recipe[:requires].filter { |c, req| $inventory[c] < req }
  unless missing.empty?
    puts "Missing:"
    missing.each { |c, req| puts "- #{req - $inventory[c]} #{c}" }
    return
  end

  recipe[:requires].each { |c, req| $inventory[c] -= req }
  $inventory[color] += 1

  puts "*** Created #{colorize_by_key(color.capitalize, color)}! ***"
end

#  Перемога
TARGET = {
  "orange"    => 1,
  "green"     => 1,
  "purple"    => 1,
  "vermilion" => 1,
  "teal"      => 1,
  "amber"     => 1
}

# Перевіряє, чи всі змішані кольори створені
def check_game_over
  TARGET.all? { |c, q| $inventory[c] >= q }
end

#  Вступ 
#  Виводить повні пояснення гри та команд
def show_intro
  intro = <<~T
    🎨 COLOR MIXER GAME

    Мета гри:
      Змішати ВСІ 6 вторинних та третинних кольорів.

    Початкові ресурси:
      #{colorize_by_key("Red", "red")} (5), \
      #{colorize_by_key("Blue", "blue")} (5), \
      #{colorize_by_key("Yellow", "yellow")} (5)

    Команди та пояснення:
      ADD <color> <qty> — додає базові кольори (Red, Blue, Yellow)
      MIX <color>       — створює змішаний колір за рецептом
      RECIPES           — показує таблицю всіх рецептів
      PALETTE           — показує ваш інвентар
      HELP              — показує коротку підказку по командах
      EXIT              — вихід з гри

    Кольори, які потрібно створити:
      #{colorize_by_key("Orange", "orange")} = Red + Yellow
      #{colorize_by_key("Green", "green")} = Blue + Yellow
      #{colorize_by_key("Purple", "purple")} = Red + Blue
      #{colorize_by_key("Vermilion", "vermilion")} = Red + Orange
      #{colorize_by_key("Teal", "teal")} = Blue + Green
      #{colorize_by_key("Amber", "amber")} = Yellow + Orange

    Створіть усі кольори, щоб перемогти!
  T

  puts retro_box(intro)
end

# Основний цикл 
def main_loop
  show_intro

  loop do
    print "\nCommand: "
    input = gets&.chomp&.split || []
    next if input.empty?

    case input[0].downcase
    when "add"     then add_item(input)
    when "palette" then view_inventory
    when "recipes" then view_recipes
    when "mix"     then input[1] ? craft_item(input[1]) : (puts "Usage: MIX <color>")
    when "help"    then puts "Commands: ADD, PALETTE, RECIPES, MIX, EXIT"
    when "exit"    then puts "Goodbye!"; break
    else puts "Unknown command."
    end

    if check_game_over
      puts retro_box("🎉 YOU COMPLETED THE PALETTE! 🎉")
      break
    end
  end
end

#  Старт гри 
if __FILE__ == $0
  # Стартові кількості базових кольорів
  $inventory["red"] = 5
  $inventory["blue"] = 5
  $inventory["yellow"] = 5

  main_loop
end
