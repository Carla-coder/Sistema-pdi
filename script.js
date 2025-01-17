// Seleciona elementos do DOM
const form = document.getElementById("pdi-form");
const pdiContainer = document.getElementById("pdi-container");

// Recupera PDIs do Local Storage
let pdiList = [];
try {
  pdiList = JSON.parse(localStorage.getItem("pdiList")) || [];
} catch (error) {
  console.error("Erro ao carregar PDIs do Local Storage:", error);
}

// Função para salvar PDIs no Local Storage
function saveToLocalStorage() {
  localStorage.setItem("pdiList", JSON.stringify(pdiList));
}

// Função para formatar a data para o modelo brasileiro (dia/mês/ano)
function formatDateToBrazilian(dateString) {
  if (!dateString) return ""; // Retorna vazio se a data for inválida
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

// Variável para controlar o índice do PDI que está sendo editado
let currentEditIndex = null;

// Função para renderizar a lista de PDIs
function renderPDIList() {
  pdiContainer.innerHTML = "";

  if (pdiList.length === 0) {
    pdiContainer.innerHTML = "<p>Nenhum PDI cadastrado.</p>";
    return;
  }

  pdiList.forEach((pdi, index) => {
    const pdiItem = document.createElement("li");
    const startDateBR = formatDateToBrazilian(pdi.startDate);
    const endDateBR = formatDateToBrazilian(pdi.endDate);

    pdiItem.innerHTML = `
  <strong>Aluno(a):</strong> ${pdi.name}<br>
  <strong>Meta:</strong> ${pdi.goal}<br>
  <strong>Objetivos:</strong> ${pdi.objectives}<br>
  <strong>Prazo:</strong> ${startDateBR} - ${endDateBR}
  <div class="progress-container">
    <progress value="${calculateProgress(
      pdi.startDate,
      pdi.endDate
    )}" max="100"></progress>
    <div class="progress-label">${calculateProgress(
      pdi.startDate,
      pdi.endDate
    )}% Concluído</div>
  </div>
  <div class="button-group">
    <button class="edit" onclick="editPDI(${index})">Editar</button>
    <button class="delete" onclick="deletePDI(${index})">Excluir</button>
    <button class="complete" onclick="completePDI(${index})" ${
      pdi.completed ? "disabled" : ""
    }>
      ${pdi.completed ? "Concluído" : "Concluir"}
    </button>
  </div>
`;

    if (pdi.completed) {
      pdiItem.style.backgroundColor = "#d4edda"; // Verde claro para concluído
      pdiItem.innerHTML +=
        '<span style="color: green;">Concluído com Sucesso!</span>';
    }
    pdiContainer.appendChild(pdiItem);
  });
}

/// Função para adicionar ou atualizar um PDI
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const goal = document.getElementById("goal").value.trim();
  const objectives = document.getElementById("objectives").value.trim();
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;

  if (!name || !goal || !objectives || !startDate || !endDate) {
    alert("Preencha todos os campos antes de salvar.");
    return;
  }

  const newPDI = {
    name,
    goal,
    objectives,
    startDate,
    endDate,
    completed: false,
  };

  if (currentEditIndex !== null) {
    // Atualiza o PDI existente
    pdiList[currentEditIndex] = newPDI;
    currentEditIndex = null; // Reseta o índice de edição
  } else {
    // Adiciona um novo PDI
    pdiList.push(newPDI);
  }

  saveToLocalStorage();
  renderPDIList();
  form.reset();
});

// Função para editar um PDI
function editPDI(index) {
  const pdi = pdiList[index];

  document.getElementById("name").value = pdi.name;
  document.getElementById("goal").value = pdi.goal;
  document.getElementById("objectives").value = pdi.objectives;
  document.getElementById("start-date").value = pdi.startDate;
  document.getElementById("end-date").value = pdi.endDate;

  currentEditIndex = index; // Define o índice do PDI a ser editado
}

// Função para excluir um PDI
function deletePDI(index) {
  if (confirm("Tem certeza de que deseja excluir este PDI?")) {
    pdiList.splice(index, 1);
    saveToLocalStorage();
    renderPDIList();
  }
}

// Função para marcar um PDI como concluído
function completePDI(index) {
  pdiList[index].completed = true;
  saveToLocalStorage();
  renderPDIList();
}

function calculateProgress(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

   // Verificar se a data de término é válida
   if (isNaN(start) || isNaN(end)) {
    console.error('Datas inválidas');
    return 0;
  }

  if (today < start) return 0; // Ainda não começou
  if (today > end) return 100; // Meta concluída

  const totalDuration = end - start; // Duração total em milissegundos
  const elapsed = today - start; // Tempo já passado em milissegundos
  return Math.round((elapsed / totalDuration) * 100); // Percentual de progresso
}

// Inicializa a lista de PDIs
renderPDIList();
