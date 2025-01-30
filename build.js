const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// 1) JSON laden
const courseData = require('./data/course-structure.json');

// Haupttemplate lesen
const templatePath = path.join(__dirname, 'src', 'template.html');
const template = fs.readFileSync(templatePath, 'utf8');

// Button-Schnipsel
const navButtonSeminar = `
  <button class="btn btn-sm btn-outline-secondary" onclick="location.href='seminar.html'">
    Seminar
  </button>
`;
const navButtonStudy = `
  <button class="btn btn-sm btn-outline-secondary" onclick="location.href='selfstudy.html'">
    Study
  </button>
`;

// Ordner dist anlegen (falls nicht vorhanden)
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// 2) buildChapterOverview importieren/definieren
function buildChapterOverview(courseData, showSubchapters) {
  let html = '<ul class="list-group">';
  courseData.chapters.forEach(chapter => {
    html += `
      <li class="list-group-item">
        <strong>${chapter.title}</strong>
    `;
    if (showSubchapters && chapter.subchapters) {
      html += '<ul class="list-group mt-2">';
      chapter.subchapters.forEach(sub => {
        html += `<li class="list-group-item">${sub.title}</li>`;
      });
      html += '</ul>';
    }
    html += '</li>';
  });
  html += '</ul>';
  return html;
}


function buildSeminarOverviewAsCards(courseData) {
  // Bootstrap Grid Layout
  let html = `<div class="row row-cols-1 row-cols-md-2 g-4">`;

  courseData.chapters.forEach((chapter) => {
    const imgTag = chapter.imageUrl
      ? `<img src="${chapter.imageUrl}" class="card-img-top" alt="Bild zu ${chapter.title}" />`
      : '';  // Falls kein imageUrl angegeben ist, zeig kein Bild

    html += `
      <div class="col">
        <div class="card h-100">
          ${imgTag}
          <div class="card-body">
            <h5 class="card-title">${chapter.title}</h5>
            <p class="card-text">
              ${chapter.description || ""}
            </p>

            <!-- Button oder Link, um später zum Detail zu kommen -->
            <button class="btn btn-sm btn-light">
              zum Kapitel
            </button>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`; // Ende row
  return html;
}



// Hilfsfunktionen
function readFile(filePath) {
  return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
}
function replacePlaceholder(templateStr, placeholder, contentStr) {
  return templateStr.replace(placeholder, contentStr);
}


// 1) Einzelseite pro Kapitel generieren
function buildSeminarChapterPage(chapter) {
  let page = template;
  // Titel anpassen
  page = replacePlaceholder(page, '<!-- #TITLE -->', `Seminar – ${chapter.title}`);
  // Navbar-Button: "Zurück zur Übersicht" einbauen
  const navButtonHtml = `
    <button class="btn btn-sm btn-outline-secondary" onclick="location.href='seminar.html'">
      Zurück zur Übersicht
    </button>
  `;
  page = replacePlaceholder(page, '<!-- #NAV_BUTTON -->', navButtonHtml);
  // Navbar-Header etc. weglassen oder anpassen
  page = replacePlaceholder(page, '<!-- #HEADER -->', '');

  // Markdown laden und in HTML umwandeln
  let mdContent = '';
  if (chapter.seminarMarkdown) {
    // Pfad zusammenbauen
    const mdPath = path.join(__dirname, chapter.seminarMarkdown);
    mdContent = fs.readFileSync(mdPath, 'utf8');
  }

  // Markdown -> HTML
  const seminarContentHtml = marked(mdContent);

  // Fertiger Inhalt für das Kapitel
  const contentHtml = `
    <h2>${chapter.title}</h2>
    ${seminarContentHtml}
    <button class="btn btn-outline-success mt-3" onclick="location.href='seminar.html'">
      Zurück zur Übersicht
    </button>
  `;

  // In Template einfügen
  page = replacePlaceholder(page, '<!-- #CONTENT -->', contentHtml);
  return page;
}


// 2) Schleife über alle Kapitel
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'dist'));
}

courseData.chapters.forEach((chapter) => {
  const outputHtml = buildSeminarChapterPage(chapter);
  // Dateiname z.B.: kapitel1_seminar.html
  const filename = `${chapter.id}_seminar.html`;
  fs.writeFileSync(path.join(__dirname, 'dist', filename), outputHtml);
  console.log(`Erzeugt: ${filename}`);
});


// 3) Seminar-Hauptseite (seminar.html) bauen, die auf die Einzelseiten verlinkt
function buildSeminarOverviewAsCards(courseData) {
  let html = `<div class="row row-cols-1 row-cols-md-2 g-4">`;
  courseData.chapters.forEach((chapter) => {
    const chapterFileName = `${chapter.id}_seminar.html`; // -> kapitel1_seminar.html

    const imageTag = chapter.imageUrl
      ? `<img src="${chapter.imageUrl}" class="card-img-top" alt="Bild zu ${chapter.title}" />`
      : '';

    html += `
      <div class="col">
        <div class="card h-100">
          ${imageTag}
          <div class="card-body">
            <h5 class="card-title">${chapter.title}</h5>
            <p class="card-text">${chapter.description || ""}</p>
            <a href="${chapterFileName}" class="btn btn-primary">zum Kapitel</a>
          </div>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  return html;
}

{
  const seminarContentPath = path.join(__dirname, 'src', 'seminar.content.html');
  const seminarContent = fs.readFileSync(seminarContentPath, 'utf8');

  let outputSeminar = template;
  outputSeminar = replacePlaceholder(outputSeminar, '<!-- #TITLE -->', 'Seminar – Course ICT');
  outputSeminar = replacePlaceholder(outputSeminar, '<!-- #HEADER -->', '');

  // Kapitelkacheln erzeugen
  const overviewHTML = buildSeminarOverviewAsCards(courseData);
  // In seminar.content.html den Platzhalter ersetzen
  const finalContent = seminarContent.replace('<!-- #CHAPTER_OVERVIEW -->', overviewHTML);

  outputSeminar = replacePlaceholder(outputSeminar, '<!-- #CONTENT -->', finalContent);

  fs.writeFileSync(path.join(__dirname, 'dist', 'seminar.html'), outputSeminar);
  console.log('Erzeugt: seminar.html');
}


// ------------------------------------------------
// index.html (Startseite)
// ------------------------------------------------
{
  const indexContent = readFile('src/index.content.html');
  let outputIndex = template;
  // Titel
  outputIndex = replacePlaceholder(outputIndex, '<!-- #TITLE -->', 'Startseite – Course ICT');
  // Header leer lassen
  outputIndex = replacePlaceholder(outputIndex, '<!-- #HEADER -->', '');
  outputIndex = replacePlaceholder(outputIndex, '<!-- #NAV_BUTTON -->', '');
  // Navbar-Button = Seminar
  outputIndex = replacePlaceholder(outputIndex, '<!-- #NAV_TOGGLE -->', navButtonSeminar);
  // Content
  outputIndex = replacePlaceholder(outputIndex, '<!-- #CONTENT -->', indexContent);

  fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), outputIndex);
}

// ------------------------------------------------
// seminar.html
// ------------------------------------------------
{
    const seminarContent = readFile('src/seminar.content.html');
    let outputSeminar = template;
  
    outputSeminar = replacePlaceholder(outputSeminar, '<!-- #TITLE -->', 'Seminar – Course ICT');
    outputSeminar = replacePlaceholder(outputSeminar, '<!-- #HEADER -->', '');
    outputSeminar = replacePlaceholder(outputSeminar, '<!-- #NAV_BUTTON -->', '');
    outputSeminar = replacePlaceholder(outputSeminar, '<!-- #NAV_TOGGLE -->', navButtonStudy);
  
    // Nur Kapitel, keine Unterkapitel
    const overviewHTML = buildSeminarOverviewAsCards(courseData);
  
    let finalContent = seminarContent.replace('<!-- #CHAPTER_OVERVIEW -->', overviewHTML);
  
    outputSeminar = replacePlaceholder(outputSeminar, '<!-- #CONTENT -->', finalContent);
  
    fs.writeFileSync(path.join(__dirname, 'dist', 'seminar.html'), outputSeminar);
  }

// ------------------------------------------------
// selfstudy.html
// ------------------------------------------------
{
    const selfstudyContent = readFile('src/selfstudy.content.html');
    let outputSelfstudy = template;
  
    // Platzhalter austauschen: TITLE, HEADER, BUTTON
    outputSelfstudy = replacePlaceholder(outputSelfstudy, '<!-- #TITLE -->', 'Selbststudium – Course ICT');
    outputSelfstudy = replacePlaceholder(outputSelfstudy, '<!-- #HEADER -->', '');
    outputSelfstudy = replacePlaceholder(outputSelfstudy, '<!-- #NAV_BUTTON -->', '');
    outputSelfstudy = replacePlaceholder(outputSelfstudy, '<!-- #NAV_TOGGLE -->', navButtonSeminar);
  
    // 1) Erzeuge HTML-Snippet für Kapitel + Unterkapitel
    const overviewHTML = buildChapterOverview(courseData, true);
  
    // 2) Ersetze in selfstudyContent den #CHAPTER_OVERVIEW
    //    Falls dein selfstudyContent selbst den Platzhalter hat
    let finalContent = selfstudyContent.replace('<!-- #CHAPTER_OVERVIEW -->', overviewHTML);
  
    // 3) Füge finalContent in das Template
    outputSelfstudy = replacePlaceholder(outputSelfstudy, '<!-- #CONTENT -->', finalContent);
  
    // Speichern
    fs.writeFileSync(path.join(__dirname, 'dist', 'selfstudy.html'), outputSelfstudy);
  }

console.log('index.html, seminar.html und selfstudy.html wurden erstellt!');
