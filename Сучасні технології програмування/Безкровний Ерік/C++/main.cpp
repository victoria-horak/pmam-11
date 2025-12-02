// 2048.cpp
// Простий консольний 2048, C++17
// Керування: w - вверх, s - вниз, a - вліво, d - вправо, q - вихід

#include <iostream>
#include <array>
#include <vector>
#include <random>
#include <iomanip>
#include <string>
using namespace std;

using Grid = array<array<int, 4>, 4>;

static std::mt19937 rng((std::random_device())());

void clear_screen() {
#ifdef _WIN32
    system("cls");
#else
    // ANSI escape to clear screen and move cursor to top-left
    cout << "\x1B[2J\x1B[H";
#endif
}

void print_grid(const Grid &g, int score) {
    clear_screen();
    cout << "===== 2048 (C++) =====\n";
    cout << "Score: " << score << "\n";
    cout << "Controls: w(up) a(left) s(down) d(right)  q(quit)\n\n";
    const int cellw = 6;
    for (int r = 0; r < 4; ++r) {
        for (int c = 0; c < 4; ++c) {
            if (g[r][c] == 0) {
                cout << setw(cellw) << '.';
            } else {
                cout << setw(cellw) << g[r][c];
            }
        }
        cout << "\n\n";
    }
}

// Return list of empty cell positions
vector<pair<int,int>> empty_cells(const Grid &g) {
    vector<pair<int,int>> v;
    for (int r = 0; r < 4; ++r)
        for (int c = 0; c < 4; ++c)
            if (g[r][c] == 0) v.emplace_back(r,c);
    return v;
}

void add_random_tile(Grid &g) {
    auto empt = empty_cells(g);
    if (empt.empty()) return;
    uniform_int_distribution<int> di(0, (int)empt.size() - 1);
    auto [r,c] = empt[di(rng)];
    // 90% -> 2, 10% -> 4
    uniform_int_distribution<int> dv(1,10);
    g[r][c] = (dv(rng) == 10) ? 4 : 2;
}

// compress row to left: move non-zero left, fill zero to right
// returns true if any movement happened
bool compress_row_left(array<int,4> &row) {
    array<int,4> tmp = {0,0,0,0};
    int idx = 0;
    for (int i = 0; i < 4; ++i)
        if (row[i] != 0) tmp[idx++] = row[i];
    if (tmp != row) {
        row = tmp;
        return true;
    }
    return false;
}

// merge row left: merge equal adjacent tiles, update score
// assumes row is already compressed (non-zeros left)
// returns points gained
int merge_row_left(array<int,4> &row) {
    int gained = 0;
    for (int i = 0; i < 3; ++i) {
        if (row[i] != 0 && row[i] == row[i+1]) {
            row[i] *= 2;
            row[i+1] = 0;
            gained += row[i];
            ++i; // skip next
        }
    }
    return gained;
}

// Helper to rotate grid clockwise (90 degrees)
Grid rotate_clockwise(const Grid &g) {
    Grid res;
    for (int r=0;r<4;++r)
        for (int c=0;c<4;++c)
            res[c][3-r] = g[r][c];
    return res;
}

// Perform a move to the left. Returns pair(changed, points gained)
pair<bool,int> move_left(Grid &g) {
    bool changed = false;
    int score_gained = 0;
    for (int r = 0; r < 4; ++r) {
        array<int,4> row = g[r];
        bool c1 = compress_row_left(row);
        int m = merge_row_left(row);
        bool c2 = compress_row_left(row); // compress again after merge
        if (row != g[r]) {
            changed = true;
            g[r] = row;
        }
        score_gained += m;
    }
    return {changed, score_gained};
}

// General move function using rotations:
// dir: 'L','R','U','D'
pair<bool,int> move_dir(Grid &g, char dir) {
    // We'll rotate grid so that we always move left
    Grid tmp = g;
    if (dir == 'U') { // rotate left once: moving up -> rotate so up becomes left
        // rotate ccw = 3 times clockwise
        tmp = rotate_clockwise(tmp);
        tmp = rotate_clockwise(tmp);
        tmp = rotate_clockwise(tmp);
    } else if (dir == 'R') { // right -> rotate twice
        tmp = rotate_clockwise(tmp);
        tmp = rotate_clockwise(tmp);
    } else if (dir == 'D') { // down -> rotate clockwise once
        tmp = rotate_clockwise(tmp);
    } // else if 'L' no change

    auto [changed, gained] = move_left(tmp);

    // rotate back
    if (dir == 'U') {
        // rotate clockwise once to return (inverse of ccw rotating thrice)
        tmp = rotate_clockwise(tmp);
    } else if (dir == 'R') {
        tmp = rotate_clockwise(tmp);
        tmp = rotate_clockwise(tmp);
    } else if (dir == 'D') {
        tmp = rotate_clockwise(tmp);
        tmp = rotate_clockwise(tmp);
        tmp = rotate_clockwise(tmp);
    }

    if (changed) g = tmp;
    return {changed, gained};
}

// Check if any move is possible
bool can_move(const Grid &g) {
    // if any empty -> can move
    for (int r=0;r<4;++r)
        for (int c=0;c<4;++c)
            if (g[r][c] == 0) return true;
    // check adjacent equal tiles horizontally/vertically
    for (int r=0;r<4;++r)
        for (int c=0;c<3;++c)
            if (g[r][c] == g[r][c+1]) return true;
    for (int c=0;c<4;++c)
        for (int r=0;r<3;++r)
            if (g[r][c] == g[r+1][c]) return true;
    return false;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    Grid g{};
    for (auto &row : g) row.fill(0);

    int score = 0;

    // start with two tiles
    add_random_tile(g);
    add_random_tile(g);

    print_grid(g, score);

    while (true) {
        cout << "\nEnter move (w/a/s/d, q to quit): ";
        char ch;
        if (!(cin >> ch)) break;
        ch = tolower(ch);
        if (ch == 'q') {
            cout << "Bye!\n";
            break;
        }
        char dir = 0;
        if (ch == 'a') dir = 'L';
        else if (ch == 'd') dir = 'R';
        else if (ch == 'w') dir = 'U';
        else if (ch == 's') dir = 'D';
        else {
            cout << "Невірна клавіша. Використовуйте w/a/s/d.\n";
            continue;
        }

        auto [changed, gained] = move_dir(g, dir);
        if (changed) {
            score += gained;
            add_random_tile(g);
        } else {
            // no change -> invalid move (no tile moved/merged)
            // We can inform the player or silently ignore
            // Here — коротко повідомимо
            // but still reprint grid
        }

        print_grid(g, score);

        if (!can_move(g)) {
            cout << "\n=== GAME OVER ===\n";
            cout << "Final score: " << score << "\n";
            cout << "Press Enter to exit...";
            string dummy;
            getline(cin, dummy); // consume leftover
            getline(cin, dummy);
            break;
        }
    }

    return 0;
}
