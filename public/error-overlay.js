(function() {
  const errorOverlay = document.createElement('div');
  errorOverlay.style.position = 'fixed';
  errorOverlay.style.top = '0';
  errorOverlay.style.left = '0';
  errorOverlay.style.width = '100%';
  errorOverlay.style.height = '100%';
  errorOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  errorOverlay.style.color = 'white';
  errorOverlay.style.zIndex = '999999';
  errorOverlay.style.display = 'none';
  errorOverlay.style.overflow = 'auto';
  errorOverlay.style.padding = '20px';
  errorOverlay.style.fontFamily = 'monospace';
  errorOverlay.style.whiteSpace = 'pre-wrap';
  errorOverlay.id = 'global-error-overlay';

  const title = document.createElement('h2');
  title.textContent = 'Application Error';
  title.style.color = '#ff5555';
  errorOverlay.appendChild(title);

  const errorList = document.createElement('div');
  errorOverlay.appendChild(errorList);

  document.body.appendChild(errorOverlay);

  function showError(message, source, lineno, colno, error) {
    errorOverlay.style.display = 'block';
    const errorItem = document.createElement('div');
    errorItem.style.borderBottom = '1px solid #333';
    errorItem.style.padding = '10px 0';

    let errorText = `Error: ${message}\n`;
    if (source) errorText += `Source: ${source}:${lineno}:${colno}\n`;
    if (error && error.stack) errorText += `Stack: ${error.stack}\n`;

    errorItem.textContent = errorText;
    errorList.appendChild(errorItem);
    console.error('Global Error caught:', message, error);
  }

  window.addEventListener('error', function(event) {
    showError(event.message, event.filename, event.lineno, event.colno, event.error);
  });

  window.addEventListener('unhandledrejection', function(event) {
    showError('Unhandled Promise Rejection: ' + event.reason, null, null, null, event.reason);
  });
})();
