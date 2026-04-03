# Диаграммы пакетов сервисов

---

## 1. Auth Service

```mermaid
flowchart TB
    subgraph Entry["Точка входа"]
        main["main.ts"]
        server["server.ts"]
    end

    subgraph Routes["routes"]
        auth_routes["auth.ts"]
        docs_routes["docs.ts"]
    end

    subgraph Handlers["handlers"]
        auth_handlers["auth.ts"]
    end

    subgraph Controllers["controllers"]
        auth_controllers["auth.ts"]
    end

    subgraph Services["services"]
        auth_services["auth.ts"]
    end

    subgraph Security["security"]
        bearer["bearer.ts"]
        tokens["tokens.ts"]
        jwks["jwks.ts"]
    end

    subgraph Integrations["integrations"]
        users_service["users-service.ts"]
    end

    subgraph DB["db"]
        data_source["data-source.ts"]
        entities["entities/"]
    end

    subgraph Utils["utils"]
        html["html.ts"]
    end

    main --> server
    server --> data_source
    server --> Routes
    auth_routes --> auth_handlers
    auth_handlers --> auth_controllers
    auth_handlers --> bearer
    auth_handlers --> html
    auth_controllers --> auth_services
    auth_controllers --> tokens
    auth_controllers --> jwks
    auth_controllers --> users_service
    auth_services --> entities
```

**Слои и поток данных:**
| Слой | Модули | Вызывает |
|------|--------|----------|
| Entry | main, server | db, routes |
| Routes | auth, docs | handlers |
| Handlers | auth | controllers, security |
| Controllers | auth | services, security, integrations |
| Services | auth | db/entities |
| DB | data-source, entities | – |
| Integrations | users-service | Users API |
| Security | bearer, tokens, jwks | – |

---

## 2. Users Service

```mermaid
flowchart TB
    subgraph Entry["Точка входа"]
        main["main.ts"]
        server["server.ts"]
    end

    subgraph Routes["routes"]
        users_routes["users.ts"]
        docs_routes["docs.ts"]
    end

    subgraph Handlers["handlers"]
        users_handlers["users.ts"]
    end

    subgraph Controllers["controllers"]
        users_controllers["users.ts"]
        auth_controllers["auth.ts"]
    end

    subgraph Services["services"]
        profiles["profiles.ts"]
    end

    subgraph Security["security"]
        jwt["jwt.ts"]
    end

    subgraph Integrations["integrations"]
        auth_service["auth-service.ts"]
    end

    subgraph DB["db"]
        data_source["data-source.ts"]
        entities["entities/"]
    end

    subgraph Bootstrap["bootstrap"]
        seed["seed.ts"]
    end

    main --> server
    server --> data_source
    server --> Bootstrap
    server --> Routes
    users_routes --> users_handlers
    users_handlers --> users_controllers
    users_handlers --> auth_controllers
    users_handlers --> jwt
    users_controllers --> profiles
    auth_controllers --> auth_service
    profiles --> entities
```

**Слои и поток данных:**
| Слой | Модули | Вызывает |
|------|--------|----------|
| Entry | main, server | db, bootstrap, routes |
| Routes | users, docs | handlers |
| Handlers | users | controllers, security |
| Controllers | users, auth | services, integrations |
| Services | profiles | db/entities |
| DB | data-source, entities | – |
| Integrations | auth-service | Auth API |
| Bootstrap | seed | db |

---

## 3. Credits Service

```mermaid
flowchart TB
    subgraph Entry["Точка входа"]
        main["main.ts"]
        server["server.ts"]
        workers["workers/accrual.ts"]
    end

    subgraph Routes["routes"]
        credits_routes["credits.ts"]
        docs_routes["docs.ts"]
    end

    subgraph Handlers["handlers"]
        credits_handlers["credits.ts"]
    end

    subgraph Controllers["controllers"]
        credits_controllers["credits.ts"]
        tariffs_controllers["tariffs.ts"]
        auth_controllers["auth.ts"]
    end

    subgraph Services["services"]
        credits_services["credits.ts"]
    end

    subgraph Security["security"]
        jwt["jwt.ts"]
    end

    subgraph Integrations["integrations"]
        core_service["core-service.ts"]
        users_service["users-service.ts"]
    end

    subgraph DB["db"]
        data_source["data-source.ts"]
        entities["entities/"]
        enums["enums/"]
    end

    main --> server
    main --> workers
    server --> data_source
    server --> Routes
    credits_routes --> credits_handlers
    credits_handlers --> credits_controllers
    credits_handlers --> tariffs_controllers
    credits_handlers --> auth_controllers
    credits_handlers --> jwt
    credits_controllers --> credits_services
    tariffs_controllers --> credits_services
    credits_services --> entities
    credits_services --> core_service
    credits_services --> users_service
    workers --> credits_services
```

**Слои и поток данных:**
| Слой | Модули | Вызывает |
|------|--------|----------|
| Entry | main, server, workers | db, routes |
| Routes | credits, docs | handlers |
| Handlers | credits | controllers, security |
| Controllers | credits, tariffs, auth | services |
| Services | credits | db/entities, integrations |
| DB | data-source, entities, enums | – |
| Integrations | core-service, users-service | Core API, Users API |
| Workers | accrual | services |

---

## 4. Core Service

```mermaid
flowchart TB
    subgraph Entry["Точка входа"]
        main["main.ts"]
        server["server.ts"]
    end

    subgraph Routes["routes"]
        accounts_routes["accounts.ts"]
        dashboard_routes["dashboard.ts"]
        docs_routes["docs.ts"]
        ws_routes["ws-accounts.ts"]
    end

    subgraph Handlers["handlers"]
        accounts_handlers["accounts.ts"]
        dashboard_handlers["dashboard.ts"]
    end

    subgraph Controllers["controllers"]
        accounts_controllers["accounts.ts"]
        dashboard_controllers["dashboard.ts"]
        auth_controllers["auth.ts"]
    end

    subgraph Services["services"]
        accounts_services["accounts.ts"]
        exchange_rates["exchange-rates.ts"]
    end

    subgraph Security["security"]
        access["access.ts"]
        jwt["jwt.ts"]
    end

    subgraph Integrations["integrations"]
        credits_service["credits-service.ts"]
        users_service["users-service.ts"]
    end

    subgraph Messaging["messaging"]
        consumer["consumer.ts"]
        publisher["publisher.ts"]
        pending_replies["pending-replies.ts"]
    end

    subgraph DB["db"]
        data_source["data-source.ts"]
        entities["entities/"]
        enums["enums/"]
    end

    subgraph WS["ws"]
        broadcast["account-operations-broadcast.ts"]
    end

    main --> server
    server --> data_source
    server --> Routes
    server --> Messaging
    accounts_routes --> accounts_handlers
    dashboard_routes --> dashboard_handlers
    ws_routes --> broadcast
    accounts_handlers --> accounts_controllers
    accounts_handlers --> Messaging
    dashboard_handlers --> dashboard_controllers
    accounts_controllers --> accounts_services
    accounts_controllers --> credits_service
    accounts_controllers --> users_service
    dashboard_controllers --> accounts_services
    dashboard_controllers --> credits_service
    dashboard_controllers --> users_service
    accounts_services --> entities
    consumer --> accounts_services
    consumer --> broadcast
```

**Слои и поток данных:**
| Слой | Модули | Вызывает |
|------|--------|----------|
| Entry | main, server | db, routes, messaging |
| Routes | accounts, dashboard, docs, ws | handlers |
| Handlers | accounts, dashboard | controllers, messaging |
| Controllers | accounts, dashboard, auth | services, integrations |
| Services | accounts, exchange-rates | db/entities |
| Messaging | consumer, publisher | services, ws |
| DB | data-source, entities, enums | – |
| Integrations | credits-service, users-service | Credits API, Users API |
| WS | broadcast | – |

---

## 5. Gateway Service

```mermaid
flowchart TB
    subgraph Entry["Точка входа"]
        main["main.ts"]
        server["server.ts"]
    end

    subgraph Config["config"]
        env["env.ts"]
    end

    subgraph Proxy["Прокси на сервисы"]
        auth_proxy["Auth"]
        users_proxy["Users"]
        credits_proxy["Credits"]
        core_proxy["Core"]
        admin_proxy["AdminSettings"]
    end

    main --> server
    server --> env
    server --> auth_proxy
    server --> users_proxy
    server --> credits_proxy
    server --> core_proxy
    server --> admin_proxy
```

**Слои и поток данных:**
| Слой | Модули | Назначение |
|------|--------|------------|
| Entry | main, server | Запуск приложения |
| Config | env | Переменные окружения |
| Proxy | http-proxy | Проксирование на auth, users, credits, core, admin-settings |

Gateway не содержит бизнес-логики – только маршрутизацию запросов на целевые сервисы.

---

## Общая схема взаимодействия слоёв (типовой сервис)

```mermaid
flowchart LR
    subgraph Client["Клиент"]
        HTTP["HTTP Request"]
    end

    subgraph Layer1["Слой 1: Маршрутизация"]
        Routes["routes"]
    end

    subgraph Layer2["Слой 2: HTTP-обработка"]
        Handlers["handlers"]
    end

    subgraph Layer3["Слой 3: Бизнес-логика"]
        Controllers["controllers"]
    end

    subgraph Layer4["Слой 4: Доменная логика"]
        Services["services"]
    end

    subgraph Layer5["Слой 5: Персистентность"]
        DB["db"]
        Integrations["integrations"]
    end

    subgraph CrossCutting["Сквозные"]
        Security["security"]
    end

    HTTP --> Routes
    Routes --> Handlers
    Handlers --> Controllers
    Handlers --> Security
    Controllers --> Services
    Controllers --> Integrations
    Services --> DB
    Services --> Integrations
```

**Правило зависимостей:** вызовы идут сверху вниз. Нижние слои не зависят от верхних.
