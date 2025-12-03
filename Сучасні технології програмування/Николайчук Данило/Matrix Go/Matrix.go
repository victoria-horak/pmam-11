package main

import (
	"errors"
	"fmt"
	"sort"
)

type Matrix struct {
	data [][]int
	rows int
	cols int
}

type RowSorter struct {
	matrix Matrix
}

type ColumnSorter struct {
	matrix Matrix
}

func (s RowSorter) Len() int { return s.matrix.rows }
func (s RowSorter) Less(i, j int) bool {
	return LessRow(s.matrix.data[i], s.matrix.data[j])
}
func (s RowSorter) Swap(i, j int) {
	s.matrix.data[i], s.matrix.data[j] = s.matrix.data[j], s.matrix.data[i]
}

func (s ColumnSorter) Len() int           { return s.matrix.cols }
func (s ColumnSorter) Less(i, j int) bool { return LessColumn(s.matrix, i, j) }
func (s ColumnSorter) Swap(i, j int) {
	for k := 0; k < s.matrix.rows; k++ {
		s.matrix.data[k][i], s.matrix.data[k][j] = s.matrix.data[k][j], s.matrix.data[k][i]
	}
}

func NewMatrix(rows, cols int) Matrix {
	data := make([][]int, rows)
	for i := 0; i < rows; i++ {
		data[i] = make([]int, cols)
	}
	return Matrix{data, rows, cols}
}

func InputMatrix(rows, cols int) Matrix {
	matrix := NewMatrix(rows, cols)
	fmt.Printf("Enter matrix elements (%dx%d):\n", rows, cols)
	for i := 0; i < rows; i++ {
		for j := 0; j < cols; j++ {
			fmt.Printf("Element [%d][%d]: ", i+1, j+1)
			fmt.Scan(&matrix.data[i][j])
		}
	}
	fmt.Println()
	return matrix
}

func (m Matrix) PrintMatrix() {
	for i := 0; i < m.rows; i++ {
		for j := 0; j < m.cols; j++ {
			fmt.Printf("%6d ", m.data[i][j])
		}
		fmt.Println()
	}
}

func (m Matrix) Plus(second Matrix) (Matrix, error) {
	if m.rows != second.rows || m.cols != second.cols {
		return Matrix{}, errors.New("Different sizes")
	}
	result := NewMatrix(m.rows, m.cols)
	for i := 0; i < m.rows; i++ {
		for j := 0; j < m.cols; j++ {
			result.data[i][j] = m.data[i][j] + second.data[i][j]
		}
	}
	return result, nil
}

func (m Matrix) Minus(second Matrix) (Matrix, error) {
	if m.rows != second.rows || m.cols != second.cols {
		return Matrix{}, errors.New("Different sizes")
	}
	result := NewMatrix(m.rows, m.cols)
	for i := 0; i < m.rows; i++ {
		for j := 0; j < m.cols; j++ {
			result.data[i][j] = m.data[i][j] - second.data[i][j]
		}
	}
	return result, nil
}

func (m Matrix) Transpose() Matrix {
	result := NewMatrix(m.cols, m.rows)
	for i := 0; i < m.rows; i++ {
		for j := 0; j < m.cols; j++ {
			result.data[j][i] = m.data[i][j]
		}
	}
	return result
}

func (m Matrix) Determinant() (int, error) {
	if m.rows != m.cols {
		return 0, errors.New("Matrix must be square")
	}

	data := make([][]float64, m.rows)
	for i := range data {
		data[i] = make([]float64, m.cols)
		for j := range data[i] {
			data[i][j] = float64(m.data[i][j])
		}
	}

	sign := 1.0
	for i := 0; i < m.rows; i++ {
		if data[i][i] == 0 {
			swapped := false
			for k := i + 1; k < m.rows; k++ {
				if data[k][i] != 0 {
					data[i], data[k] = data[k], data[i]
					sign *= -1
					swapped = true
					break
				}
			}
			if !swapped {
				return 0, nil
			}
		}

		for k := i + 1; k < m.rows; k++ {
			coef := data[k][i] / data[i][i]
			for j := i; j < m.cols; j++ {
				data[k][j] -= coef * data[i][j]
			}
		}
	}

	res := sign
	for i := 0; i < m.rows; i++ {
		res *= data[i][i]
	}

	return int(res), nil
}

func (m Matrix) Slar() ([]int, error) {
	n := len(m.data)
	if m.cols != n+1 {
		return nil, errors.New("Invalid matrix")
	}

	elements := make([][]float64, n)
	for i := 0; i < n; i++ {
		elements[i] = make([]float64, n+1)
		for j := 0; j < n+1; j++ {
			elements[i][j] = float64(m.data[i][j])
		}
	}

	for i := 0; i < n; i++ {
		coef := elements[i][i]
		for j := 0; j < n+1; j++ {
			elements[i][j] /= coef
		}
		for k := 0; k < n; k++ {
			if k != i {
				coef = elements[k][i]
				for j := 0; j < n+1; j++ {
					elements[k][j] -= coef * elements[i][j]
				}
			}
		}
	}

	res := make([]int, n)
	for i := 0; i < n; i++ {
		res[i] = int(elements[i][n])
	}

	return res, nil
}

func LessRow(a, b []int) bool {
	for i := 0; i < len(a); i++ {
		if a[i] < b[i] {
			return true
		} else if a[i] > b[i] {
			return false
		}
	}
	return false
}

func LessColumn(m Matrix, col1, col2 int) bool {
	for i := 0; i < m.rows; i++ {
		if m.data[i][col1] < m.data[i][col2] {
			return true
		} else if m.data[i][col1] > m.data[i][col2] {
			return false
		}
	}
	return false
}

func main() {
	var rows, cols int
	fmt.Print("Enter rows and columns count for the matrix: ")
	fmt.Scan(&rows, &cols)

	matrix1 := InputMatrix(rows, cols)
	matrix2 := InputMatrix(rows, cols)

	fmt.Println()
	fmt.Println("Matrix1:")
	matrix1.PrintMatrix()
	fmt.Println()
	fmt.Println("Matrix2:")
	matrix2.PrintMatrix()

	sum, err := matrix1.Plus(matrix2)
	fmt.Println()
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("Matrices sum:")
		sum.PrintMatrix()
	}

	sub, err := matrix1.Minus(matrix2)
	fmt.Println()
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("Matrices sub:")
		sub.PrintMatrix()
	}

	gaus1, err := matrix1.Slar()
	fmt.Println()
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("Matrix1 SLAR result -", gaus1)
	}

	gaus2, err := matrix2.Slar()
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("Matrix2 SLAR result -", gaus2)
	}

	det1, err := matrix1.Determinant()
	fmt.Println()
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("Determinant of Matrix1: %d\n", det1)
	}

	det2, err := matrix2.Determinant()
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("Determinant of Matrix2: %d\n", det2)
	}

	transposed1 := matrix1.Transpose()
	fmt.Println()
	fmt.Println("Transposed Matrix1:")
	transposed1.PrintMatrix()

	transposed2 := matrix2.Transpose()
	fmt.Println()
	fmt.Println("Transposed Matrix2:")
	transposed2.PrintMatrix()

	rowSorter := RowSorter{matrix1}
	sort.Sort(rowSorter)
	fmt.Println()
	fmt.Println("Matrix1 sorted by rows:")
	matrix1.PrintMatrix()

	columnSorter := ColumnSorter{matrix1}
	sort.Sort(columnSorter)
	fmt.Println()
	fmt.Println("Matrix1 sorted by columns:")
	matrix1.PrintMatrix()
}
