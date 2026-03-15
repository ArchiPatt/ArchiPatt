# admin-settings

Микросервис пользовательских настроек. Хранит цветовую схему интерфейса и список скрытых счетов, привязанных к `userId` из JWT.

## Стек

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify 5
- **ORM**: TypeORM 0.3
- **БД**: PostgreSQL (отдельная БД `admin_settings`)
- **Auth**: JWT-валидация через JWKS (аналогично сервисам `core`, `credits`, `users`)

## Переменные окружения

Скопируй `.env.example` → `.env` и заполни:

| Переменная             | Описание                                          | Default          |
| ---------------------- | ------------------------------------------------- | ---------------- |
| `PORT`                 | Порт сервиса                                      | `4005`           |
| `AUTH_ISSUER`          | URL auth-сервиса (для JWKS и проверки iss)        | —                |
| `AUTH_SERVICE_URL`     | Базовый URL auth-сервиса (проверка revoke токена) | `AUTH_ISSUER`    |
| `AUTH_INTERNAL_TOKEN`  | Внутренний токен для запросов к auth              | —                |
| `USERS_SERVICE_URL`    | Базовый URL users-сервиса                         | `localhost:4001` |
| `USERS_INTERNAL_TOKEN` | Внутренний токен для запросов к users             | —                |
| `INTERNAL_TOKEN`       | Fallback для всех internal-токенов                | —                |
| `DB_HOST`              | Хост PostgreSQL                                   | `localhost`      |
| `DB_PORT`              | Порт PostgreSQL                                   | `5432`           |
| `DB_USER`              | Пользователь БД                                   | `postgres`       |
| `DB_PASSWORD`          | Пароль БД                                         | —                |
| `DB_NAME`              | Имя базы данных                                   | `admin_settings` |

## Запуск

```bash
npm install
cp .env.example .env
# Создай БД: createdb admin_settings
npm run migration:run
npm run dev
```

## Миграции

```bash
npm run migration:run     # применить все миграции
npm run migration:revert  # откатить последнюю
npm run migration:generate # сгенерировать новую по изменениям в entities
```

## API

Swagger UI доступен по адресу: `http://localhost:4005/swagger`

### Цветовая схема

| Метод  | Путь                           | Описание                             |
| ------ | ------------------------------ | ------------------------------------ |
| `GET`  | `/admin-settings/color-scheme` | Получить схему (default: `auto`)     |
| `POST` | `/admin-settings/color-scheme` | Установить схему (`dark/light/auto`) |

### Скрытые счета

| Метод    | Путь                                         | Описание                |
| -------- | -------------------------------------------- | ----------------------- |
| `GET`    | `/admin-settings/hidden-accounts`            | Список скрытых счетов   |
| `POST`   | `/admin-settings/hidden-accounts`            | Добавить счёт в скрытые |
| `DELETE` | `/admin-settings/hidden-accounts/:accountId` | Убрать счёт из скрытых  |

Все эндпоинты требуют заголовок `Authorization: Bearer <token>`.

## Структура БД

### Таблица `user_color_scheme`

| Колонка       | Тип                     | Описание                           |
| ------------- | ----------------------- | ---------------------------------- |
| `userId`      | `uuid` PK               | ID пользователя из JWT (`sub`)     |
| `colorScheme` | `text` DEFAULT `'auto'` | Выбранная схема: `dark/light/auto` |
| `updatedAt`   | `timestamptz`           | Дата последнего обновления         |

### Таблица `hidden_account`

| Колонка     | Тип           | Описание                       |
| ----------- | ------------- | ------------------------------ |
| `id`        | `uuid` PK     | Суррогатный первичный ключ     |
| `userId`    | `uuid` INDEX  | ID пользователя из JWT (`sub`) |
| `accountId` | `text`        | ID скрытого счёта              |
| `createdAt` | `timestamptz` | Дата скрытия                   |

Уникальный составной индекс на `(userId, accountId)` — один пользователь не может скрыть один счёт дважды.
