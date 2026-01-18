export function simplePaginateHTML(htmlContent, options = {}) {
  const {
    pageWidth = 650,
    pageHeight = 867,
    marginTop = 80,
    marginBottom = 80,
    marginLeft = 80,
    marginRight = 80,
  } = options;

  const contentWidth = pageWidth - marginLeft - marginRight;
  const contentHeight = pageHeight - marginTop - marginBottom;

  const avgCharWidth = 8;
  const lineHeight = 36;
  const charsPerLine = Math.floor(contentWidth / avgCharWidth);
  const linesPerPage = Math.floor(contentHeight / lineHeight);
  const charsPerPage = charsPerLine * linesPerPage;

  if (!htmlContent || htmlContent.trim() === '') {
    return [''];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
  const container = doc.body.firstChild;

  if (!container) {
    return [htmlContent];
  }

  const pages = [];
  let currentPageElements = [];
  let currentPageChars = 0;

  const flushPage = () => {
    if (currentPageElements.length === 0) return;
    
    const pageDiv = document.createElement('div');
    currentPageElements.forEach(el => pageDiv.appendChild(el.cloneNode(true)));
    pages.push(pageDiv.innerHTML);
    currentPageElements = [];
    currentPageChars = 0;
  };

  const processElement = (element) => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    
    const elementText = element.textContent || '';
    const elementChars = elementText.length;

    if (elementChars === 0) {
      currentPageElements.push(element.cloneNode(true));
      return;
    }

    if (elementChars > charsPerPage * 0.9 && element.children.length > 0) {
      Array.from(element.children).forEach(child => processElement(child));
      return;
    }

    if (currentPageChars + elementChars > charsPerPage && currentPageElements.length > 0) {
      flushPage();
    }

    currentPageElements.push(element.cloneNode(true));
    currentPageChars += elementChars;
  };

  const childElements = Array.from(container.children);
  
  if (childElements.length === 0 && container.textContent?.trim()) {
    return [htmlContent];
  }

  childElements.forEach(processElement);
  flushPage();

  if (pages.length === 0) {
    return [htmlContent];
  }

  return pages;
}

export function paginateHTML(htmlContent, options = {}) {
  const {
    pageWidth = 650,
    pageHeight = 867,
    marginTop = 80,
    marginBottom = 80,
    marginLeft = 80,
    marginRight = 80,
  } = options;

  if (typeof document === 'undefined') {
    return simplePaginateHTML(htmlContent, options);
  }

  const contentWidth = pageWidth - marginLeft - marginRight;
  const contentHeight = pageHeight - marginTop - marginBottom;

  const measureContainer = document.createElement('div');
  measureContainer.style.cssText = `
    position: absolute;
    visibility: hidden;
    width: ${contentWidth}px;
    padding: 0;
    margin: 0;
    font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    font-size: 18px;
    line-height: 2;
    letter-spacing: 0.01em;
  `;
  measureContainer.innerHTML = htmlContent;
  document.body.appendChild(measureContainer);

  const pages = [];
  const elements = Array.from(measureContainer.children);

  if (elements.length === 0) {
    document.body.removeChild(measureContainer);
    return simplePaginateHTML(htmlContent, options);
  }

  let currentPage = [];
  let currentHeight = 0;

  const measureElement = document.createElement('div');
  measureElement.style.cssText = measureContainer.style.cssText;
  document.body.appendChild(measureElement);

  const flushPage = () => {
    if (currentPage.length === 0) return;
    
    const pageContainer = document.createElement('div');
    currentPage.forEach(el => pageContainer.appendChild(el.cloneNode(true)));
    pages.push(pageContainer.innerHTML);
    currentPage = [];
    currentHeight = 0;
  };

  elements.forEach(element => {
    measureElement.innerHTML = '';
    measureElement.appendChild(element.cloneNode(true));
    const elementHeight = measureElement.offsetHeight;

    if (currentHeight + elementHeight > contentHeight && currentPage.length > 0) {
      flushPage();
    }

    currentPage.push(element);
    currentHeight += elementHeight;
  });

  flushPage();

  document.body.removeChild(measureContainer);
  document.body.removeChild(measureElement);

  if (pages.length === 0) {
    return [''];
  }

  return pages;
}