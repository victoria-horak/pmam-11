# Базовий образ Node.js на Alpine Linux
FROM node:18-alpine as angular

# Встановлюємо необхідні залежності для збірки npm пакетів
RUN apk add --no-cache python3 make g++

# Встановлюємо Angular CLI глобально
RUN npm install -g @angular/cli

# Встановлюємо робочу директорію
WORKDIR /src/app

# Копіюємо package.json і package-lock.json перед копіюванням всіх файлів для оптимізації кешування
COPY package*.json ./

# Встановлюємо залежності проєкту
RUN npm install --frozen-lockfile

# Копіюємо решту файлів проєкту
COPY . .

# Відкриваємо порт для Angular додатку
EXPOSE 4200

# Запускаємо Angular додаток
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
