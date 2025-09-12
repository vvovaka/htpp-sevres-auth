const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { exec } = require("child_process");

const app = express();
const FILE = "Database.json";
const ADMIN_PASSWORD_HASH = "$2a$10$ju6z.qrJSCvMpDsozDwxwOqWdbz8Wt4SCEs/v3tTOG06wAL6mHcoC"; // сюда вставь bcrypt-хэш пароля админа

const REGISTER_NICKNAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/;
const DB_UPDATE_CMD = "python script_name.py"; // Команда, которая запускается при изменениях базы данных пользователей

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

// Добавление пользователя в базу данных
async function add_user(name, password) {
  const users = readJson();
  const id = uuidv4();
  const pass_hash = await bcrypt.hash(password, 10);

  for (const user_id in users) {
    if (users[user_id].username === name) {
      return false;
    }
  }

  users[id] = {
    username: name,
    uuid: id,
    permission: {},
    password: pass_hash,
  };

  writeJson(users);
  exec(DB_UPDATE_CMD, (error) => {
    throw new Error(`Скрипт для обновления базы данных пользователей разьебалась(завершилась неудачно).\nДайте разработчику пизды(исправьте проблему в скрипте\nКоманда запуска скрипта: ${error.cmd}\nКод выхода скрипта: ${error.code}`);
  });

  return true;
}

// Сайт
app.use("/", express.static("website/"))

// API
app.post("/api/register", async (req, res) => {
  const name = req.body.name;
  const pass = req.body.password;

  if (!REGISTER_NICKNAME_REGEX.test(name)) {
    res.status(400)
      .setHeader("Context-Type", "application/text")
      .send("Имя должно быть в пределах от 3-х до 16-и символов и иметь только буквы, цифры и _");
    
    return;
  }

  if (pass.length < 3) {
    res.status(400)
      .setHeader("Context-Type", "application/text")
      .send("Пароль должен быть длиной от 3-х символов");
    
    return;
  }

  const name_is_used = await add_user(name, pass);

  if (name_is_used === false) { // add_user возвращает false только если пользователь уже существует
    res.status(400)
      .setHeader("Context-Type", "application/text")
      .send("Аккаунт с таким именем уже существует. Придумайте другое имя");

    return;
  }

  res.send("Вы зарегистрировались! Теперь вы можете заходить в игру через лаунчер");
})

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
  // const db = readJson();
  // const id = uuidv4();
  // const hashedPassword = await bcrypt.hash(req.body.password, 10);
  // db[id] = {
  //   username: req.body.username || "NewUser",
  //   uuid: id,
  //   permissions: {},
  //   password: hashedPassword
  // };
  // writeJson(db);
  add_user(req.body.username || "NewUser", req.body.password);

  res.redirect("/admin");
});


app.listen(8888, () => {
  console.log("Сайт работает на http://10.0.2.15:8888");
});
