function copyCodeBlock(event) {
  // Den Button selbst finden
  const button = event.currentTarget;
  // Das umgebende .code-block suchen (Eltern-Container)
  const codeBlockContainer = button.closest('.code-block');
  // Das <code>-Element im Container finden
  const codeElement = codeBlockContainer.querySelector('code');

  // Den reinen Text (ohne HTML-Tags) holen
  const codeToCopy = codeElement.innerText;

  // Moderne Browser-API
  navigator.clipboard.writeText(codeToCopy)
    .then(() => {
      // alert('Code kopiert!');
    })
    .catch(err => {
      console.error('Fehler beim Kopieren: ', err);
    });
}