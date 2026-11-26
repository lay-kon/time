/* Controla as quatro abas e mantém a aba aberta no fragmento do endereço. */

const tabButtons = [...document.querySelectorAll('[role="tab"]')];
const tabPanels = [...document.querySelectorAll('[role="tabpanel"]')];
const availableTabIds = tabButtons.map(tabButton => tabButton.dataset.p);

/** Mostra a aba indicada, atualiza os atributos acessíveis e o endereço. */
export function showTab(tabId) {
  tabButtons.forEach(tabButton => tabButton.setAttribute('aria-selected', String(tabButton.dataset.p === tabId)));
  tabPanels.forEach(tabPanel => { tabPanel.hidden = tabPanel.id !== tabId; });
  try { history.replaceState(null, '', '#' + tabId); } catch (error) { /* O endereço pode não permitir alterar o histórico. */ }
}

/** Liga os cliques das abas e restaura uma aba válida indicada no endereço. */
export function initializeTabs() {
  tabButtons.forEach(tabButton => tabButton.addEventListener('click', () => showTab(tabButton.dataset.p)));
  const getTabFromAddress = () => availableTabIds.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'aprender';
  window.addEventListener('hashchange', () => showTab(getTabFromAddress()));
  showTab(getTabFromAddress());
}
