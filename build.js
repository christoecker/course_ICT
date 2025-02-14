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




function buildSelfstudyOverview(courseData) {
  // Basis-HTML für das Accordion
  let html = `<div class="accordion" id="accordionSelfstudy">`;

  courseData.chapters.forEach((chapter, index) => {
    // Eindeutige IDs für das Accordion
    const headingId = `heading-${chapter.id}`;
    const collapseId = `collapse-${chapter.id}`;
    const chapterFilename = `${chapter.id}_selfstudy.html`;

    // Subchapters auflisten
    // (Du kannst hier verlinken zu Einzelseiten oder detail.html etc.)
    let subHtml = '';
    if (chapter.subchapters && chapter.subchapters.length > 0) {
      subHtml += '<ul class="list-group">';
      chapter.subchapters.forEach(sub => {
        // Query-Parameter: ?sub=unterX
        // So weiß die Zielseite, welches Unterkapitel gemeint ist
        const link = `${chapterFilename}?ch=${chapter.id}&sub=${sub.id}&step=1`;

        subHtml += `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            ${sub.title}
            <button class="btn btn-dark btn-sm" onclick="location.href='${link}'">
              Jetzt starten
            </button>
          </li>
        `;
      });
      subHtml += '</ul>';
    } else {
      subHtml = '<p>Keine Unterkapitel vorhanden.</p>';
    }

    // Accordion-Item pro Kapitel
    html += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="${headingId}">
          <button class="accordion-button collapsed" 
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#${collapseId}"
                  aria-expanded="false"
                  aria-controls="${collapseId}">
            <strong>${chapter.title}</strong>
          </button>
        </h2>
        <div id="${collapseId}" 
             class="accordion-collapse collapse"
             aria-labelledby="${headingId}"
             data-bs-parent="#accordionSelfstudy">
          <div class="accordion-body">
            ${subHtml}
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>'; // Ende accordion
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
    <button class="btn btn-sm btn-outline-secondary" onclick="location.href='seminar.html'">
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



// SEITEN FÜR SELFSTUDY BEREICH ERZEUGEN
function buildSelfstudyChapterPage(chapter, template) {
  // 1) Template klonen
  let page = template;

  // 2) TITLE & NAV-BUTTON setzen
  page = replacePlaceholder(page, "<!-- #TITLE -->", `Selbststudium – ${chapter.title}`);

  const navButtonHtml = `
    <button class="btn btn-sm btn-outline-secondary" onclick="location.href='selfstudy.html'">
      Zurück zur Übersicht
    </button>
  `;
  page = replacePlaceholder(page, "<!-- #NAV_BUTTON -->", navButtonHtml);

  // HTML für die Progress-Bar
  const progressBarHtml = `
    <hr class="m-0" />
    <div class="progress" style="height: 5px;">
      <div id="studyProgress" class="progress-bar CDcolor" style="width: 0%;"></div>
    </div>
  `;
  page = replacePlaceholder(page, "<!-- #PROGRESS_BAR -->", progressBarHtml);

  // 3) Abschnitte-Layout einbetten
  //    Hier definieren wir u.a. "kapId" und "subId", damit wir "ch01_sec02.md" laden können
  //    und daraus schrittweise Inhalt anzeigen.
  const contentHtml = `
    <div class="container mt-4">
      <h2>${chapter.title}</h2>
      <div id="content-area"></div>

      <div class="d-flex justify-content-center align-items-center gap-3 mt-4">
        <button id="btnPrev" class="btn btn-sm btn-secondary">Zurück</button>
        <span id="stepIndicator">2/5</span>
        <button id="btnNext" class="btn btn-sm btn-secondary" disabled>Weiter</button>
        <button id="btnFinish" class="btn btn-sm btn-secondary d-none">Zur Übersicht</button>
      </div>
    </div>

    <script>
      document.addEventListener('DOMContentLoaded', () => {
        // Query-Parameter holen, z.B. "?kap=ch01&sub=sec02&step=2"
        const params = new URLSearchParams(window.location.search);
        const kapId = params.get('kap') || '${chapter.id}'; // e.g. "ch01"
        const subId = params.get('sub');                    // e.g. "sec02"
        
        // Standard schritt
        let currentStep = parseInt(params.get('step') || '1', 10);
        if (isNaN(currentStep)) currentStep = 1;

        // Pfad zur MD-Datei, z.B. "../content/ch01_sec02.md"
        // (Achte darauf, dass von der fertigen HTML aus das "../content" korrekt ist)
        const mdFilePath = '../content/' + kapId + '_' + subId + '.md';

        let sections = [];  // Hier speichern wir den Inhalt je Abschnitt
        let maxSteps = 1;

        const btnPrev = document.getElementById('btnPrev');
        const btnNext = document.getElementById('btnNext');
        const contentArea = document.getElementById('content-area');

        // 1) Prüfen, ob subId vorhanden ist
        if (!subId) {
          contentArea.innerHTML = '<p>Bitte wähle ein Unterkapitel.</p>';
          // Du könntest hier ggf. einen redirect zurück in die Übersicht machen
          return;
        }

        // 2) Markdown-Datei laden
        fetch(mdFilePath)
          .then(resp => {
            if (!resp.ok) {
              throw new Error('Fehler beim Laden von ' + mdFilePath);
            }
            return resp.text();
          })
          .then(mdText => {
            // Abschnitte extrahieren
            sections = splitMarkdownIntoSections(mdText);
            maxSteps = sections.length;

            // Entsprechenden Abschnitt anzeigen
            showStep(currentStep);
          })
          .catch(err => {
            console.error(err);
            contentArea.innerHTML = '<p>Fehler beim Laden des Inhalts.</p>';
          });

        // 3) Buttons
        btnPrev.addEventListener('click', () => {
          if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
          }
        });
        btnNext.addEventListener('click', () => {
          if (currentStep < maxSteps) {
            // Hier ggf. prüfen, ob Aufgabe gelöst wurde
            currentStep++;
            showStep(currentStep);
          }
        });
        btnFinish.addEventListener('click', () => {
          location.href = 'selfstudy.html'; 
        });

        let exerciseDone = []; // true/false pro Abschnitt
        for (let i = 0; i < maxSteps; i++) { exerciseDone[i] = false; }

        // Anzeige-Funktion
        function showStep(step) {
          // Clamp Step
          if (step < 1) step = 1;
          if (step > sections.length) step = sections.length;

          currentStep = step; // z.B. globale Variable
          const mdText = sections[step - 1] || "Kein Inhalt für diesen Abschnitt.";

          

          // 1) Markdown parsen und in #content-area einfügen
          const html = marked.parse(mdText);
          const contentArea = document.getElementById("content-area");
          contentArea.innerHTML = html;

          // 2) Prev/Next/Finish Buttons
          const btnPrev = document.getElementById("btnPrev");
          const btnNext = document.getElementById("btnNext");
          const btnFinish = document.getElementById("btnFinish");

          // Prev-Button nur disabled, wenn step=1
          btnPrev.disabled = (step === 1);

          // Bestimmen, ob das der letzte Schritt ist
          const isLastStep = (step === maxSteps);

          if (step < maxSteps) {
            // Normale Abschnitte
            btnNext.classList.remove('d-none');   // „Weiter“ zeigen
            btnFinish.classList.add('d-none');    // „Zurück zur Übersicht“ verstecken
          } else {
            // Letzter Abschnitt => Alle Abschnitte fertig
            btnNext.classList.add('d-none');      // „Weiter“ ausblenden
            btnFinish.classList.remove('d-none'); // „Zurück zur Übersicht“ zeigen
          }

          // (4) Falls exerciseDone[step-1] = true => Step „erledigt“
          //     Sonst => Step offen
          updateStepUI(step, isLastStep);

          // Übungen
          const exercise = contentArea.querySelector(".exercise");

          if (exercise) {
            // Welcher Typ?
            const type = exercise.dataset.type; // z.B. "mc", "simpleCheck"
            switch(type) {
              case "mc-question":                     // multiple choice
                setupMultipleChoice(exercise, step);
                break;
              case "sort-code":
                setupSortCode(exercise, step);
                break;
              case "simpleCheck":
                setupSimpleCheck(exercise, step);
                break;
              default:
                console.warn("Unbekannter Aufgabentyp:", type);
                // Evtl. setExerciseDone(step, true) bei unbekannt
                break;
            }
          } else {
            // Keine Übung => set done if you want
            setExerciseDone(step, true);
          }
          
          

          // 5) Checkbox-Logik => Falls eine CheckBox (class="exerciseCheck") existiert
          //    muss sie gecheckt werden, damit Step "fertig" ist => Button freischalten, Balken füllen
          const checkbox = contentArea.querySelector(".exerciseCheck");
          if (checkbox) {
            // Check initial
            // => wenn user schonmal angehakt hat + refresht => wir gucken in exerciseDone
            // => Falls exerciseDone[step-1] ist true, UI ist schon done. 
            // Sonst -> Warten auf Klick

            checkbox.addEventListener("change", e => {
              setExerciseDone(step, e.target.checked);
            });
          } else {
            // Keine Aufgabe => auto-lösen
            // setExerciseDone(step, true);
          }

           // Step-Indikator
          const stepIndicator = document.getElementById("stepIndicator");
          if (stepIndicator) {
            stepIndicator.textContent = step + "/" + maxSteps;
          }

          // URL aktualisieren (optional)
          history.replaceState({}, "", "?step=" + step);
        }

        let stepIsDone = [];

        function setExerciseDone(step, solved) {
          exerciseDone[step - 1] = solved;
          const isLastStep = (step === maxSteps);
          updateStepUI(step, isLastStep);
        }

        function setupSimpleCheck(exerciseElem, step) {
          // Suche die Checkbox in diesem Element
          const checkbox = exerciseElem.querySelector(".exerciseCheck");

          // Falls keine Checkbox vorhanden, markieren wir den Abschnitt ggf. sofort als erledigt
          if (!checkbox) {
            setExerciseDone(step, true);
            return;
          }

          // Beim ersten Laden prüfen wir den aktuellen Status
          if (checkbox.checked) {
            setExerciseDone(step, true);
          } else {
            setExerciseDone(step, false);
          }

          // Jetzt registrieren wir den Event-Listener
          checkbox.addEventListener("change", (e) => {
            if (e.target.checked) {
              // Aufgabe (Abschnitt) als gelöst markieren
              setExerciseDone(step, true);
            } else {
              // wieder abgehakt -> Abschnitt "nicht gelöst"
              setExerciseDone(step, false);
            }
          });
        }

        function setupMultipleChoice(questionElem, step) {
          const correctAnswers = questionElem.dataset.correct.split(","); 
          // z.B. ["2","3"]

          const options = questionElem.querySelectorAll(".mc-option");
          const checkBtn = questionElem.querySelector(".exercise-check");
          const showSolBtn = questionElem.querySelector(".exercise-show-solution");
          const feedback = questionElem.querySelector(".exercise-feedback");

          // Falls kein Check-Button vorhanden, abbrechen
          if (!checkBtn) return;

          // "Zeige Lösung" - Button ggf. verstecken
          if (showSolBtn) { showSolBtn.classList.add("d-none"); } 

          // Beim Klick auf „Check“
          checkBtn.addEventListener("click", () => {
            // 1) Sammle alle angekreuzten Werte
            let selectedValues = [];
            options.forEach(opt => {
              if (opt.checked) {
                selectedValues.push(opt.value);
              }
            });
            // 2) Prüfen, ob selectedValues === correctAnswers
            // => "alle richtigen, keine falschen"
            // => Man kann sortieren + compare
            selectedValues.sort();
            correctAnswers.sort();

            const isCorrect = (JSON.stringify(selectedValues) === JSON.stringify(correctAnswers));

            if (isCorrect) {
              feedback.style.color = "black";
              feedback.textContent = "Richtig gelöst!";
              checkBtn.disabled = true;

              // => Hier: setExerciseDone(step, true), um den Abschnitt "fertig" zu markieren
              setExerciseDone(step, true);
              if (showSolBtn) { showSolBtn.classList.add("d-none"); } // Lösung braucht man nicht mehr
            } else {
              feedback.style.color = "red";
              feedback.textContent = "Leider noch falsch, bitte nochmal prüfen.";
              // => step bleibt undone
              setExerciseDone(step, false);
              if (showSolBtn) { showSolBtn.classList.remove("d-none"); }    // Lösungen-Button einblenden
            }
          });

          // 4) Event-Listener auf "Zeige Lösung"
          if (showSolBtn) {
            showSolBtn.addEventListener("click", () => {
              // Markiere die richtigen Checkboxen
              // Und/oder zeige Text, was richtig ist
              options.forEach(opt => {
                if (correctAnswers.includes(opt.value)) {
                  // Kennzeichne z.B. in grüner Farbe
                  // opt.parentNode.style.color = "green"; 
                  opt.checked = true; // Optional: schon mal korrekt anhaken
                } else {
                  // Falsche Antworten in grauer Farbe
                  opt.parentNode.style.color = "#666"; 
                  opt.checked = false;
                }
                // Danach soll man nichts mehr anklicken können
                opt.disabled = true;
              });

              checkBtn.disabled = true;             // Check-Button deaktivieren
              showSolBtn.classList.add("d-none");   // Zeige-Lösung-Button verstecken
              // Feedback
              feedback.style.color = "gray";
              feedback.textContent = "Dies ist die korrekte Lösung.";

              setExerciseDone(step, true);
            });
          }
        }


        // ============================= SORT CODE ==============================
        function setupSortCode(exerciseElem, step) {
          const list = exerciseElem.querySelector(".code-lines");
          let lines = Array.from(list.querySelectorAll(".code-line"));
          const checkBtn = exerciseElem.querySelector(".sort-check");
          const feedback = exerciseElem.querySelector(".sort-feedback");

          shuffleArray(lines);    // Zeilen durchschütteln

          // Leere das UL & füge die gemischten Li-Elemente wieder ein
          list.innerHTML = ""; 
          // Füge Drag-Events hinzu
          lines.forEach(line => {
            list.appendChild(line);
            line.addEventListener("dragstart", handleDragStart);
            line.addEventListener("dragover", handleDragOver);
            line.addEventListener("drop", handleDrop);
            line.addEventListener("dragend", handleDragEnd);
          });

          // 2) "Check"-Button
          checkBtn.addEventListener("click", () => {
            const correct = checkOrder(list);
            if (correct) {
              feedback.style.color = "black";
              feedback.textContent = "Richtig gelöst!";
              checkBtn.disabled = true;
              setExerciseDone(step, true);
            } else {
              feedback.style.color = "red";
              feedback.textContent = "Noch nicht korrekt, bitte erneut sortieren.";
              setExerciseDone(step, false);
            }
          });

          // Fisher-Yates-Shuffle (klassische Implementierung)
          function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
              const randIndex = Math.floor(Math.random() * (i + 1));
              [array[i], array[randIndex]] = [array[randIndex], array[i]];
            }
          }

          // Hilfsvariablen / -funktionen
          let draggedItem = null;

          function handleDragStart(e) {
            // Aktuelles Element merken
            draggedItem = this; 
            // Evtl. Stil-Anpassung
            e.dataTransfer.effectAllowed = "move";
            // e.dataTransfer.setData(...) => wenn du Identifikatoren setzen willst
          }

          function handleDragOver(e) {
            // Damit "drop" funktioniert
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }

          function handleDrop(e) {
            e.preventDefault();
            if (draggedItem !== this) {
              const targetLine = this;
              const parent = targetLine.parentNode;

              // Bounding-Box des Targets
              const bounding = targetLine.getBoundingClientRect();
              const middle = bounding.y + bounding.height / 2;

              // Wo liegt der Mauszeiger?
              if (e.clientY > middle) {
                // Nach targetLine einfügen
                parent.insertBefore(draggedItem, targetLine.nextSibling);
              } else {
                // Vor targetLine
                parent.insertBefore(draggedItem, targetLine);
              }
            }
          }

          function handleDragEnd(e) {
            draggedItem = null;
          }

          function checkOrder(ul) {
            const currentLines = ul.querySelectorAll(".code-line");
            let orderExpected = 1;
            for (let li of currentLines) {
              const realOrder = parseInt(li.dataset.order, 10);
              if (realOrder !== orderExpected) {
                return false;
              }
              orderExpected++;
            }
            return true;
          }
        }
        // ========================= ENDE SORT CODE =============================


        function markStepAsDone(step) {
          stepIsDone[step - 1] = true;
          updateProgressBar();
        }
        function unmarkStep(step) {
          stepIsDone[step - 1] = false;
          updateProgressBar();
        }

        function updateStepUI(step, isLastStep) {
          const btnNext = document.getElementById("btnNext");
          const btnFinish = document.getElementById("btnFinish");

          if (isLastStep) {
            // Wir verstecken btnNext, zeigen btnFinish
            btnNext.style.display = "none";
            btnFinish.style.display = "";
          } else {
            btnNext.style.display = "";
            btnFinish.style.display = "none";
          }

          // Falls der Abschnitt gelöst = exerciseDone[step-1] => enable Button, markStepAsDone
          if (exerciseDone[step-1]) {
            if (isLastStep) {
              btnFinish.disabled = false;
            } else {
              btnNext.disabled = false;
            }
            markStepAsDone(step);
          } else {
            // Noch nicht gelöst => Step undone
            if (isLastStep) {
              btnFinish.disabled = true;
            } else {
              btnNext.disabled = true;
            }
            unmarkStep(step);
          }
        }


        function updateProgressBar(current, total) {
           // Wie viele Steps sind done?
          let doneCount = stepIsDone.filter(Boolean).length;
          const percent = (doneCount / maxSteps) * 100;
          const progressBar = document.getElementById("studyProgress");
          if (progressBar) { progressBar.style.width = percent + "%"; }
        }
      });

      // Teilt die Markdown-Datei an den Markern ===SECTION===
     
      function splitMarkdownIntoSections(mdText) {
        return mdText
          // An jeder Zeile, die nur aus ===SECTION=== besteht, splitten wir
          // Der Regex /^===SECTION===/m passt auf "===SECTION===" am Zeilenanfang
          .split(/^===SECTION===/m)
          // Dann trimmen wir Leerzeichen
          .map(part => part.trim())
          // und filtern leere Parts heraus
          .filter(part => part.length > 0);
      }
    </script>
  `;

  // 4) Platzhalter ersetzen
  page = replacePlaceholder(page, "<!-- #CONTENT -->", contentHtml);

  // 5) Fertige Seite zurück
  return page;
}

courseData.chapters.forEach((chapter) => {
  // Dateiname, z.B. "kapitel1_selfstudy.html"
  const filename = `${chapter.id}_selfstudy.html`;

  // Inhalt erzeugen
  const outputHtml = buildSelfstudyChapterPage(chapter, template);

  // Schreiben in dist
  fs.writeFileSync(path.join(__dirname, 'dist', filename), outputHtml);
  console.log(`Erzeugt: ${filename}`);
});


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
    const overviewHTML = buildSelfstudyOverview(courseData);
  
    // 2) Ersetze in selfstudyContent den #CHAPTER_OVERVIEW
    //    Falls dein selfstudyContent selbst den Platzhalter hat
    let finalContent = selfstudyContent.replace('<!-- #CHAPTER_OVERVIEW -->', overviewHTML);
  
    // 3) Füge finalContent in das Template
    outputSelfstudy = replacePlaceholder(outputSelfstudy, '<!-- #CONTENT -->', finalContent);
  
    // Speichern
    fs.writeFileSync(path.join(__dirname, 'dist', 'selfstudy.html'), outputSelfstudy);
  }

console.log('index.html, seminar.html und selfstudy.html wurden erstellt!');
