===SECTION===
# Abschnitt 1 – Multiple-Choice

Dies ist ein Beispiel für eine Multiple-Choice-Frage.

<!-- Die ganze Übung in einem Container, z.B. .mc-question -->
<div class="exercise mc-box p-3" data-type="mc-question" data-correct="2,3">
  <p>Welche Aussagen sind richtig?</p>

  <!-- Liste von Möglichkeiten -->
  <div class="mb-2">
    <input type="checkbox" class="mc-option" value="1" /> Aussage 1
  </div>
  <div class="mb-2">
    <input type="checkbox" class="mc-option" value="2" /> Aussage 2
  </div>
  <div class="mb-2">
    <input type="checkbox" class="mc-option" value="3" /> Aussage 3
  </div>
  <div class="mb-2">
    <input type="checkbox" class="mc-option" value="4" /> Aussage 4
  </div>

  <div class="d-flex justify-content-left mt-3">
    <div class="me-2">
      <!-- Check-Button -->
      <button class="exercise-check btn btn-sm btn-lernhub me-2">Check</button>
      <!-- Der "Zeige Lösung" Button, erstmal unsichtbar -->
      <button class="exercise-show-solution btn btn-sm btn-lernhub d-none">Zeige Lösung</button>
    </div>
    <!-- Feedback-Anzeige -->
    <div class="exercise-feedback mt-2" style="color: red; margin-top: 0.5rem;"></div>
  </div>

  
</div>

===SECTION===
# Abschnitt 2 – Vertiefung

Zweiter Teil mit weiteren Informationen...

<div class="exercise mc-box p-3" data-type="sort-code">
  <p>Bringe die Zeilen in richtige Reihenfolge:</p>
  
  <ul class="code-lines" id="sortableList" style="list-style:none; padding: 0;">
    <li class="code-line" data-order="1" draggable="true"> IF Start = TRUE THEN </li>
    <li class="code-line" data-order="2" draggable="true">    Motor := TRUE; 
    TimerStart();</li>
    <li class="code-line" data-order="3" draggable="true"> END_IF; </li>
  </ul>

  <div class="d-flex justify-content-left mt-3">
    <button class="sort-check btn btn-sm btn-lernhub me-2">Check</button>
     <div class="sort-feedback mt-2" style="color:red;"></div>
  </div>
</div>

===SECTION===
# Abschnitt 3 – Abschluss

Fazit, Zusammenfassung usw.

**Aufgabe**: <div class="exercise" data-type="simpleCheck">
  <p>Bitte kreuze diese Checkbox an.</p>
  <input type="checkbox" class="exerciseCheck" />
</div>
