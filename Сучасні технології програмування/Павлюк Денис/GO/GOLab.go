package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
	"strings"
	"sync"
	"time"
)

const (
	Width      = 20
	Height     = 15
	PlayerIcon = "🚀"
	EnemyIcon  = "0"
	BonusIcon  = "💎"
	EmptyIcon  = "  "
)

// Object представляє астероїд або бонус
type Object struct {
	X, Y int
	Type string // "#" або "*"
}

// GameState зберігає весь стан гри
type GameState struct {
	PlayerX   int
	Objects   []Object
	Score     int
	GameOver  bool
	Level     int
	TickSpeed time.Duration
	mu        sync.Mutex
}

func main() {
	rand.Seed(time.Now().UnixNano())

	game := &GameState{
		PlayerX:   Width / 2,
		Objects:   []Object{},
		Score:     0,
		GameOver:  false,
		Level:     1,
		TickSpeed: 300 * time.Millisecond,
	}

	fmt.Println("=== GoSpace: Космічний перехоплювач ===")
	fmt.Println("Керування: 'a' + Enter (Вліво), 'd' + Enter (Вправо)")
	fmt.Println("Уникай каміння 0, збирай кристали 💎")
	fmt.Println("Натисни Enter, щоб почати")
	bufio.NewReader(os.Stdin).ReadBytes('\n')

	go inputHandler(game)

	for !game.GameOver {
		game.mu.Lock()
		fmt.Print("\033[H\033[2J")
		spawnObject(game)
		updatePhysics(game)

		drawGame(game)

		if game.GameOver {
			game.mu.Unlock()
			break
		}

		game.mu.Unlock()

		time.Sleep(game.TickSpeed)
	}

	fmt.Printf("\nGAME OVER! Фінальний рахунок: %d (Рівень %d)\n", game.Score, game.Level)
}

func inputHandler(g *GameState) {
	reader := bufio.NewReader(os.Stdin)
	for {
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(strings.ToLower(input))

		g.mu.Lock()
		if !g.GameOver {
			if input == "a" && g.PlayerX > 0 {
				g.PlayerX--
			}
			if input == "d" && g.PlayerX < Width-1 {
				g.PlayerX++
			}
		}
		g.mu.Unlock()
	}
}

func spawnObject(g *GameState) {
	if rand.Intn(100) < 30 {
		x := rand.Intn(Width)
		objType := EnemyIcon

		if rand.Intn(100) < 20 {
			objType = BonusIcon
		}

		g.Objects = append(g.Objects, Object{X: x, Y: 0, Type: objType})
	}
}

func updatePhysics(g *GameState) {
	var activeObjects []Object

	for _, obj := range g.Objects {
		obj.Y++

		if obj.Y == Height-1 && obj.X == g.PlayerX {
			if obj.Type == EnemyIcon {
				g.GameOver = true
			} else if obj.Type == BonusIcon {
				g.Score += 10
				if g.Score%50 == 0 {
					g.Level++
					if g.TickSpeed > 100*time.Millisecond {
						g.TickSpeed -= 20 * time.Millisecond
					}
				}
			}
		}

		if obj.Y < Height {
			activeObjects = append(activeObjects, obj)
		}
	}
	g.Objects = activeObjects
}

func drawGame(g *GameState) {
	var buffer strings.Builder

	buffer.WriteString(fmt.Sprintf("Score: %d | Level: %d | Speed: %v\n", g.Score, g.Level, g.TickSpeed))
	buffer.WriteString(strings.Repeat("==", Width) + "\n")

	for y := 0; y < Height; y++ {
		line := ""
		for x := 0; x < Width; x++ {
			char := EmptyIcon

			if y == Height-1 && x == g.PlayerX {
				char = PlayerIcon
			} else {

				for _, obj := range g.Objects {
					if obj.X == x && obj.Y == y {
						char = obj.Type
						break
					}
				}
			}
			line += char
		}
		buffer.WriteString("|" + line + "|\n")
	}

	buffer.WriteString(strings.Repeat("==", Width) + "\n")
	fmt.Print(buffer.String())
}
