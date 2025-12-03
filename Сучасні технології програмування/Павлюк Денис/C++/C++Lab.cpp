#include <iostream>
#include <vector>
#include <cstdlib> // Для rand()
#include <ctime>   // Для time()
#include <thread>  // Для пауз (std::this_thread::sleep_for)
#include <chrono>  // Для часу
#include <string>  // Для буферизації виводу
#include <cstdint> // Необхідно для типу uint8_t

const int WIDTH = 40;  
const int HEIGHT = 20;  
const int DELAY_MS = 100; // Затримка між кадрами (мілісекунди)

const char ALIVE_CELL = 'O'; 
const char DEAD_CELL = '.';

class GameOfLife {
private:
    std::vector<std::vector<uint8_t>> grid;
    std::vector<std::vector<uint8_t>> nextGrid;
    int rows;
    int cols;

public:
    GameOfLife(int r, int c) : rows(r), cols(c) {
        grid.resize(rows, std::vector<uint8_t>(cols, 0));
        nextGrid.resize(rows, std::vector<uint8_t>(cols, 0));
        
        // Рандомізація
        std::srand(static_cast<unsigned int>(std::time(nullptr)));
        for (int i = 0; i < rows; ++i) {
            for (int j = 0; j < cols; ++j) {
                // 20% шанс, що клітина жива на старті
                grid[i][j] = (std::rand() % 5 == 0) ? 1 : 0;
            }
        }
    }

    // Підрахунок сусідів
    int countNeighbors(int x, int y) {
        int sum = 0;
        for (int i = -1; i <= 1; ++i) {
            for (int j = -1; j <= 1; ++j) {
                if (i == 0 && j == 0) continue; 

                int r = (x + i + rows) % rows;
                int c = (y + j + cols) % cols;

                sum += grid[r][c];
            }
        }
        return sum;
    }

    void update() {
        for (int i = 0; i < rows; ++i) {
            for (int j = 0; j < cols; ++j) {
                int neighbors = countNeighbors(i, j);
                uint8_t state = grid[i][j];

                // Правила Конвея:
                if (state == 1 && (neighbors < 2 || neighbors > 3)) {
                    nextGrid[i][j] = 0; // Смерть від самотності або перенаселення
                } else if (state == 0 && neighbors == 3) {
                    nextGrid[i][j] = 1; // Народження
                } else {
                    nextGrid[i][j] = state; // Статус-кво
                }
            }
        }

        grid = nextGrid;
    }

    // Малювання поля
    void draw() {
        std::cout << "\033[H\033[2J"; 
        std::string buffer;
        buffer.reserve((rows + 1) * (cols + 1));

        buffer += "Generation (Ctrl+C to stop)\n";

        for (int i = 0; i < rows; ++i) {
            for (int j = 0; j < cols; ++j) {
                buffer += (grid[i][j] ? ALIVE_CELL : DEAD_CELL);
                buffer += ' ';
            }
            buffer += '\n';
        }

        std::cout << buffer;
    }

    void run() {
        while (true) {
            draw();
            update();
            std::this_thread::sleep_for(std::chrono::milliseconds(DELAY_MS));
        }
    }
};

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    GameOfLife game(HEIGHT, WIDTH);
    game.run();

    return 0;
}