// Base de dados de frases sobre IA
const phrases = [
    {
        id: 1,
        text: "A Inteligência Artificial utiliza algoritmos para ",
        blank: "aprender",
        options: ["aprender", "esquecer", "dormitar", "brincar"]
    },
    {
        id: 2,
        text: "O Machine Learning é um subconjunto da IA que permite às máquinas ",
        blank: "aprimorar",
        options: ["aprimorar", "destruir", "ignorar", "congelar"]
    },
    {
        id: 3,
        text: "As Redes Neurais Artificiais são inspiradas no funcionamento do ",
        blank: "cérebro",
        options: ["cérebro", "coração", "pulmão", "estômago"]
    },
    {
        id: 4,
        text: "O Deep Learning utiliza múltiplas camadas de ",
        blank: "neurônios",
        options: ["neurônios", "moscas", "pedras", "nuvens"]
    },
    {
        id: 5,
        text: "Os dados são o combustível que alimenta os sistemas de IA ",
        blank: "modernos",
        options: ["modernos", "antigos", "invisíveis", "silenciosos"]
    },
    {
        id: 6,
        text: "O processamento de linguagem natural permite que as máquinas ",
        blank: "entendam",
        options: ["entendam", "ignorem", "cancelem", "invertam"]
    },
    {
        id: 7,
        text: "A visão computacional capacita os sistemas a ",
        blank: "reconhecer",
        options: ["reconhecer", "perder", "negar", "esquecer"]
    },
    {
        id: 8,
        text: "O treinamento de modelos de IA requer ",
        blank: "gigabytes",
        options: ["gigabytes", "poesia", "sonho", "magia"]
    }
];

let currentPhrase = 0;
let answers = {};
let draggedWord = null;
let sourceBlank = null;

// Inicializar o jogo
function initGame() {
    answers = {};
    currentPhrase = 0;
    renderPhrases();
    renderWords();
    updateStats();
    clearResultMessage();
}

// Renderizar frases
function renderPhrases() {
    const container = document.getElementById('phrasesContainer');
    container.innerHTML = '';

    phrases.forEach((phrase) => {
        const phraseItem = document.createElement('div');
        phraseItem.className = 'phrase-item';
        
        const text = document.createElement('div');
        text.className = 'phrase-text';
        
        const label = document.createElement('span');
        label.textContent = `${phrase.id}. `;
        text.appendChild(label);
        
        // Adicionar texto antes do espaço em branco
        const beforeText = document.createTextNode(phrase.text);
        text.appendChild(beforeText);
        
        // Criar espaço em branco arrastável
        const blankSpace = document.createElement('div');
        blankSpace.className = 'blank-space';
        blankSpace.draggable = true;
        blankSpace.dataset.phraseId = phrase.id;
        blankSpace.dataset.correctAnswer = phrase.blank;
        
        if (answers[phrase.id]) {
            blankSpace.textContent = answers[phrase.id];
            blankSpace.classList.add('filled');
        } else {
            blankSpace.textContent = '___';
        }
        
        // Event listeners para drag and drop
        blankSpace.addEventListener('dragover', handleDragOver);
        blankSpace.addEventListener('drop', handleDrop);
        blankSpace.addEventListener('dragleave', handleDragLeave);
        blankSpace.addEventListener('dragstart', handleBlankDragStart);
        
        text.appendChild(blankSpace);
        phraseItem.appendChild(text);
        container.appendChild(phraseItem);
    });
}

// Renderizar palavras disponíveis
function renderWords() {
    const container = document.getElementById('wordsContainer');
    container.innerHTML = '';
    
    // Coletar todas as palavras únicas que ainda não foram usadas
    const allWords = new Set();
    phrases.forEach(phrase => {
        phrase.options.forEach(word => allWords.add(word));
    });
    
    // Embaralhar palavras
    const shuffledWords = Array.from(allWords).sort(() => Math.random() - 0.5);
    
    shuffledWords.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.textContent = word;
        wordItem.draggable = true;
        wordItem.dataset.word = word;
        
        // Verificar se a palavra já foi usada
        const isUsed = Object.values(answers).includes(word);
        if (isUsed) {
            wordItem.classList.add('used');
        }
        
        wordItem.addEventListener('dragstart', handleWordDragStart);
        wordItem.addEventListener('dragend', handleDragEnd);
        
        container.appendChild(wordItem);
    });
}

// Handlers de Drag and Drop
function handleWordDragStart(e) {
    draggedWord = e.target.dataset.word;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleBlankDragStart(e) {
    if (e.target.classList.contains('filled')) {
        sourceBlank = e.target;
        draggedWord = e.target.textContent;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.target.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    
    if (!draggedWord) return;
    
    const phraseId = parseInt(e.target.dataset.phraseId);
    
    // Se a palavra veio de um espaço em branco (remoção)
    if (sourceBlank) {
        delete answers[parseInt(sourceBlank.dataset.phraseId)];
        sourceBlank = null;
    }
    
    // Colocar a palavra nova no espaço em branco
    answers[phraseId] = draggedWord;
    
    renderPhrases();
    renderWords();
    clearResultMessage();
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedWord = null;
    sourceBlank = null;
}

// Verificar respostas
function checkAnswers() {
    let correctCount = 0;
    let totalCount = phrases.length;
    
    phrases.forEach(phrase => {
        if (answers[phrase.id] === phrase.blank) {
            correctCount++;
        }
    });
    
    const resultDiv = document.getElementById('resultMessage');
    
    if (correctCount === totalCount) {
        resultDiv.className = 'result-message success';
        resultDiv.textContent = `🎉 Parabéns! Você acertou todas as ${totalCount} frases!`;
    } else {
        resultDiv.className = 'result-message error';
        resultDiv.textContent = `Você acertou ${correctCount} de ${totalCount}. Tente novamente!`;
    }
    
    // Atualizar stats
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('totalCount').textContent = totalCount;
}

// Limpar mensagem de resultado
function clearResultMessage() {
    const resultDiv = document.getElementById('resultMessage');
    resultDiv.className = 'result-message';
    resultDiv.textContent = '';
}

// Atualizar contagem de stats
function updateStats() {
    document.getElementById('totalCount').textContent = phrases.length;
    document.getElementById('correctCount').textContent = '0';
}

// Reiniciar jogo
function resetGame() {
    initGame();
}

// Event listeners dos botões
document.getElementById('checkBtn').addEventListener('click', checkAnswers);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', initGame);
