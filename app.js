const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const app = express();
const FILE = "Database.json";
const ADMIN_PASSWORD_HASH = "$2a$10$ju6z.qrJSCvMpDsozDwxwOqWdbz8Wt4SCEs/v3tTOG06wAL6mHcoC"; // сюда вставь bcrypt-хэш пароля админа

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// чтение и запись JSON
function readJson() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function writeJson(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Главная
app.get("/", (req, res) => {
  res.send(`
    <h1>Главная</h1>
    <p><a href="/admin">Регистрация(password VeImPl12321)</a></p>
    <p><a href="/users">Список игроков</a></p>
  `);
});


// Список игроков
app.get("/users", (req, res) => {
  const users = readJson();
  let html = `<h1>Список игроков</h1><ul>`;
  for (const id in users) {
    html += `<li>${users[id].username}</li>`;
  }
  html += `</ul><p><a href="/">Назад</a></p>`;
  res.send(html);
});

// Админ (форма входа)
app.get("/admin", (req, res) => {
  res.send(`
    <h1>Админ</h1>
    <form method="POST" action="/admin/login">
      Пароль: <input name="password" type="password">
      <button>Войти</button>
    </form>
    <p><a href="/">Назад</a></p>
  `);
});

// Авторизация админа
app.post("/admin/login", async (req, res) => {
  const password = req.body.password;
  const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!match) return res.send("Неверный пароль");
  
  const users = readJson();
  let html = `<h1>Админ панель</h1><ul>`;

  html += `</ul>
    <h2>Добавить игрока</h2>
    <form method="POST" action="/admin/add">
      Имя: <input name="username">
      Пароль: <input name="password">
      <button>Добавить</button>
    </form>
    <p><a href="/">Главная</a></p>`;
  res.send(html);
});

// Добавление игрока через админку
app.post("/admin/add", async (req, res) => {
  const db = readJson();
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  db[id] = {
    username: req.body.username || "NewUser",
    uuid: id,
    permissions: {},
    password: hashedPassword
  };
  writeJson(db);
  res.redirect("/admin");
});


app.listen(8888, "10.0.2.15", () => {
  console.log("Сайт работает на http://10.0.2.15:3000");
});
