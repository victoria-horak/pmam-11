import Foundation

// Симулятор бою ASCII RPG
// - Initiative (Ініціатива)
// - Classes: Mage, Rogue, Warrior 
// - Skills (Навички) з cooldowns (перезарядкою) та mana (маною)
// - Inventory (Інвентар) (healing potions, poison dust)
// - Простий ШІ
// - ASCII лог бою

// Кольори терміналу (ANSI)
struct Color {
    static let reset = "\u{001B}[0m"
    static let bold = "\u{001B}[1m"
    static let red = "\u{001B}[31m"      // Ушкодження вогнем 
    static let green = "\u{001B}[32m"    // Зцілення / HP
    static let yellow = "\u{001B}[33m"   // Критичні удари / Горіння
    static let blue = "\u{001B}[34m"     // Мана
    static let magenta = "\u{001B}[35m"  // Отрута / Магія
    static let cyan = "\u{001B}[36m"     // Фізичні навички
    static let gray = "\u{001B}[90m"
}

// Допоміжні функції для випадковості
func roll(_ sides: Int) -> Int { Int.random(in: 1...sides) }
func clamp(_ v: Int, _ a: Int, _ b: Int) -> Int { max(a, min(b, v)) }

// Тип ушкодження + статус
enum DamageType: String {
    case physical = "⚔️"
    case fire = "🔥"
    case poison = "☠️"
    case arcane = "✨"
}

enum StatusEffect: String {
    case burning = "Горіння"
    case poisoned = "Отрута"
}

// Предмети інвентарю
enum Item {
    case potionHP(amount: Int)
    case potionMP(amount: Int)
    case poisonDust(turns: Int) 
    
    var description: String {
        switch self {
        case .potionHP(let n): return "Зілля Здоров'я (+\(n))" 
        case .potionMP(let n): return "Зілля Мани (+\(n))"
        case .poisonDust(let t): return "Отруйний Порошок (\(t) хід)" 
        }
    }
}

// Базовий клас Навичка
class Skill {
    let name: String
    let manaCost: Int
    let cooldownMax: Int
    var cooldown: Int = 0 // час, що залишився
    
    init(name: String, manaCost: Int, cooldown: Int) {
        self.name = name
        self.manaCost = manaCost
        self.cooldownMax = cooldown
        self.cooldown = 0
    }

    // [main action log, damage/heal logs...]
    func use(by user: Character, on target: Character) -> [String] {
        return ["\(user.baseName) використовує \(name) на \(target.baseName)."]
    }

    func canUse(by user: Character) -> Bool {
        return user.mana >= manaCost && cooldown == 0
    }

    func startCooldown() {
        cooldown = cooldownMax
    }

    func tickCooldown() {
        if cooldown > 0 { cooldown -= 1 }
    }
}

// Специфічні навички
final class Fireball: Skill {
    init() { super.init(name: "Вогняна Куля", manaCost: 20, cooldown: 2) }
    
    override func use(by user: Character, on target: Character) -> [String] {
        guard user.mana >= manaCost else { return ["\(user.baseName) не вдалося створити \(name) (недостатньо мани)."] }
        user.mana -= manaCost
        
        let base = 24 + Int.random(in: 0...8)
        let dmg = base + user.spellPower
        
        var logs: [String] = []
        logs.append("\(user.baseName) чаклує \(Color.magenta)\(name)\(Color.reset) — \(dmg) \(DamageType.fire.rawValue) ушкодження; \(target.baseName) \(Color.yellow)Горить(3)\(Color.reset).")
        logs.append(target.takeDamage(dmg, type: .fire))
        
        target.addEffect(.burning, turns: 3)
        startCooldown()
        
        return logs
    }
}

final class Backstab: Skill {
    init() { super.init(name: "Удар у Спину", manaCost: 8, cooldown: 3) }
    
    override func use(by user: Character, on target: Character) -> [String] {
        guard user.mana >= manaCost else { return ["\(user.baseName) не вдалося виконати \(name) (недостатньо мани)."] }
        user.mana -= manaCost
        
        var dmg = user.attack * 2 + Int.random(in: 0...6)
        
        var logs: [String] = []
        
        // Шанс на критичне влучання
        if roll(20) >= 18 {
            dmg = Int(Double(dmg) * 1.6)
            logs.append("\(user.baseName) завдає \(Color.yellow)КРИТИЧНИЙ УДАР У СПИНУ\(Color.reset)! — \(dmg) \(DamageType.physical.rawValue) ушкодження.")
        } else {
            logs.append("\(user.baseName) використовує \(Color.cyan)\(name)\(Color.reset) — \(dmg) \(DamageType.physical.rawValue) ушкодження.")
        }
        
        logs.append(target.takeDamage(dmg, type: .physical))
        startCooldown()
        return logs
    }
}

final class Heal: Skill {
    init() { super.init(name: "Зцілення", manaCost: 16, cooldown: 2) }
    
    override func use(by user: Character, on target: Character) -> [String] {
        guard user.mana >= manaCost else { return ["\(user.baseName) не вдалося чаклувати \(name) (недостатньо мани)."] }
        user.mana -= manaCost
        
        let amount = 26 + Int.random(in: 0...10) + user.spellPower
        
        var logs: [String] = []
        logs.append("\(user.baseName) чаклує \(Color.green)\(name)\(Color.reset) — відновлює \(amount) HP.")
        logs.append(user.heal(amount))
        startCooldown()
        
        return logs
    }
}

// Клас Персонаж
class Character {
    let baseName: String // "Arin the Mage"
    var name: String { baseName + " (\(baseName.split(separator: " ").last!))" } // "Arin the Mage (Mage)"
    var hpMax: Int
    var hp: Int
    var manaMax: Int
    var mana: Int
    var attack: Int
    var defense: Int
    var spellPower: Int // + ушкодження для заклинань
    var initiativeBonus: Int

    var items: [Item] = []
    var skills: [Skill] = []

    // ефекти: відображення статусу -> ходи, що залишилися
    var effects: [StatusEffect: Int] = [:]

    init(name: String,
         hp: Int,
         mana: Int,
         attack: Int,
         defense: Int,
         spellPower: Int = 0,
         initiativeBonus: Int = 0)
    {
        let parts = name.split(separator: "(").map { $0.trimmingCharacters(in: .whitespaces) }
        self.baseName = parts.first ?? name 
        
        self.hpMax = hp
        self.hp = hp
        self.manaMax = mana
        self.mana = mana
        self.attack = attack
        self.defense = defense
        self.spellPower = spellPower
        self.initiativeBonus = initiativeBonus
    }

    var isAlive: Bool { hp > 0 }

    // Повертає один рядок логу
    func takeDamage(_ amount: Int, type: DamageType) -> String {
        let raw = max(1, amount - defense)
        hp = max(0, hp - raw)
        
        let color: String
        switch type {
        case .fire: color = Color.red
        case .poison: color = Color.magenta
        case .physical: color = Color.yellow
        case .arcane: color = Color.cyan
        }
        
        return "→ \(baseName) отримує \(color)\(raw)\(Color.reset) \(type.rawValue) ушкодження (HP: \(hp)/\(hpMax))"
    }

    // Повертає один рядок логу
    func heal(_ amount: Int) -> String {
        hp = min(hpMax, hp + amount)
        return "→ \(baseName) зцілюється на \(Color.green)+\(amount)\(Color.reset) (HP: \(hp)/\(hpMax))"
    }

    // [main action log, sub-logs...]
    func useItem(at index: Int, on target: Character?) -> [String] {
        guard index >= 0 && index < items.count else { return ["\(baseName) спробував використати недійсний предмет."] }
        let item = items.remove(at: index)
        var logs: [String] = []
        
        switch item {
        case .potionHP(let n):
            logs.append("\(baseName) випиває \(Color.green)Зілля Здоров'я\(Color.reset) (+\(n) HP).")
            logs.append(heal(n))
        case .potionMP(let n):
            mana = min(manaMax, mana + n)
            logs.append("\(baseName) випиває \(Color.blue)Зілля Мани\(Color.reset) (+\(n) MP).")
        case .poisonDust(let turns): // Новий предмет
            if let t = target {
                logs.append("\(baseName) кидає \(Color.magenta)Отруйний Порошок\(Color.reset) на \(t.baseName).")
                t.addEffect(.poisoned, turns: turns)
                logs.append("→ \(t.baseName) тепер \(Color.magenta)Отруєний(\(turns))\(Color.reset).")
            } else {
                logs.append("\(baseName) використовує \(Color.magenta)Отруйний Порошок\(Color.reset), але немає цілі.")
            }
        }
        return logs
    }

    func addEffect(_ effect: StatusEffect, turns: Int) {
        effects[effect] = max(effects[effect] ?? 0, turns)
    }

    // Повертає список рядків логу ефектів
    func tickEffects() -> [String] {
        var logs: [String] = []
        
        for (eff, turns) in effects {
            let dmg: Int
            let effectColor: String
            
            switch eff {
            case .burning:
                dmg = 6
                effectColor = Color.yellow
            case .poisoned:
                dmg = 4
                effectColor = Color.magenta
            }
            
            hp = max(0, hp - dmg)
            logs.append("→ \(effectColor)\(baseName)\(Color.reset) страждає від \(Color.red)\(dmg)\(Color.reset) ушкодження \(eff.rawValue.lowercased()) (HP: \(hp)/\(hpMax))")
            
            effects[eff] = turns - 1
        }
        
        // видалити прострочені
        effects = effects.filter { $0.value > 0 }
        return logs
    }

    // проста базова атака
    // [main action log, sub-logs...]
    func basicAttack(target: Character) -> [String] {
        let dmg = attack + Int.random(in: -2...6)
        
        let mainLog = "\(baseName) б'є \(target.baseName) \(Color.cyan)Базовою Атакою\(Color.reset) на \(max(1, dmg - target.defense)) \(DamageType.physical.rawValue)."
        let subLog = target.takeDamage(dmg, type: .physical)
        
        return [mainLog, subLog]
    }

    func resetCooldownsTick() {
        for skill in skills {
            skill.tickCooldown()
        }
    }

    func availableSkills() -> [Skill] {
        return skills.filter { $0.canUse(by: self) }
    }
}

// ASCII UI helpers 

func printHeader(_ a: Character, _ b: Character) {
    print("\n" + String(repeating: "=", count: 64))
    print("  \(Color.bold)\(a.baseName)\(Color.reset)   ПРОТИ   \(Color.bold)\(b.baseName)\(Color.reset)")
    print(String(repeating: "=", count: 64) + "\n")
}

func printCharacterDetails(_ c: Character) {
    let skillList = c.skills.map { s in
        let color: String
        switch s.name {
        case "Вогняна Куля": color = Color.magenta
        case "Удар у Спину": color = Color.cyan
        case "Зцілення": color = Color.green
        default: color = Color.reset
        }
        return "\(color)\(s.name)\(Color.reset) (\(s.manaCost)MP, CD:\(s.cooldownMax)\(s.cooldown > 0 ? Color.gray + " / " + String(s.cooldown) + Color.reset : ""))"
    }.joined(separator: ", ")
    
    let itemList = c.items.map { $0.description }.joined(separator: ", ")
    
    print("    \(Color.bold)\(c.baseName)\(Color.reset):")
    print("      Клас: \(c.baseName.split(separator: " ").last ?? "Незн.")")
    print("      Здоров'я/Мана: \(Color.red)\(c.hpMax)\(Color.reset)/\(Color.blue)\(c.manaMax)\(Color.reset)") // Кольори для Max HP/MP
    print("      Атака: \(c.attack), Захист: \(c.defense), Сила Заклинань: \(c.spellPower)")
    print("      Бонус Ініціативи: \(c.initiativeBonus) (d20 + Bonus)")
    print("      Навички: \(skillList)")
    print("      Інвентар: \(itemList)")
}

func printGameRulesAndStats(_ p1: Character, _ p2: Character) {
    print(String(repeating: "#", count: 64))
    print("# \(Color.bold)ПРАВИЛА БОЮ ТА СТАТИСТИКА ПЕРСОНАЖІВ\(Color.reset) #".centered(pad: 62))
    print(String(repeating: "#", count: 64))
    
    print("\n\(Color.bold)=== ПРАВИЛА БОЮ ===\(Color.reset)")
    print("  1. Ініціатива: d20 + Бонус Ініціативи. Вищий кидок ходить першим.")
    print("  2. Порядок ходу: Спочатку спрацьовують ефекти (\(Color.yellow)Горіння\(Color.reset)/\(Color.magenta)Отрута\(Color.reset)), потім виконується дія.") // Кольори для ефектів
    print("  3. Ушкодження: Отримане Ушкодження = max(1, Вхідне Ушкодження - Захист).")
    print("  4. ШІ: Прагне зцілитися, якщо Запас Здоров'я низький, потім використовує навички, потім базову атаку.") 
    print("\n\(Color.bold)=== ХАРАКТЕРИСТИКИ ПЕРСОНАЖІВ ===\(Color.reset)")
    printCharacterDetails(p1)
    printCharacterDetails(p2)
    print("\n" + String(repeating: "=", count: 64))
}

func printStatusLine(_ c: Character) {
    let eff = c.effects.isEmpty ? "—" : c.effects.map { (eff, turns) in
        let color = eff == .burning ? Color.yellow : Color.magenta
        return "\(color)\(eff.rawValue)(\(turns))\(Color.reset)"
    }.joined(separator: ", ")
    
    print("\(Color.bold)\(c.baseName)\(Color.reset)")
    print("      HP: \(Color.red)\(c.hp)\(Color.reset)/\(c.hpMax)")
    print("      MP: \(Color.blue)\(c.mana)\(Color.reset)/\(c.manaMax)")
    print("      Ефекти: \(eff)")
}

// Ініціатива: кидок d20 + бонус
// Повертає порядок та значення кидків
func initiativeRolls(_ a: Character, _ b: Character) -> (first: Character, second: Character, r1: Int, r2: Int) {
    let r1 = roll(20) + a.initiativeBonus
    let r2 = roll(20) + b.initiativeBonus
    if r1 >= r2 {
        return (first: a, second: b, r1: r1, r2: r2)
    } else {
        return (first: b, second: a, r1: r2, r2: r1)
    }
}

// AI logic (Логіка ШІ)
// [main action log, sub-logs...]
func chooseActionAI(_ actor: Character, opponent: Character) -> [String] {
    // 1. Якщо Здоров'я низьке, використати зілля
    if actor.hp <= actor.hpMax / 4 {
        if let idx = actor.items.firstIndex(where: {
            if case .potionHP = $0 { return true } else { return false }
        }) {
            return actor.useItem(at: idx, on: nil)
        }
    }

    // 2. Якщо Здоров'я нижче 75%, спробувати Зцілення, якщо доступно
    if actor.hp <= Int(Double(actor.hpMax) * 0.75) {
        if let healSkill = actor.availableSkills().first(where: { $0 is Heal }) {
            return healSkill.use(by: actor, on: actor) // Зцілити себе
        }
    }

    // 3. Використати потужну доступну навичку (надавати перевагу атакуючим)
    if let sk = actor.availableSkills().first(where: { $0 is Fireball || $0 is Backstab }) {
        return sk.use(by: actor, on: opponent)
    }

    // 4. Використати будь-яку іншу доступну навичку
    if let sk = actor.availableSkills().first {
        return sk.use(by: actor, on: opponent)
    }

    // 5. Якщо немає навичок, можливо, використати Отруйний Порошок
    if let idx = actor.items.firstIndex(where: {
        if case .poisonDust = $0 { return true } else { return false } 
    }) {
        return actor.useItem(at: idx, on: opponent)
    }

    // 6. Інакше, базова атака
    return actor.basicAttack(target: opponent)
}

// Бойовий цикл
func startCombat(_ p1: inout Character, _ p2: inout Character, maxTurns: Int = 50) {
    
    // ПРАВИЛА ТА ХАРАКТЕРИСТИКИ
    printGameRulesAndStats(p1, p2)
    
    printHeader(p1, p2)
    var turn = 1

    // прив'язати посилання до змінних, що змінюються
    let a = p1 
    let b = p2 
    
    while a.isAlive && b.isAlive && turn <= maxTurns {
        
        print("\n" + String(repeating: "-", count: 64))
        print("\(Color.bold)# Хід \(turn)\(Color.reset)".centered(pad: 64)) 
        print(String(repeating: "-", count: 64))
        
        // Ініціптива: кинути d20 + бонус
        let rolls = initiativeRolls(a, b)
        let first = rolls.first
        let second = rolls.second
        
        print("Кидки ініціативи:")
        print("        \(first.baseName): \(rolls.r1),")
        print("        \(second.baseName): \(rolls.r2)")

        // Визначити, хто є опонентом
        let opponentForFirst = first === a ? b : a
        let opponentForSecond = second === a ? b : a

        // --- ДІЯ ПЕРШОГО АКТОРА ---
        print("\n\(Color.bold)Дія \(first.baseName):\(Color.reset)")
        
        first.resetCooldownsTick()
        let dot1 = first.tickEffects()
        for l in dot1 { print("        " + l.trimmingCharacters(in: .whitespacesAndNewlines)) } 
        if !first.isAlive { break }

        let log1 = chooseActionAI(first, opponent: opponentForFirst)
        for line in log1 {
            print("        " + line.trimmingCharacters(in: .whitespacesAndNewlines))
        }

        // перевірка смерті
        if !a.isAlive || !b.isAlive { break }

        // --- ДІЯ ДРУГОГО АКТОРА ---
        print("\n\(Color.bold)Дія \(second.baseName):\(Color.reset)")
        
        second.resetCooldownsTick()
        let dot2 = second.tickEffects()
        for l in dot2 { print("        " + l.trimmingCharacters(in: .whitespacesAndNewlines)) }
        if !second.isAlive { break }
        
        // Choose and execute action
        let log2 = chooseActionAI(second, opponent: opponentForSecond)
        for line in log2 {
            print("        " + line.trimmingCharacters(in: .whitespacesAndNewlines))
        }

        print("\n\(Color.bold)Статус:\(Color.reset)")
        printStatusLine(a)
        printStatusLine(b)

        turn += 1
    }

    print("\n" + String(repeating: "=", count: 64))
    if a.isAlive && !b.isAlive {
        print("\(Color.green)\(a.baseName) перемагає!\(Color.reset)")
    } else if b.isAlive && !a.isAlive {
        print("\(Color.green)\(b.baseName) перемагає!\(Color.reset)")
    } else {
        print("Нічия або досягнуто максимальної кількості ходів.")
    }
    print(String(repeating: "=", count: 64) + "\n")
}

// Small helpers + extensions 
extension String {
    // центрує текст по ширині, доповнюючи пробілами
    func centered(pad: Int) -> String {
        guard self.count < pad else { return self }
        let total = pad - self.count
        let left = total / 2
        let right = total - left
        return String(repeating: " ", count: left) + self + String(repeating: " ", count: right)
    }
}

// Налаштування
var arin = Character(name: "Arin the Mage (Арін Маг)", hp: 120, mana: 100, attack: 9, defense: 4, spellPower: 6, initiativeBonus: 2)
arin.skills = [Fireball(), Heal()]
arin.items = [.potionHP(amount: 50)]

var drogar = Character(name: "Drogar the Rogue (Дрогар Розбійник)", hp: 160, mana: 60, attack: 18, defense: 6, spellPower: 0, initiativeBonus: 1)
drogar.skills = [Backstab()]
drogar.items = [.potionHP(amount: 40), .poisonDust(turns: 3)] 

// Запуск
startCombat(&arin, &drogar)
