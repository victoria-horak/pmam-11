import tkinter as tk
from tkinter import colorchooser, ttk
import math


class FlowerGeneratorApp:
    """
    A Tkinter app that allows the user to configure and draw a custom flower by clicking on the canvas
    """

    def __init__(self, master):
        self.master = master
        master.title("🌷 Dynamic Flower Creator")

        self.style = ttk.Style()
        self.style.theme_use("clam")

        # Color Palette
        self.BG_COLOR = "#333333"  # Dark background for controls
        self.FG_COLOR = "#FFFFFF"  # White text
        self.CANVAS_BG = "#E0FFE0"  # Light green for a garden feel
        self.ACCENT_COLOR = "#4CAF50"  # Green accent for buttons
        self.UNDO_COLOR = "#3498db"  # Blue for Undo
        self.INSTRUCTION_COLOR = "#999999"  # Subtle gray for instructions

        # Configuration Variables
        self.petal_color = "#FF6347"  # Default Tomato Red
        self.center_color = "#FFD700"  # Default Gold
        self.petal_count_var = tk.IntVar(value=8)  # Default 8 petals
        self.petal_size_var = tk.DoubleVar(value=0.5)  # Default size scale

        # Drawing History Stack
        # Stores a list of canvas item IDs for each flower drawn step
        self.drawing_history = []

        self.CANVAS_WIDTH = 600
        self.CANVAS_HEIGHT = 600

        # 1. Setup Main Layout -
        self.control_frame = tk.Frame(master, padx=15, pady=15, bg=self.BG_COLOR)
        self.control_frame.pack(side=tk.LEFT, fill=tk.Y)

        self.canvas_frame = tk.Frame(master)
        self.canvas_frame.pack(side=tk.RIGHT)

        # 2. Create Drawing Canvas
        self.canvas = tk.Canvas(
            self.canvas_frame,
            width=self.CANVAS_WIDTH,
            height=self.CANVAS_HEIGHT,
            bg=self.CANVAS_BG,
        )
        self.canvas.pack()
        # Bind the click event to draw a flower at the cursor position
        self.canvas.bind("<Button-1>", self._draw_flower_at_cursor)

        # 3. Setup Controls
        self._setup_controls()

        # Display initial instructions
        self.master.after(500, self._show_instructions)

    def _show_instructions(self, message="Click on the canvas to plant a flower!"):
        """Displays temporary instruction text on the canvas, tagged for deletion."""
        self.canvas.create_text(
            self.CANVAS_WIDTH // 2,
            self.CANVAS_HEIGHT // 2,
            text=message,
            font=("Arial", 20, "italic"),
            fill=self.INSTRUCTION_COLOR,
            tags=("instruction_text",),
        )

    def _setup_controls(self):
        """Sets up all input widgets (labels, buttons, sliders)."""

        # Label for Controls
        tk.Label(
            self.control_frame,
            text="Flower Configuration",
            font=("Arial", 16, "bold"),
            bg=self.BG_COLOR,
            fg=self.FG_COLOR,
        ).pack(pady=(0, 20))

        # Petal Color Selector
        tk.Label(
            self.control_frame,
            text="1. Petal Color:",
            bg=self.BG_COLOR,
            fg=self.FG_COLOR,
            font=("Arial", 11),
        ).pack(pady=(5, 0), anchor="w")
        self.color_display = tk.Label(
            self.control_frame,
            text="  ",
            bg=self.petal_color,
            width=10,
            relief=tk.FLAT,
            bd=3,
        )
        self.color_display.pack(pady=5)
        self.color_button = tk.Button(
            self.control_frame,
            text="Choose Petal Color",
            command=self._choose_petal_color,
            bg=self.ACCENT_COLOR,
            fg=self.FG_COLOR,
            activebackground=self.ACCENT_COLOR,
            activeforeground=self.FG_COLOR,
        )
        self.color_button.pack(pady=5)

        # Petal Count Slider
        tk.Label(
            self.control_frame,
            text="2. Number of Petals (4-24):",
            bg=self.BG_COLOR,
            fg=self.FG_COLOR,
            font=("Arial", 11),
        ).pack(pady=(15, 0), anchor="w")
        self.count_slider = tk.Scale(
            self.control_frame,
            from_=4,
            to=24,
            orient=tk.HORIZONTAL,
            variable=self.petal_count_var,
            bg=self.BG_COLOR,
            fg=self.FG_COLOR,
            highlightthickness=0,
            troughcolor="#555555",
            length=200,
        )
        self.count_slider.pack(pady=5)

        # Petal Size Slider
        tk.Label(
            self.control_frame,
            text="3. Petal Size (0.1 - 1.0 Scale):",
            bg=self.BG_COLOR,
            fg=self.FG_COLOR,
            font=("Arial", 11),
        ).pack(pady=(15, 0), anchor="w")
        self.size_slider = tk.Scale(
            self.control_frame,
            from_=0.1,
            to=1.0,
            resolution=0.05,
            orient=tk.HORIZONTAL,
            variable=self.petal_size_var,
            bg=self.BG_COLOR,
            fg=self.FG_COLOR,
            highlightthickness=0,
            troughcolor="#555555",
            length=200,
        )
        self.size_slider.pack(pady=5)

        # Center Color Selector
        tk.Label(
            self.control_frame,
            text="4. Center Color:",
            bg=self.BG_COLOR,
            fg=self.FG_COLOR,
            font=("Arial", 11),
        ).pack(pady=(15, 0), anchor="w")
        self.center_display = tk.Label(
            self.control_frame,
            text="  ",
            bg=self.center_color,
            width=10,
            relief=tk.FLAT,
            bd=3,
        )
        self.center_display.pack(pady=5)
        self.center_button = tk.Button(
            self.control_frame,
            text="Choose Center Color",
            command=self._choose_center_color,
            bg=self.ACCENT_COLOR,
            fg=self.FG_COLOR,
            activebackground=self.ACCENT_COLOR,
            activeforeground=self.FG_COLOR,
        )
        self.center_button.pack(pady=5)

        # Undo Button
        tk.Button(
            self.control_frame,
            text="Undo Last Step",
            command=self.undo_last_draw,
            bg=self.UNDO_COLOR,
            fg="white",
            font=("Arial", 12),
        ).pack(pady=(30, 10))

        # Clear Button
        tk.Button(
            self.control_frame,
            text="Clear Canvas",
            command=self.clear_canvas,
            bg="#CC0000",
            fg="white",
            font=("Arial", 12),
        ).pack(pady=(10, 10))

    def _choose_petal_color(self):
        """Opens color chooser and updates petal color."""
        color_code = colorchooser.askcolor(title="Choose Petal Color")
        if color_code[1]:
            self.petal_color = color_code[1]
            self.color_display.config(bg=self.petal_color)

    def _choose_center_color(self):
        """Opens color chooser and updates center color."""
        color_code = colorchooser.askcolor(title="Choose Center Color")
        if color_code[1]:
            self.center_color = color_code[1]
            self.center_display.config(bg=self.center_color)

    def clear_canvas(self):
        """Clears all drawn objects from the canvas and redisplays instructions."""
        self.canvas.delete("all")
        self.drawing_history = []  # CRITICAL: Clear the history stack too
        self._show_instructions("Canvas cleared. Click to draw a new flower!")

    def undo_last_draw(self):
        """Deletes all canvas items created in the last drawing step."""
        if self.drawing_history:
            # Pop the list of item IDs for the last flower drawn
            last_flower_ids = self.drawing_history.pop()

            # Delete each item from the canvas
            for item_id in last_flower_ids:
                self.canvas.delete(item_id)
        else:
            print("Drawing history is empty. Nothing to undo.")

    def _draw_flower_at_cursor(self, event):
        """Draws a flower at the cursor position (event.x, event.y)."""
        self.draw_flower(event.x, event.y)

    def draw_flower(self, x, y):
        """
        Draws a flower using the current settings at the specified (x, y) coordinates
        and stores the created item IDs in the history stack.
        """
        self.canvas.delete("instruction_text")

        # List to store the IDs for all items created in this draw step
        flower_ids = []

        # Flower size settings
        petal_count = self.petal_count_var.get()
        size_scale = self.petal_size_var.get()

        petal_length = 80 * size_scale
        petal_width = petal_length * 0.55
        center_radius = 20 * size_scale

        # Draw the petals
        angle_step = 360 / petal_count
        for i in range(petal_count):
            angle = math.radians(i * angle_step)

            # Tip of the petal
            tip_x = x + petal_length * math.cos(angle)
            tip_y = y + petal_length * math.sin(angle)

            # Left curve (perpendicular to the petal direction)
            left_angle = angle + math.radians(90)
            left_x = x + petal_width * math.cos(left_angle)
            left_y = y + petal_width * math.sin(left_angle)

            # Right curve (perpendicular to the petal direction)
            right_angle = angle - math.radians(90)
            right_x = x + petal_width * math.cos(right_angle)
            right_y = y + petal_width * math.sin(right_angle)

            # Create the petal polygon and store its ID
            petal_id = self.canvas.create_polygon(
                x,
                y,
                left_x,
                left_y,
                tip_x,
                tip_y,
                right_x,
                right_y,
                smooth=True,
                splinesteps=30,
                fill=self.petal_color,
                outline=self.petal_color,
                width=1,
            )
            flower_ids.append(petal_id)

        # Draw center (on top of petals) and store its ID
        center_id = self.canvas.create_oval(
            x - center_radius,
            y - center_radius,
            x + center_radius,
            y + center_radius,
            fill=self.center_color,
            outline="#555555",
            width=2,
        )
        flower_ids.append(center_id)

        # Add the list of all IDs for this flower to the history stack
        self.drawing_history.append(flower_ids)


def main():
    root = tk.Tk()
    app = FlowerGeneratorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
