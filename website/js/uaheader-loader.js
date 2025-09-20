// - почему этот скрипт есть?
// - а потому-что разрабы html долбоебы.
// - импортировать файлы .html можно только через такие, ебаные, костыли.
// ----------------------------------------------------------------------
// -DZZc0rd- 14.09.2025

fetch("modules/uaheader.html")
    .then((response) => response.text())
    .then((text) => {
        document.body.innerHTML += text;
        document.head.innerHTML += "<link href='https://cdn.boxicons.com/fonts/brands/boxicons-brands.min.css' rel='stylesheet'>";
    });