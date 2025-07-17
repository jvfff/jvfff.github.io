document.addEventListener('DOMContentLoaded', () => {
    loadManhwas();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('add-form').addEventListener('submit', (event) => {
        event.preventDefault();
        addNewManhwa();
    });

    const importBtn = document.getElementById('import-btn');
    const importFileInput = document.getElementById('import-file');
    const exportBtn = document.getElementById('export-btn');
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importData);
    exportBtn.addEventListener('click', exportData);

    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const closeModalBtn = document.querySelector('.modal-close-btn');
    
    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        saveManhwaChanges();
    });

    const closeModal = () => editModal.style.display = 'none';
    closeModalBtn.addEventListener('click', closeModal);
    editModal.addEventListener('click', (event) => {
        if (event.target === editModal) closeModal();
    });
}

function loadManhwas() {
    const localData = localStorage.getItem('manhwaShelfData');
    const manhwas = localData ? JSON.parse(localData) : [];
    if (!localData) {
        localStorage.setItem('manhwaShelfData', JSON.stringify([]));
    }
    renderShelves(manhwas, true);
}

function renderShelves(manhwas, isInitialLoad = false) {
    const grids = {
        'Lendo Atualmente': document.getElementById('grid-lendo'),
        'Planejo Ler': document.getElementById('grid-planejo'),
        'Concluído': document.getElementById('grid-concluidos'),
    };
    Object.values(grids).forEach(grid => grid.innerHTML = '');
    const manhwasByStatus = { 'Lendo Atualmente': [], 'Planejo Ler': [], 'Concluído': [] };
    manhwas.forEach(m => { if (manhwasByStatus[m.status]) manhwasByStatus[m.status].push(m); });

    Object.entries(manhwasByStatus).forEach(([status, list]) => {
        const grid = grids[status];
        if (list.length === 0) {
            grid.innerHTML = '<div class="placeholder">Arraste um card para esta estante</div>';
        } else {
            list.forEach((manhwa, index) => {
                const cardHTML = createManhwaCard(manhwa);
                const cardWrapper = document.createElement('div');
                cardWrapper.innerHTML = cardHTML.trim();
                const cardElement = cardWrapper.firstElementChild;
                if (isInitialLoad) {
                    cardElement.style.animationDelay = `${index * 70}ms`;
                    cardElement.classList.add('card-enter');
                }
                grid.appendChild(cardElement);
            });
        }
    });
    addEventListeners();
}

function createManhwaCard(manhwa) {
    const today = new Date();
    const todayDateString = today.toDateString();
    const releaseDay = new Date().getDay();
    
    const lastSeenDate = manhwa.ultimoCapituloVisto ? new Date(manhwa.ultimoCapituloVisto).toDateString() : null;

    const hasNewChapter = manhwa.diaLancamento != null && 
                          manhwa.diaLancamento == releaseDay &&
                          lastSeenDate !== todayDateString;

    return `<div class="manhwa-card" data-id="${manhwa.id}" draggable="true"> 
                ${hasNewChapter ? '<div class="new-chapter-badge">Novo!</div>' : ''}
                <button class="btn-remove" title="Remover Manhwa"><i class="fa-solid fa-xmark"></i></button> 
                <button class="btn-edit" title="Editar Manhwa"><i class="fa-solid fa-pencil"></i></button> 
                <img src="${manhwa.capa}" alt="Capa de ${manhwa.titulo}" onerror="this.src='https://via.placeholder.com/200x280?text=Capa+Indisponível'"> 
                <div class="manhwa-info"> 
                    <h3>${manhwa.titulo}</h3> 
                    <div class="progress-info"><span>Cap. ${manhwa.capitulo_atual} / ${manhwa.total_capitulos > 0 ? manhwa.total_capitulos : '??'}</span></div> 
                    <div class="actions"> 
                        <button class="btn-decrement" title="Diminuir capítulo"><i class="fa-solid fa-minus"></i></button> 
                        <input type="number" class="chapter-input" value="${manhwa.capitulo_atual}" min="0"> 
                        <button class="btn-increment" title="Aumentar capítulo"><i class="fa-solid fa-plus"></i></button> 
                    </div> 
                </div> 
            </div>`;
}

function addEventListeners() {
    document.querySelectorAll('.manhwa-card').forEach(card => {
        const id = card.dataset.id;
        card.addEventListener('click', handleCardClick);
        card.querySelector('.btn-increment').addEventListener('click', (e) => { e.stopPropagation(); updateChapter(id, 1); });
        card.querySelector('.btn-decrement').addEventListener('click', (e) => { e.stopPropagation(); updateChapter(id, -1); });
        card.querySelector('.chapter-input').addEventListener('change', (e) => { e.stopPropagation(); updateChapter(id, parseInt(e.target.value), true); });
        card.querySelector('.btn-remove').addEventListener('click', (e) => { e.stopPropagation(); removeManhwa(id); });
        card.querySelector('.btn-edit').addEventListener('click', (e) => { e.stopPropagation(); openEditModal(id); });
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    document.querySelectorAll('.manhwa-grid').forEach(grid => {
        grid.addEventListener('dragover', handleDragOver);
        grid.addEventListener('dragenter', handleDragEnter);
        grid.addEventListener('dragleave', handleDragLeave);
        grid.addEventListener('drop', handleDrop);
    });
}

function handleCardClick(event) {
    if (event.target.closest('button, input')) return;

    const card = event.currentTarget;
    const manhwaId = card.dataset.id;
    const manhwas = JSON.parse(localStorage.getItem('manhwaShelfData'));
    const manhwaIndex = manhwas.findIndex(m => m.id == manhwaId);
    
    if (manhwaIndex > -1) {
        const manhwa = manhwas[manhwaIndex];
        
        manhwa.ultimoCapituloVisto = new Date().toISOString();
        localStorage.setItem('manhwaShelfData', JSON.stringify(manhwas));
        renderShelves(manhwas);

        if (manhwa.link_leitura) {
            window.open(manhwa.link_leitura, '_blank');
        } else {
            alert("Nenhum link de leitura cadastrado. Clique no lápis para editar e adicionar um link!");
            openEditModal(manhwaId);
        }
    }
}

function addNewManhwa() {
    const diaLancamentoValue = parseInt(document.getElementById('form-dia-lancamento').value);
    const newManhwa = {
        id: new Date().getTime(),
        titulo: document.getElementById('form-titulo').value,
        capa: document.getElementById('form-capa').value,
        link_leitura: document.getElementById('form-link').value,
        status: document.getElementById('form-status').value,
        capitulo_atual: parseInt(document.getElementById('form-capitulo-atual').value) || 0,
        total_capitulos: 0,
        diaLancamento: diaLancamentoValue === -1 ? null : diaLancamentoValue,
        ultimoCapituloVisto: null
    };
    const manhwas = JSON.parse(localStorage.getItem('manhwaShelfData'));
    manhwas.push(newManhwa);
    localStorage.setItem('manhwaShelfData', JSON.stringify(manhwas));
    renderShelves(manhwas);
    const newCardElement = document.querySelector(`.manhwa-card[data-id='${newManhwa.id}']`);
    if (newCardElement) {
        newCardElement.classList.add('card-enter');
        newCardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    document.getElementById('add-form').reset();
}

function removeManhwa(manhwaId) {
    if (!confirm("Tem certeza que deseja remover este manhwa?")) return;
    const cardToRemove = document.querySelector(`.manhwa-card[data-id='${manhwaId}']`);
    if (cardToRemove) {
        cardToRemove.classList.add('card-exit');
        setTimeout(() => {
            let manhwas = JSON.parse(localStorage.getItem('manhwaShelfData'));
            const updatedManhwas = manhwas.filter(m => m.id != manhwaId);
            localStorage.setItem('manhwaShelfData', JSON.stringify(updatedManhwas));
            renderShelves(updatedManhwas);
        }, 500);
    }
}

function updateChapter(manhwaId, value, isAbsolute = false) {
    const manhwas = JSON.parse(localStorage.getItem('manhwaShelfData'));
    const manhwaIndex = manhwas.findIndex(m => m.id == manhwaId);
    if (manhwaIndex > -1) {
        if (isAbsolute) manhwas[manhwaIndex].capitulo_atual = value;
        else manhwas[manhwaIndex].capitulo_atual += value;
        if (manhwas[manhwaIndex].capitulo_atual < 0) manhwas[manhwaIndex].capitulo_atual = 0;
        localStorage.setItem('manhwaShelfData', JSON.stringify(manhwas));
        renderShelves(manhwas);
    }
}

function openEditModal(manhwaId) {
    const manhwas = JSON.parse(localStorage.getItem('manhwaShelfData'));
    const manhwa = manhwas.find(m => m.id == manhwaId);
    if (!manhwa) return;
    document.getElementById('edit-manhwa-id').value = manhwa.id;
    document.getElementById('edit-titulo').value = manhwa.titulo;
    document.getElementById('edit-capa').value = manhwa.capa;
    document.getElementById('edit-link').value = manhwa.link_leitura || '';
    document.getElementById('edit-dia-lancamento').value = manhwa.diaLancamento !== null ? manhwa.diaLancamento : -1;
    document.getElementById('edit-modal').style.display = 'flex';
}

function saveManhwaChanges() {
    const manhwaId = document.getElementById('edit-manhwa-id').value;
    const manhwas = JSON.parse(localStorage.getItem('manhwaShelfData'));
    const manhwaIndex = manhwas.findIndex(m => m.id == manhwaId);
    if (manhwaIndex > -1) {
        const diaLancamentoValue = parseInt(document.getElementById('edit-dia-lancamento').value);
        manhwas[manhwaIndex].titulo = document.getElementById('edit-titulo').value;
        manhwas[manhwaIndex].capa = document.getElementById('edit-capa').value;
        manhwas[manhwaIndex].link_leitura = document.getElementById('edit-link').value;
        manhwas[manhwaIndex].diaLancamento = diaLancamentoValue === -1 ? null : diaLancamentoValue;
        localStorage.setItem('manhwaShelfData', JSON.stringify(manhwas));
        renderShelves(manhwas);
    }
    document.getElementById('edit-modal').style.display = 'none';
}

function exportData() {
    const manhwas = localStorage.getItem('manhwaShelfData');
    if (!manhwas || JSON.parse(manhwas).length === 0) {
        alert("Não há dados para exportar!");
        return;
    }
    const blob = new Blob([manhwas], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date(), y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0');
    link.download = `manhwashelf_backup_${y}-${m}-${d}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedManhwas = JSON.parse(e.target.result);
            if (Array.isArray(importedManhwas) && (importedManhwas.length === 0 || importedManhwas[0].hasOwnProperty('titulo'))) {
                if(confirm("Isso irá substituir todos os seus dados atuais. Deseja continuar?")) {
                    const sanitizedManhwas = importedManhwas.map(m => ({
                        ...m,
                        diaLancamento: m.diaLancamento !== undefined ? m.diaLancamento : null,
                        ultimoCapituloVisto: m.ultimoCapituloVisto !== undefined ? m.ultimoCapituloVisto : null
                    }));
                    localStorage.setItem('manhwaShelfData', JSON.stringify(sanitizedManhwas));
                    renderShelves(sanitizedManhwas, true);
                    alert("Dados importados com sucesso!");
                }
            } else {
                alert("Erro: O arquivo selecionado não parece ser um backup válido do ManhwaShelf.");
            }
        } catch (error) {
            alert("Erro ao ler o arquivo. Verifique se ele é um arquivo JSON válido.");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function handleDragStart(event) {
    const card = event.target.closest('.manhwa-card');
    if (!card) return;
    card.classList.add('dragging');
    event.dataTransfer.setData('text/plain', card.dataset.id);
}

function handleDragEnd(event) {
    const card = event.target.closest('.manhwa-card');
    if (card) card.classList.remove('dragging');
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDragEnter(event) {
    const dropZone = event.currentTarget;
    if (dropZone && dropZone.classList.contains('manhwa-grid')) {
        dropZone.classList.add('drag-over');
    }
}

function handleDragLeave(event) {
    const dropZone = event.currentTarget;
    if (dropZone && dropZone.classList.contains('manhwa-grid')) {
        dropZone.classList.remove('drag-over');
    }
}

function handleDrop(event) {
    event.preventDefault();
    const dropZone = event.currentTarget;
    if (!dropZone) return;
    dropZone.classList.remove('drag-over');
    const manhwaId = event.dataTransfer.getData('text/plain');
    const newStatusMap = {
        'grid-lendo': 'Lendo Atualmente',
        'grid-planejo': 'Planejo Ler',
        'grid-concluidos': 'Concluído'
    };
    const newStatus = newStatusMap[dropZone.id];
    if (newStatus && manhwaId) {
        let manhwas = JSON.parse(localStorage.getItem('manhwaShelfData'));
        const manhwaIndex = manhwas.findIndex(m => m.id == manhwaId);
        if (manhwaIndex > -1 && manhwas[manhwaIndex].status !== newStatus) {
            manhwas[manhwaIndex].status = newStatus;
            localStorage.setItem('manhwaShelfData', JSON.stringify(manhwas));
            renderShelves(manhwas);
        }
    }
}