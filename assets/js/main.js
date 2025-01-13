// Globale Variable, um die geladene Kursstruktur zu speichern (optional)
let courseData = null;

window.addEventListener("DOMContentLoaded", () => {
  // Sobald das DOM geladen ist, laden wir die JSON-Datei
  fetchCourseStructure();
});

function fetchCourseStructure() {
  fetch("data/course-structure.json")
    .then((response) => response.json())
    .then((data) => {
      courseData = data;
      console.log("Kursstruktur erfolgreich geladen:", courseData);

      // Navigation aufbauen
      buildNavigation(courseData);
    })
    .catch((error) => {
      console.error("Fehler beim Laden der Kursstruktur:", error);
    });
}


function buildNavigation(courseData) {
    // Suche dir ein Element in index.html, wo die Navigation rein soll
    // Z.B. eine <ul> in der Navbar oder ein <div id="nav-placeholder">
    // In diesem Beispiel gehen wir davon aus, dass du eine <div id="nav-placeholder"> in index.html hast
    const navPlaceholder = document.getElementById("nav-placeholder");
    if (!navPlaceholder) return;
  
    // Leere das Element erstmal
    navPlaceholder.innerHTML = "";
  
    // Erstelle z.B. eine ungeordnete Liste
    const ul = document.createElement("ul");
    ul.classList.add("list-group");
  
    // Durch alle Kapitel iterieren
    courseData.chapters.forEach((chapter) => {
      // Ein Listeneintrag pro Kapitel
      const li = document.createElement("li");
      li.classList.add("list-group-item");
  
      // Kapitel-Titel anzeigen
      const chapterTitle = document.createElement("h5");
      chapterTitle.textContent = chapter.title;
      li.appendChild(chapterTitle);
  
      // Unterkapitel (falls vorhanden) auflisten
      if (chapter.subchapters && chapter.subchapters.length > 0) {
        const subUl = document.createElement("ul");
        subUl.classList.add("list-group", "mt-2");
        chapter.subchapters.forEach((subchapter) => {
          const subLi = document.createElement("li");
          subLi.classList.add("list-group-item");
  
          // Klickevent, um später den Inhalt anzuzeigen
          subLi.textContent = subchapter.title;
          subLi.addEventListener("click", () => {
            // Hier könnte man dann die Inhalte der Subkapitel anzeigen
            displaySubchapterContent(subchapter);
          });
  
          subUl.appendChild(subLi);
        });
        li.appendChild(subUl);
      }
  
      ul.appendChild(li);
    });
  
    navPlaceholder.appendChild(ul);
  }



  function displaySubchapterContent(subchapter) {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;
  
    // Beispielhaft: Wir leeren alles und füllen nur diesen Subkapitel-Inhalt
    mainContent.innerHTML = `
      <h2>${subchapter.title}</h2>
      <p>Hier können wir z.B. Bausteine, Texte, Übungen etc. anzeigen.</p>
    `;
  
    // Falls du Bausteine dynamisch auflisten möchtest:
    if (subchapter.blocks && subchapter.blocks.length > 0) {
      subchapter.blocks.forEach((block) => {
        // Hier könnte man weitere DOM-Elemente erzeugen
        const blockDiv = document.createElement("div");
        blockDiv.classList.add("mb-3");
        blockDiv.innerHTML = `
          <h4>${block.title}</h4>
          <p>${block.description || ""}</p>
        `;
        mainContent.appendChild(blockDiv);
      });
    }
  }