# Підключаємо бібліотеки: Ruby2D для графіки та JSON для збереження історії
require 'ruby2d'
require 'json'

# Папка, де лежать текстові файли зі словами
WORDS_DIR = "слова"

# Читає файл обраної теми та повертає список слів
def load_words(theme)
  file = File.join(WORDS_DIR, "#{theme}.txt")
  return [] unless File.exist?(file)
  File.read(file).split("\n").map(&:strip).reject(&:empty?)
end

# Завантажуємо історію ігор з JSON-файлу
def load_scores
  return [] unless File.exist?("scores.json")
  JSON.parse(File.read("scores.json"))
rescue
  []
end

# Зберігаємо історію ігор у файл
def save_scores(list)
  File.write("scores.json", JSON.pretty_generate(list))
end

# Клас кнопки - відображення й логіка натискання/наведення
class Button
  attr_reader :x, :y, :w, :h, :label
  attr_accessor :active

  # Створюємо кнопку зі своїм прямокутником і текстом
  def initialize(label, x, y, w=150, h=40)
    @label = label
    @x, @y, @w, @h = x, y, w, h
    @active = false
    @rect = Rectangle.new(x: x, y: y, width: w, height: h, color: 'blue', z:1)
    @text = Text.new(label, x: x + w/2 - (label.size*5), y: y + h/2 - 10, size: 20, color: 'white', z:2)
  end

  # Перевірка наведення миші
  def hover?(mx,my)
    mx.between?(x,x+w) && my.between?(y,y+h)
  end

  # Перевірка кліку (клік = наведення)
  def clicked?(mx,my)
    hover?(mx,my)
  end

  # Зміна кольору кнопки при наведенні
  def update_hover(mx,my)
    if hover?(mx,my)
      @rect.color = [0.6, 0.8, 1.0, 1.0] # світліша кнопка
    else
      @rect.color = @active ? 'green' : 'blue'
    end
  end

  # Активна кнопка (виділена)
  def set_active(color)
    @rect.color = color
    @active = true
  end
end

# Основний клас гри «Шибениця»
class Hangman
  attr_reader :state, :btn_animals, :btn_cities, :btn_jobs, :btn_short, :btn_long, :btn_play
  attr_reader :letter_buttons, :btn_restart, :btn_menu

  # Максимальна кількість помилок
  MAX_WRONG = 6

  # Український алфавіт
  LETTERS = %w[а б в г ґ д е є ж з и і ї й к л м н о п р с т у ф х ц ч ш щ ь ю я]

  # Теми, між якими може обрати гравець
  THEMES = ['тварини','міста','професії']

  # Перший запуск гри — показ меню
  def initialize
    @scores = load_scores
    @state = :menu
    @theme = THEMES[0]
    @difficulty = :short
    show_menu
  end

  # Малюємо однотонний фон
  def draw_background
    Rectangle.new(x: 0, y: 0, width: Window.width, height: Window.height, color: [0.8, 0.9, 1.0, 1.0], z: -10)
  end

  # Головне меню гри
  def show_menu
    Window.clear
    @state = :menu
    draw_background
    Text.new("Гра «Шибениця»", x: Window.width/2 - 100, y: 20, size: 36, color: 'blue')

    # Блок вибору теми
    Text.new("Оберіть тему:", x: 20, y: 80, size: 22, color: 'black')
    @btn_animals = Button.new("Тварини", 20, 120)
    @btn_cities  = Button.new("Міста", 20, 180)
    @btn_jobs    = Button.new("Професії", 20, 240)

    # Блок вибору складності
    Text.new("Складність:", x: 220, y: 80, size: 22, color: 'black')
    @btn_short   = Button.new("Короткі", 220, 120)
    @btn_long    = Button.new("Довгі", 220, 180)
    @btn_play    = Button.new("Грати", 420, 150, 160, 50)

    # Оновлюємо підсвітку кнопок
    update_menu_buttons

    # Показуємо історію останніх 5 ігор
    Text.new("Історія:", x: 420, y: 220, size: 22, color: 'black')
    y = 260
    @scores.last(5).each do |s|
      Text.new("#{s["result"]} (слово: #{s["word"]})", x: 420, y: y, size: 16, color: 'black')
      y += 25
    end
  end

  # Починаємо гру - вибір слова за темою та складністю
  def start_game
    list = load_words(@theme)
    list = list.select { |w| w.size <= 5 } if @difficulty == :short
    list = list.select { |w| w.size > 5 } if @difficulty == :long
    @word = list.sample.downcase
    @guessed = []
    @wrong = []
    show_game
  end

  # Екран самої гри
  def show_game
    Window.clear
    @state = :game
    draw_background
    Text.new("Відгадай слово:", x: 20, y: 20, size: 24, color: 'black')

    # Показ поточної теми та обраної складності
    difficulty_text = @difficulty == :short ? "коротке" : "довге"
    Text.new("Тема: #{@theme}, слово: #{difficulty_text}", x: 20, y: 50, size: 18, color: 'blue')

    # Масковане слово (_ _ _ _)
    @word_text = Text.new(masked_word, x: 20, y: 80, size: 40, color: 'black')

    # Список хибних букв
    Text.new("Хибні:", x: 20, y: 140, size: 22, color: 'black')
    @wrong_text = Text.new("", x: 20, y: 170, size: 22, color: 'black')

    # Створюємо кнопки букв
    @letter_buttons = []
    LETTERS.each_with_index do |l,i|
      x = 20 + (i % 10) * 45
      y = 220 + (i / 10) * 45
      @letter_buttons << Button.new(l, x, y, 40, 40)
    end

    # Створення частин шибениці та тіла
    create_hangman
  end

  # Малюємо шибеницю та невидимі частини тіла
  def create_hangman
    @hangman_parts = []

    base_x = 500
    @hangman_parts << Rectangle.new(x: base_x, y: 400, width: 150, height: 10, color: [0.55, 0.27, 0.07, 0])
    @hangman_parts << Rectangle.new(x: base_x + 70, y: 100, width: 10, height: 300, color: [0.55, 0.27, 0.07, 0])
    @hangman_parts << Rectangle.new(x: base_x, y: 100, width: 80, height: 10, color: [0.55, 0.27, 0.07, 0])
    @hangman_parts << Rectangle.new(x: base_x, y: 100, width: 10, height: 40, color: [0.55, 0.27, 0.07, 0])

    head_x = base_x + 5
    @hangman_parts << Circle.new(x: head_x, y: 155, radius: 20, color: [0,0,0,0])
    @hangman_parts << Rectangle.new(x: head_x, y: 175, width: 5, height: 60, color: [0,0,0,0])
    @hangman_parts << Line.new(x1: head_x, y1: 195, x2: head_x - 35, y2: 175, width: 4, color: [0,0,0,0])
    @hangman_parts << Line.new(x1: head_x, y1: 195, x2: head_x + 35, y2: 175, width: 4, color: [0,0,0,0])
    @hangman_parts << Line.new(x1: head_x, y1: 235, x2: head_x - 25, y2: 280, width: 4, color: [0,0,0,0])
    @hangman_parts << Line.new(x1: head_x, y1: 235, x2: head_x + 25, y2: 280, width: 4, color: [0,0,0,0])
  end

  # Обробка кліку по кнопці букви
  def handle_game_click(mx,my)
    @letter_buttons.each do |b|
      next unless b.clicked?(mx,my) && !@guessed.include?(b.label) && !@wrong.include?(b.label)
      letter = b.label

      # Перевірка: чи є буква в слові?
      if @word.include?(letter)
        @guessed << letter
        b.set_active([0.5,0.8,0.5,1])
      else
        @wrong << letter
        b.set_active([0.9,0.5,0.5,1])
      end

      update_game
      update_hangman

      finish_game("Перемога! Слово: #{@word}", "Перемога") if win?
      finish_game("Поразка! Слово: #{@word}", "Поразка") if lose?
    end
  end

  # Оновлення тексту на екрані
  def update_game
    @word_text.text = masked_word
    @wrong_text.text = @wrong.join(" ")
  end

  # Маскуємо слово під час гри
  def masked_word
    @word.chars.map { |c| @guessed.include?(c) ? c : "_" }.join(" ")
  end

  def win?; (@word.chars - @guessed).empty?; end
  def lose?; @wrong.size >= MAX_WRONG; end

  # Показуємо частини тіла залежно від кількості помилок
  def update_hangman
    [0,1,2,3].each do |i|
      @hangman_parts[i].color = [0.55, 0.27, 0.07, 1.0]
    end
    (4..9).each do |i|
      @hangman_parts[i].color = i - 3 <= @wrong.size ? 'black' : [0,0,0,0]
    end
  end

  # Завершення гри - показ результату, кнопки меню
  def finish_game(msg, result)
    Window.clear
    @state = :end
    draw_background
    Text.new(msg, x: Window.width/2 - 150, y: 100, size: 32, color: 'black')

    # Дві кнопки по центру
    button_y = 200
    spacing = 20
    total = 150 * 2 + spacing
    start = Window.width/2 - total/2
    @btn_restart = Button.new("Грати ще", start, button_y)
    @btn_menu    = Button.new("Меню", start + 150 + spacing, button_y)

    # Зберігаємо інформацію про гру
    @scores << { "name"=>"Гравець", "word"=>@word, "result"=>result }
    save_scores(@scores)
  end

  # Натискання кнопок на екрані завершення
  def handle_end_click(mx,my)
    start_game if @btn_restart.clicked?(mx,my)
    show_menu  if @btn_menu.clicked?(mx,my)
  end

  # Розподіл кліків по станах гри
  def click(mx,my)
    case @state
    when :menu then handle_menu_click(mx,my)
    when :game then handle_game_click(mx,my)
    when :end  then handle_end_click(mx,my)
    end
  end

  # Обробка кліків у меню
  def handle_menu_click(mx,my)
    if @btn_animals.clicked?(mx,my)
      @theme = 'тварини'
      update_menu_buttons
    elsif @btn_cities.clicked?(mx,my)
      @theme = 'міста'
      update_menu_buttons
    elsif @btn_jobs.clicked?(mx,my)
      @theme = 'професії'
      update_menu_buttons
    elsif @btn_short.clicked?(mx,my)
      @difficulty = :short
      update_menu_buttons
    elsif @btn_long.clicked?(mx,my)
      @difficulty = :long
      update_menu_buttons
    elsif @btn_play.clicked?(mx,my)
      start_game
    end
  end

  # Оновлюємо підсвітку активних кнопок у меню
  def update_menu_buttons
    [@btn_animals, @btn_cities, @btn_jobs].each do |btn|
      btn.active = (btn.label.downcase == @theme)
      btn.update_hover(-100, -100)
    end

    [@btn_short, @btn_long].each do |btn|
      btn.active = ((btn.label == "Короткі" && @difficulty == :short) || 
                   (btn.label == "Довгі" && @difficulty == :long))
      btn.update_hover(-100, -100)
    end
  end
end

# Налаштування вікна гри
Window.set(title: "Гра «Шибениця»", width: 700, height: 500)
game = Hangman.new

# Обробка кліків
Window.on(:mouse_down) { |e| game.click(e.x, e.y) }

# Ефект наведення на кнопки
Window.on(:mouse_move) do |e|
  case game.state
  when :menu
    [game.btn_animals, game.btn_cities, game.btn_jobs, game.btn_short, game.btn_long, game.btn_play].each { |b| b.update_hover(e.x, e.y) }
  when :game
    game.letter_buttons.each { |b| b.update_hover(e.x, e.y) }
  when :end
    [game.btn_restart, game.btn_menu].each { |b| b.update_hover(e.x, e.y) }
  end
end

Window.show