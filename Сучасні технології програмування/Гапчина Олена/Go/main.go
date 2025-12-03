package main

import (
	"bufio"
	"flag"
	"fmt"
	"os"
	"strings"
)

// ANSI COLORS
const (
	Reset = "\033[0m"
	Green = "\033[32m"
	Blue  = "\033[34m"
	Red   = "\033[31m"
	Gray  = "\033[90m"
	White = "\033[97m"
)

// Point in the maze
type Point struct {
	Row int
	Col int
}

// Node for BFS queue
type Node struct {
	Point Point
	Prev  *Node
}

// BFS shortest path search
func bfs(grid []string, start, end Point) ([]Point, bool) {
	rows := len(grid)
	cols := len(grid[0])

	visited := make([][]bool, rows)
	for i := range visited {
		visited[i] = make([]bool, cols)
	}

	deltas := []Point{
		{-1, 0},
		{1, 0},
		{0, -1},
		{0, 1},
	}

	queue := []*Node{{Point: start}}
	visited[start.Row][start.Col] = true

	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]

		if cur.Point == end {
			path := []Point{}
			for n := cur; n != nil; n = n.Prev {
				path = append([]Point{n.Point}, path...)
			}
			return path, true
		}

		for _, d := range deltas {
			next := Point{cur.Point.Row + d.Row, cur.Point.Col + d.Col}

			if next.Row < 0 || next.Row >= rows || next.Col < 0 || next.Col >= cols {
				continue
			}
			if visited[next.Row][next.Col] || grid[next.Row][next.Col] == '#' {
				continue
			}

			visited[next.Row][next.Col] = true
			queue = append(queue, &Node{Point: next, Prev: cur})
		}
	}

	return nil, false
}

// Parse S and E
func parseMaze(maze string) ([]string, Point, Point, error) {
	grid := strings.Split(strings.TrimSpace(maze), "\n")
	var start, end Point
	foundS, foundE := false, false

	for r := range grid {
		for c, ch := range grid[r] {
			if ch == 'S' {
				start = Point{r, c}
				foundS = true
			}
			if ch == 'E' {
				end = Point{r, c}
				foundE = true
			}
		}
	}

	if !foundS || !foundE {
		return nil, Point{}, Point{}, fmt.Errorf("maze must contain S and E")
	}

	return grid, start, end, nil
}

// Read maze from file
func loadMazeFromFile(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()

	var builder strings.Builder
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		builder.WriteString(scanner.Text() + "\n")
	}

	return builder.String(), scanner.Err()
}

// Colored output
func colorize(char byte, point Point, pathMap map[Point]bool, start, end Point) string {
	switch {
	case point == start:
		return Blue + "S" + Reset
	case point == end:
		return Red + "E" + Reset
	case pathMap[point] && char == '.':
		return Green + "*" + Reset
	case char == '#':
		return White + "#" + Reset
	case char == '.':
		return Gray + "." + Reset
	default:
		return string(char)
	}
}

func renderMaze(grid []string, path []Point, start, end Point) {
	pathMap := map[Point]bool{}
	for _, p := range path {
		pathMap[p] = true
	}

	for r := range grid {
		for c := range grid[r] {
			p := Point{r, c}
			ch := grid[r][c]
			fmt.Print(colorize(ch, p, pathMap, start, end))
		}
		fmt.Println()
	}
}

func main() {
	filePath := flag.String("file", "", "Path to maze file")
	flag.Parse()

	if *filePath == "" && len(flag.Args()) > 0 {
        *filePath = flag.Args()[0]
    }

	// Fallback default maze
	defaultMaze := `
###################
#,...S#...........#
#.#.#.#.#####.#.#.#
#.#.#...#...#.#.#E#
#.#.#####.#.#.#.#.#
#.....#...#...#...#
###################
`

	var maze string
	var err error

	// Load maze from file if specified
	if *filePath != "" {
		maze, err = loadMazeFromFile(*filePath)
		if err != nil {
			fmt.Println("Error reading file:", err)
			return
		}
	} else {
		maze = defaultMaze
	}

	grid, start, end, err := parseMaze(maze)
	if err != nil {
		panic(err)
	}

	path, ok := bfs(grid, start, end)
	if !ok {
		fmt.Println("Шлях не знайдено")
		return
	}

	fmt.Println("Знайдений шлях:")
	for _, p := range path {
		fmt.Printf("(%d,%d) ", p.Row, p.Col)
	}
	fmt.Println("\n")

	renderMaze(grid, path, start, end)
}
