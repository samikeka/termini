
# 🧩 Plan i Detajuar për Integrimin e Liquibase me MySQL në Spring Boot

## 🎯 Qëllimi
Të integrohet **Liquibase** me një projekt **Spring Boot** që përdor **MySQL**, në mënyrë që ndryshimet në strukturën e databazës të menaxhohen automatikisht përmes changelog-ve.

---

## 🏗️ Struktura e Projektit

```
src/
 ├─ main/
 │   ├─ java/... (kodet e aplikacionit)
 │   ├─ resources/
 │   │   ├─ application.properties
 │   │   └─ db/
 │   │       └─ changelog/
 │   │           ├─ db.changelog-master.yml
 │   │           ├─ 001-init-schema.yml
 │   │           ├─ 002-add-student-table.yml
 │   │           └─ 003-insert-sample-data.yml
 ├─ pom.xml
```

---

## ⚙️ 1. Konfigurimi i `application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/springboot_db
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yml
spring.liquibase.enabled=true
```

---

## 📘 2. Krijimi i `db.changelog-master.yml`

Ky është changelog kryesor që përfshin të gjithë changelog-ët e tjerë:

```yaml
databaseChangeLog:
  - include:
      file: db/changelog/001-init-schema.yml
  - include:
      file: db/changelog/002-add-student-table.yml
  - include:
      file: db/changelog/003-insert-sample-data.yml
```

---

## 🧩 3. Krijimi i Changelog-ve të Veçantë

### `001-init-schema.yml`
```yaml
databaseChangeLog:
  - changeSet:
      id: 1
      author: sami
      changes:
        - createTable:
            tableName: users
            columns:
              - column:
                  name: id
                  type: BIGINT AUTO_INCREMENT
                  constraints:
                    primaryKey: true
              - column:
                  name: username
                  type: VARCHAR(255)
              - column:
                  name: password
                  type: VARCHAR(255)
```

### `002-add-student-table.yml`
```yaml
databaseChangeLog:
  - changeSet:
      id: 2
      author: sami
      changes:
        - createTable:
            tableName: student
            columns:
              - column:
                  name: id
                  type: BIGINT AUTO_INCREMENT
                  constraints:
                    primaryKey: true
              - column:
                  name: name
                  type: VARCHAR(255)
              - column:
                  name: age
                  type: INT
```

### `003-insert-sample-data.yml`
```yaml
databaseChangeLog:
  - changeSet:
      id: 3
      author: sami
      changes:
        - insert:
            tableName: student
            columns:
              - column:
                  name: name
                  value: "Isli"
              - column:
                  name: age
                  valueNumeric: 8
```

---

## 🚀 4. Komandat Kryesore të Liquibase (opsionale për CLI)

```bash
# Gjeneron changelog bazuar në databazën ekzistuese
liquibase generateChangeLog --url="jdbc:mysql://localhost:3306/springboot_db" --username=root --password=yourpassword --changeLogFile=generated.yml

# Kontrollon statusin e migrimeve
liquibase status --verbose

# Ekzekuton migrimet
liquibase update

# Kthen mbrapsht një changelog
liquibase rollbackCount 1
```

---

## 🧠 5. Këshilla të Rëndësishme

- Mos ndrysho changelog-et ekzistuese pas ekzekutimit të tyre — krijo changelog të ri.
- Përdor `id` unike për çdo `changeSet`.
- Kontrollo log-et e Liquibase në startup për të verifikuar ekzekutimin.
- Nëse MySQL nuk lidhet, kontrollo `url` dhe `driver`.

---

## ✅ 6. Testim
- Pas run të projektit (`mvn spring-boot:run`), Liquibase do të krijojë tabelat automatikisht.
- Verifiko në MySQL:
  ```sql
  SHOW TABLES;
  SELECT * FROM DATABASECHANGELOG;
  ```

Kjo tabelë ruan historikun e çdo changelog të zbatuar.

---

## 📁 7. Përmbledhje e Fajlave Kryesorë

| File | Përshkrimi |
|------|-------------|
| `db.changelog-master.yml` | Fajli që përfshin të gjithë changelog-ët |
| `001-init-schema.yml` | Krijimi i tabelës bazë `users` |
| `002-add-student-table.yml` | Krijimi i tabelës `student` |
| `003-insert-sample-data.yml` | Futja e të dhënave fillestare |
| `application.properties` | Konfigurimi i databazës dhe Liquibase |

---

## 🏁 8. Rezultati Final
- Çdo herë që aplikacioni starton, Liquibase kontrollon changelog-et.
- Nëse ka të reja, i aplikon automatikisht në MySQL.
- Struktura e databazës është gjithmonë e sinkronizuar me kodin burimor.

---

**Autori:** Sami  
**Datë:** 9 Tetor 2025  
**Databazë:** MySQL  
**Framework:** Spring Boot  
**Mjet Migrimi:** Liquibase  
