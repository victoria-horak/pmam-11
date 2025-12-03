import triangle as tr
import numpy as np
import tkinter as tk
from tkinter import messagebox, scrolledtext
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

def triangle_area(point1, point2, point3):
    x1, y1 = point1
    x2, y2 = point2
    x3, y3 = point3

    area = 0.5 * abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))
    return area


def M_matrix(area, d):
    M = (d * area * 2 / 24) * np.array([[2, 1, 1], [1, 2, 1], [1, 1, 2]])
    return M


def Q_vector(M, f, d):
    fe = np.array([f, f, f])
    Q = (M / d).dot(fe)
    return Q


def K_matrix(point1, point2, point3, a11, a22):
    area = triangle_area(point1, point2, point3)
    b = [point2[1] - point3[1], point3[1] - point1[1], point1[1] - point2[1]]
    c = [point3[0] - point2[0], point1[0] - point3[0], point2[0] - point1[0]]

    K = 0.5 * 2 * area * np.array([
        [a11 * b[0] ** 2 + a22 * c[0] ** 2, a11 * b[0] * b[1] + a22 * c[0] * c[1],
         a11 * b[0] * b[2] + a22 * c[0] * c[2]],
        [a11 * b[1] * b[0] + a22 * c[1] * c[0], a11 * b[1] ** 2 + a22 * c[1] ** 2,
         a11 * b[1] * b[2] + a22 * c[1] * c[2]],
        [a11 * b[2] * b[0] + a22 * c[2] * c[0], a11 * b[2] * b[1] + a22 * c[2] * c[1],
         a11 * b[2] ** 2 + a22 * c[2] ** 2]
    ])
    return K


def global_matrix(n, triangles_indexes, vertices_points, a11, a22, d, f):
    A = np.zeros((n, n))
    b = np.zeros(n)

    for triangle in (triangles_indexes):
        point1, point2, point3 = vertices_points[triangle]
        tr_area = triangle_area(point1, point2, point3)
        K = K_matrix(point1, point2, point3, a11, a22)
        M = M_matrix(tr_area, d)
        q = Q_vector(M, f, d)

        result_text.insert(tk.END, "Матриця K:\n")
        result_text.insert(tk.END, str(K) + "\n")

        result_text.insert(tk.END, "Матриця M:\n")
        result_text.insert(tk.END, str(M) + "\n")

        result_text.insert(tk.END, "Вектор q:\n")
        result_text.insert(tk.END, str(q) + "\n")

        matrix_j = 0
        matrix_i = 0
        for i in triangle:
            for j in triangle:
                A[i, j] += K[matrix_i, matrix_j] + M[matrix_i, matrix_j]
                b[i] += q[matrix_i]
                matrix_j += 1
            matrix_i += 1
            matrix_j = 0

    return A, b

def parse_points(input_text):
    try:
        points_list = [list(map(float, point.split(','))) for point in input_text.split(';') if point.strip()]
        if all(len(p) == 2 for p in points_list):
            return {'vertices': points_list}
        else:
            raise ValueError
    except:
        raise ValueError("Неправильний формат введення точок. Використовуйте формат: 1.2,2.5; 3.4,4.5; ...")

def triangulate_points():
    result_text.delete(1.0, tk.END)
    try:
        a11 = 4
        a22 = 3
        d = 1
        f = 2

        points = parse_points(points_entry.get())
        triangulation = tr.triangulate({"vertices": np.array(points["vertices"])}, "qa0.2")
        vertices_points = triangulation["vertices"]
        triangles_indexes = triangulation['triangles']
        n = len(vertices_points)

        result_text.insert(tk.END, "Трикутники (нумерація вузлів):\n")
        for i, triangle in enumerate(triangles_indexes):
            result_text.insert(tk.END, f"Трикутник {i + 1}: {triangle}\n")
        result_text.insert(tk.END, "\nВузли (координати):\n")
        for i, vertice in enumerate(vertices_points):
            result_text.insert(tk.END, f"Вузол {i}: {vertice}\n")
        result_text.insert(tk.END, "\n\n")

        A, b = global_matrix(n, triangles_indexes, vertices_points, a11, a22, d, f)

        result_text.insert(tk.END, "Матриця A:\n")
        result_text.insert(tk.END, str(A) + "\n")

        result_text.insert(tk.END, "Вектор b:\n")
        result_text.insert(tk.END, str(b) + "\n")

        ax.clear()
        ax.triplot(vertices_points[:, 0], vertices_points[:, 1], triangles_indexes)
        ax.plot(vertices_points[:, 0], vertices_points[:, 1], 'go')
        ax.set_aspect('equal')
        canvas.draw()

    except ValueError as ve:
        messagebox.showerror("Помилка", str(ve))
    except Exception as e:
        messagebox.showerror("Помилка", f"Сталася помилка: {str(e)}")

root = tk.Tk()
root.title("Форматування матриці МСЕ із використанням лінійних трикутних скінченних елементів")

root.rowconfigure(0, weight=1)
root.rowconfigure(1, weight=1)
root.columnconfigure(0, weight=1)
root.columnconfigure(1, weight=3)

input_frame = tk.Frame(root)
input_frame.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
input_frame.rowconfigure(1, weight=1)

points_label = tk.Label(input_frame, text="Введіть точки")
points_label.grid(row=0, column=0, sticky="w")
points_entry = tk.Entry(input_frame, width=50)
points_entry.grid(row=1, column=0, pady=5, sticky="ew")
points_entry.insert(0, "0,0;1,0;1,1")

submit_button = tk.Button(input_frame, text="Триангулювати", command=triangulate_points)
submit_button.grid(row=2, column=0, pady=10)

output_frame = tk.Frame(root)
output_frame.grid(row=0, column=1, padx=10, pady=10, sticky="nsew")
output_frame.rowconfigure(1, weight=1)
output_frame.columnconfigure(0, weight=1)

result_label = tk.Label(output_frame, text="Результати:")
result_label.grid(row=0, column=0, sticky="w")
result_text = scrolledtext.ScrolledText(output_frame, height=10, width=60)
result_text.grid(row=1, column=0, pady=5, sticky="nsew")

plot_frame = tk.Frame(root)
plot_frame.grid(row=1, column=1, padx=10, pady=10, sticky="nsew")
plot_frame.rowconfigure(0, weight=1)
plot_frame.columnconfigure(0, weight=1)

fig, ax = plt.subplots()
canvas = FigureCanvasTkAgg(fig, master=plot_frame)
canvas.draw()
canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

root.mainloop()
