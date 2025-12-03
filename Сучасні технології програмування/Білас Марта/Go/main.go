package main

import (
	"fmt"
	"math"
	"strconv"
	"strings"
)

type Node interface {
	Calculate() (float64, error)
	ToPrefix() string
	ToPostfix() string
	PrintTree(indent string, isLeft bool)
}

type OperatorNode struct {
	Operator string
	Left     Node
	Right    Node
}

type OperandNode struct {
	Value float64
}

type CustomError struct {
	Msg string
}

func (e CustomError) Error() string {
	return e.Msg
}

func NewCustomError(msg string) error {
	return CustomError{msg}
}

func (n *OperandNode) Calculate() (float64, error) {
	return n.Value, nil
}

func (n *OperatorNode) Calculate() (float64, error) {
	left, err := n.Left.Calculate()
	if err != nil {
		return 0, err
	}
	right, err := n.Right.Calculate()
	if err != nil {
		return 0, err
	}

	switch n.Operator {
	case "^":
		return math.Pow(left, right), nil
	case "+":
		return left + right, nil
	case "-":
		return left - right, nil
	case "*":
		return left * right, nil
	case "/":
		if right == 0 {
			return 0, NewCustomError("Division by zero")
		}
		return left / right, nil
	}
	return 0, NewCustomError("Unknown operator: " + n.Operator)
}

func (n *OperandNode) ToPrefix() string {
	return fmt.Sprintf("%.2f", n.Value)
}

func (n *OperatorNode) ToPrefix() string {
	return "(" + n.Operator + " " + n.Left.ToPrefix() + " " + n.Right.ToPrefix() + ")"
}

func (n *OperandNode) ToPostfix() string {
	return fmt.Sprintf("%.2f", n.Value)
}

func (n *OperatorNode) ToPostfix() string {
	return "(" + n.Left.ToPostfix() + " " + n.Right.ToPostfix() + " " + n.Operator + ")"
}

func (n *OperatorNode) PrintTree(indent string, isLeft bool) {
	if isLeft {
		fmt.Print(indent + "├── ")
	} else {
		fmt.Print(indent + "└── ")
	}
	fmt.Println(n.Operator)
	if n.Left != nil {
		n.Left.PrintTree(indent+Indentation(isLeft), true)
	}
	if n.Right != nil {
		n.Right.PrintTree(indent+Indentation(isLeft), false)
	}
}

func (n *OperandNode) PrintTree(indent string, isLeft bool) {
	if isLeft {
		fmt.Print(indent + "├── ")
	} else {
		fmt.Print(indent + "└── ")
	}
	fmt.Println(n.Value)
}

func Indentation(isLeft bool) string {
	if isLeft {
		return "│   "
	}
	return "    "
}

func BuildTree(expression string) (Node, error) {
	tokens := strings.Fields(expression)
	var output []Node
	var operators []string
	precedence := map[string]int{
		"+": 1,
		"-": 1,
		"*": 2,
		"/": 2,
		"^": 3,
	}

	for i := 0; i < len(tokens); i++ {
		token := tokens[i]
		switch token {
		case "+", "-", "*", "/", "^":
			for len(operators) > 0 && precedence[operators[len(operators)-1]] >= precedence[token] {
				err := ProcessOperator(&operators, &output)
				if err != nil {
					return nil, err
				}
			}
			operators = append(operators, token)

		case "(":
			operators = append(operators, token)

		case ")":
			for len(operators) > 0 && operators[len(operators)-1] != "(" {
				err := ProcessOperator(&operators, &output)
				if err != nil {
					return nil, err
				}
			}
			if len(operators) == 0 {
				return nil, NewCustomError("Mismatched parentheses")
			}
			operators = operators[:len(operators)-1]

		default:
			value, err := strconv.ParseFloat(token, 64)
			if err != nil {
				return nil, NewCustomError("Invalid operand")
			}
			output = append(output, &OperandNode{value})
		}
	}

	for len(operators) > 0 {
		err := ProcessOperator(&operators, &output)
		if err != nil {
			return nil, err
		}
	}

	if len(output) != 1 {
		return nil, NewCustomError("Invalid expression")
	}

	return output[0], nil
}

func ProcessOperator(operators *[]string, output *[]Node) error {
	if len(*operators) == 0 {
		return NewCustomError("Invalid expression")
	}
	operator := (*operators)[len(*operators)-1]
	*operators = (*operators)[:len(*operators)-1]

	if len(*output) < 2 {
		return NewCustomError("Invalid expression")
	}

	right := (*output)[len(*output)-1]
	left := (*output)[len(*output)-2]
	*output = (*output)[:len(*output)-2]

	*output = append(*output, &OperatorNode{operator, left, right})
	return nil
}

func main() {
	defer func() {
		if err := recover(); err != nil {
			fmt.Println("Panic error:", err)
		}
	}()

	expression := "9.4 - 6.8 + 2 * ( 4.1 + 3 - 1 )"
	tree, err := BuildTree(expression)
	if err != nil {
		fmt.Println("Error building tree:", err)
		return
	}

	fmt.Println("Prefix notation:", tree.ToPrefix())
	fmt.Println("Postfix notation:", tree.ToPostfix())

	result, err := tree.Calculate()
	if err != nil {
		fmt.Println("Calculation error:", err)
		return
	}
	fmt.Println("Calculation result:", result)

	fmt.Println()
	tree.PrintTree("", true)
	fmt.Println()
}
