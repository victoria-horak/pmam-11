import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import tkinter as tk
from tkinter import scrolledtext, ttk
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from sklearn.linear_model import LinearRegression
from datetime import timedelta

# Завантаження даних
titanic = pd.read_csv(r"C:\Users\User\Desktop\Програмування\Python\Titanic.csv", encoding='cp1251', sep=';')
apple = pd.read_csv(r"C:\Users\User\Desktop\Програмування\Python\apple.csv",
                    parse_dates=["Date"], index_col="Date", sep=';', dayfirst=True)

# Titanic: таблиці та відсотки
survival_stats = titanic.groupby(["Sex", "Survived"], observed=False)["PassengerId"].count().reset_index(name="Count")
total_by_sex = titanic.groupby("Sex", observed=False)["PassengerId"].count()
survival_stats['Percent'] = survival_stats.apply(lambda row: (row['Count']/total_by_sex[row['Sex']]*100).round(2), axis=1)

class_stats = titanic.groupby(["Pclass", "Sex"], observed=False)["PassengerId"].count().reset_index(name="Count")
total_by_class = titanic.groupby("Pclass", observed=False)["PassengerId"].count()
class_stats['Percent'] = class_stats.apply(lambda row: (row['Count']/total_by_class[row['Pclass']]*100).round(2), axis=1)

# Виживання по статі та віку
survival_age_table = titanic.pivot_table(
    index=["Sex","Age"], columns="Survived", values="PassengerId",
    aggfunc="count", fill_value=0
).reset_index().rename(columns={0:"Не вижив",1:"Вижив"})

# Клас, стать та вік
class_age_stats = titanic.groupby(["Pclass","Sex","Age"], observed=False)["PassengerId"].count().reset_index(name="Count")

# Додатковий аналіз Titanic
titanic['AgeGroup'] = pd.cut(titanic['Age'], bins=[0,12,18,40,60,80],
                             labels=['0-12','13-18','19-40','41-60','61-80'])
survival_by_group = titanic.groupby('AgeGroup', observed=False)['Survived'].mean().round(2)*100
mean_age_survived = titanic.groupby('Survived', observed=False)['Age'].mean().round(1)

# Apple аналіз
apple_period1 = apple.loc["2014-10-05":"2018-04-01"]
apple_close_mean = apple_period1['Close'].mean().round(2)
apple_period2 = apple.loc["2012-02":"2017-02"]

apple['MA_30'] = apple['Close'].rolling(window=30).mean()
apple['STD_30'] = apple['Close'].rolling(window=30).std()
apple['Change'] = apple['Close'].diff()
apple['Trend'] = np.poly1d(np.polyfit(range(len(apple['Close'])), apple['Close'],1))(range(len(apple['Close'])))

# Прогноз Apple
x = np.arange(len(apple)).reshape(-1,1)
y = apple['Close'].values
model = LinearRegression()
model.fit(x,y)
future_days = 90
x_future = np.arange(len(apple),len(apple)+future_days).reshape(-1,1)
y_pred = model.predict(x_future)
future_dates = [apple.index[-1]+timedelta(days=i+1) for i in range(future_days)]

# Tkinter GUI
window = tk.Tk()
window.title("Статистика по даних Titanic і Apple")
window.geometry("1200x950")

notebook = ttk.Notebook(window)
notebook.pack(fill="both", expand=True)

# Вкладка 1: Основна статистика
frame_main = tk.Frame(notebook)
notebook.add(frame_main, text="Основна статистика")
text_area_main = scrolledtext.ScrolledText(frame_main,width=120,height=45)
text_area_main.pack(padx=10,pady=10)

text_area_main.insert(tk.END,"Виживання по статі (Titanic):\n")
text_area_main.insert(tk.END,survival_stats.to_string(index=False))
text_area_main.insert(tk.END,"\n\nКількість людей по класу та статі (Titanic):\n")
text_area_main.insert(tk.END,class_stats.to_string(index=False))
text_area_main.insert(tk.END,"\n\nВідсоток виживших за віковими групами:\n")
text_area_main.insert(tk.END,survival_by_group.to_string())
text_area_main.insert(tk.END,"\n\nСередній вік виживших/невиживших:\n")
text_area_main.insert(tk.END,mean_age_survived.to_string())

# Apple
text_area_main.insert(tk.END, "\n\n\nАналіз часових рядів Apple (2014-10-05 — 2018-04-01):\n")
text_area_main.insert(
    tk.END,
    f"• Середня ціна акцій по закриттю (Close) за період: {apple_close_mean}\n"
)

# Роки, коли Open > 110.2
years_high_open = [year for year, group in apple.groupby(apple.index.year) if group['Open'].iloc[0] > 110.2]
if years_high_open:
    years_str = ', '.join(map(str, years_high_open))
else:
    years_str = "немає таких років"
text_area_main.insert(
    tk.END,
    f"• Роки, коли торги починались із ціни вище 110.2: {years_str}\n"
)

text_area_main.insert(
    tk.END,
    "Для аналізу часових рядів використано дані про ціну акцій Apple.\n"
    "Середнє значення (mean) розраховано за формулою: "
    "Mean = Σ(Close) / N, де N — кількість днів у періоді.\n"
    "Для пошуку років, коли торги відкривалися з ціною вище 110.2, "
    "використано групування за роками з першою ціною 'Open' кожного року.\n"
    "Якщо перше значення 'Open' > 110.2 — рік вважається роком високого старту.\n"
)

# Вкладка 2: Виживання по статі та віку
frame_age = tk.Frame(notebook)
notebook.add(frame_age,text="Групування по статі та віку")
text_area_age = scrolledtext.ScrolledText(frame_age,width=120,height=45)
text_area_age.pack(padx=10,pady=10)
text_area_age.insert(tk.END, survival_age_table.to_string(index=False))

# Вкладка 3: Клас, стать та вік
frame_class_age = tk.Frame(notebook)
notebook.add(frame_class_age,text="Групування: клас, стать та вік")
text_area_class_age = scrolledtext.ScrolledText(frame_class_age,width=120,height=45)
text_area_class_age.pack(padx=10,pady=10)
text_area_class_age.insert(tk.END,class_age_stats.to_string(index=False))

# Вкладки для графіків Titanic
def add_titanic_graph_tab(title, fig, explanation):
    frame = tk.Frame(notebook)
    notebook.add(frame, text=title)
    canvas = FigureCanvasTkAgg(fig, master=frame)
    canvas.draw()
    canvas.get_tk_widget().pack()
    label = tk.Label(frame, text=explanation, wraplength=1100, justify="left")
    label.pack(pady=5)
    return frame

# Виживання по статі
fig1, ax1 = plt.subplots(figsize=(8,5))
sns.countplot(data=titanic,x="Sex",hue="Survived",palette="Set2",ax=ax1)
for p in ax1.patches:
    height = p.get_height()
    ax1.annotate(f"{height}",(p.get_x()+p.get_width()/2.,height+0.5),ha='center')
explanation1 = ("Графік показує кількість пасажирів Titanic, що вижили та не вижили по статі.\n"
                "Відсотки розраховані як Count пасажирів / Загальна кількість пасажирів відповідної статі * 100. \n"
                "Аналіз цих даних та розрахунків однозначно підтверджує, що під час евакуації на Титаніку діяв принцип Жінки та діти — перші. \n Ймовірність вижити для жінки (74.2%) була майже у чотири рази вищою за ймовірність вижити для чоловіка (18.9%).\n"
                "Цей величезний розрив демонструє, що попри те, що на борту було більше чоловіків (577 проти 314), рятувальні місця були пріоритетно віддані жінкам. Чоловіки склали переважну більшість жертв: 468 загиблих чоловіків проти 81 загиблої жінки.")
add_titanic_graph_tab("Виживання по статі", fig1, explanation1)

# Виживання по класу
fig2, ax2 = plt.subplots(figsize=(8,5))
sns.countplot(data=titanic,x="Pclass",hue="Survived",palette="Set1",ax=ax2)
for p in ax2.patches:
    ax2.annotate(f"{p.get_height()}",(p.get_x()+p.get_width()/2.,p.get_height()+0.5),ha='center')
explanation2 = ("Графік показує кількість пасажирів Titanic, що вижили та не вижили по класах корабля.\n"
                "Виживання вищого класу вище через кращі умови та пріоритет евакуації. \nІснує чітка позитивна кореляція між класом квитка та ймовірністю виживання. Чим вищий клас пасажира, тим вищі були його шанси на порятунок.")
add_titanic_graph_tab("Виживання по класу", fig2, explanation2)

# Виживання за віковими групами
fig3, ax3 = plt.subplots(figsize=(8,6))
survival_by_group.plot(kind='bar',color='skyblue',ax=ax3)
for i,val in enumerate(survival_by_group):
    ax3.text(i,val+1,f"{val:.1f}%\n({survival_by_group.index[i]})",ha='center')
ax3.set_title("Відсоток виживших за віковими групами")
explanation3 = ("Графік показує відсоток виживших у вікових групах.\n"
                "Відсоток = кількість виживших у групі / загальна кількість пасажирів групи *100.")
add_titanic_graph_tab("Виживання за віковими групами", fig3, explanation3)

# Вкладки для графіків Apple
def add_apple_graph_tab(title, fig, explanation):
    frame = tk.Frame(notebook)
    notebook.add(frame,text=title)
    canvas = FigureCanvasTkAgg(fig,master=frame)
    canvas.draw()
    canvas.get_tk_widget().pack()
    label = tk.Label(frame,text=explanation,wraplength=1100,justify="left")
    label.pack(pady=5)
    return frame

# Apple: ціна, тренд, середня та прогноз
fig4, ax4 = plt.subplots(figsize=(12,6))
ax4.plot(apple.index,apple['Close'],label='Close',color='blue')
ax4.plot(apple.index,apple['MA_30'],label='Ковзне середнє',color='orange')
ax4.plot(apple.index,apple['Trend'],label='Лінійний тренд',color='red',linestyle='--')
ax4.axhline(apple_close_mean,color='black',linestyle=':',label=f'Середня ціна Close={apple_close_mean}')
ax4.plot(future_dates,y_pred,label='Прогноз (90 днів)',color='green',linestyle='-.')
ax4.set_title("Візуалізація ціни акцій Apple (2014 - 2018)")
ax4.legend()
explanation4 = ("Синя лінія — фактична ціна акцій Close\n"
                "Оранжева — ковзне середнє за 30 днів,робить криву ціни більш плавною, що полегшує візуальне сприйняття основного напрямку руху.\n"
                "Висхідний тренд: Коли ковзне середнє зростає.\n"
                "Низхідний тренд: Коли ковзне середнє падає.\n"
                "Червона пунктирна — лінійний тренд ціни (Trend)\n"
                "Чорна пунктирна — середня ціна Close за період\n"
                "Зелена пунктирна — прогноз ціни на 90 днів, розрахований за допомогою лінійної регресії від індексу днів.")
add_apple_graph_tab("Apple: ціна, тренд, середня та прогноз", fig4, explanation4)

# Apple: волатильність
fig5, ax5 = plt.subplots(figsize=(12,5))
ax5.plot(apple.index,apple['STD_30'],label='Стандартне відхилення',color='purple')
ax5.set_title("Волатильність Apple (30-денне стандартне відхилення)")
ax5.legend()
explanation5 = ("Волатильність показує, наскільки сильно коливається ціна акцій за останні 30 днів.\n"
                "На графіку зображено стандартне відхилення ціни Close за 30 останніх днів.\n"
                "Висока волатильність означає більші коливання цін, низька — стабільні ціни.")
add_apple_graph_tab("Apple: волатильність", fig5, explanation5)

# Apple: денна зміна
fig6, ax6 = plt.subplots(figsize=(12,5))
ax6.plot(apple.index,apple['Change'],color='gray')
ax6.axhline(0,color='red',linestyle='--')
ax6.set_title("Денна зміна ціни Apple")
explanation6 = ("Графік показує щоденну зміну ціни Close.\n"
                "Горизонтальна червона лінія = 0\n"
                "Вище нуля — ціна зросла, нижче нуля — ціна знизилась.\n"
                "Change = Close[i] - Close[i-1].")
add_apple_graph_tab("Apple: денна зміна", fig6, explanation6)
window.mainloop()