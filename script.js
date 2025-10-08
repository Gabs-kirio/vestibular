// Alternância de tema
const htmlEl = document.documentElement;
document.getElementById('toggleTheme').addEventListener('click', () => {
  htmlEl.classList.toggle('dark');
  htmlEl.classList.toggle('light');
});

// Abrir lista de tópicos
document.querySelectorAll('.subject-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const subject = btn.dataset.subject;
    document.querySelectorAll('.topics').forEach(s => s.classList.remove('active'));
    const section = document.getElementById('topics-' + subject);
    if (section) section.classList.add('active');
    section.scrollIntoView({ behavior: 'smooth' });
  });
});

// Modal
const overlay = document.getElementById('overlay');
const modal = document.getElementById('studyModal');
const modalSubject = document.getElementById('modalSubject');
const modalTopic = document.getElementById('modalTopic');
const contentArea = document.getElementById('contentArea');
const flashcardsList = document.getElementById('flashcardsList');
const quizArea = document.getElementById('quizArea');

function openModal() {
  overlay.classList.add('open');
  modal.classList.add('open');
}
function closeModal() {
  overlay.classList.remove('open');
  modal.classList.remove('open');
  contentArea.innerHTML = '';
  flashcardsList.innerHTML = '';
  quizArea.innerHTML = '';
  document.querySelectorAll('.btn.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.btn.tab[data-tab="conteudo"]').classList.add('active');
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-conteudo').classList.add('active');
}

overlay.addEventListener('click', closeModal);
document.getElementById('closeModal').addEventListener('click', closeModal);

// Abas
document.querySelectorAll('.btn.tab').forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    document.querySelectorAll('.btn.tab').forEach(t => t.classList.remove('active'));
    tabBtn.classList.add('active');
    const tab = tabBtn.dataset.tab;
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + tab).classList.add('active');
  });
});

// Abrir tópico no modal
document.querySelectorAll('.topic-btn').forEach(tBtn => {
  tBtn.addEventListener('click', () => {
    const topicId = tBtn.dataset.topic;
    const subjectSection = tBtn.closest('.topics');
    const subjectName = subjectSection.querySelector('h3').textContent.split('—')[0].trim();
    const topicName = tBtn.textContent.trim();
    modalSubject.textContent = subjectName;
    modalTopic.textContent = topicName;

    const tpl = document.getElementById('tpl-' + topicId);
    if (!tpl) {
      contentArea.innerHTML = '<p>Este tópico ainda não foi criado. Edite o HTML e adicione o template correspondente.</p>';
      flashcardsList.innerHTML = '';
      quizArea.innerHTML = '';
      openModal();
      return;
    }
    const clone = tpl.content.cloneNode(true);

    const contentBlock = clone.querySelector('section:not([data-type])');
    const flashBlock = clone.querySelector('section[data-type="flashcards"]');
    const quizBlock = clone.querySelector('section[data-type="quiz"]');

    if (contentBlock) contentArea.appendChild(contentBlock);
    if (flashBlock) {
      flashBlock.querySelectorAll('.flip-card').forEach(card => {
        const c = card.cloneNode(true);
        flashcardsList.appendChild(c);
      });
    }
    if (quizBlock) {
      quizArea.appendChild(quizBlock);
      initQuiz(quizArea);
    }

    flashcardsList.querySelectorAll('.flip-inner').forEach(inner => {
      inner.addEventListener('click', () => inner.classList.toggle('flipped'));
    });

    openModal();
  });
});

// Inicializar quiz com múltiplas perguntas e nota final
function initQuiz(container) {
  const questions = Array.from(container.querySelectorAll('.quiz-question'));
  let currentIndex = 0;
  let correctAnswers = 0;

  function showQuestion(index) {
    questions.forEach((q, i) => {
      q.style.display = i === index ? 'block' : 'none';
    });
  }

  function setupChoices(questionEl) {
    const choices = questionEl.querySelector('.choices');
    const explanation = questionEl.querySelector('.explanation');
    if (!choices) return;
    const correctIndex = parseInt(choices.dataset.correct, 10) || 0;
    const items = Array.from(choices.querySelectorAll('.choice'));
    let answered = false; // garante que só conta uma vez

    items.forEach((choiceEl, idx) => {
      choiceEl.addEventListener('click', () => {
        if (answered) return; // impede múltiplos cliques
        answered = true;

        items.forEach(el => el.style.pointerEvents = 'none');
        items.forEach(el => el.classList.remove('correct', 'incorrect'));
        items[correctIndex].classList.add('correct');

        if (idx !== correctIndex) {
          choiceEl.classList.add('incorrect');
        } else {
          correctAnswers++;
        }

        if (explanation) explanation.classList.add('visible');
      });
    });
  }

  questions.forEach(q => setupChoices(q));

  const prevBtn = container.querySelector('#prevQuestion');
  const nextBtn = container.querySelector('#nextQuestion');
  const finishBtn = container.querySelector('#finishQuiz');
  const resultBox = container.querySelector('#quizResult');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        showQuestion(currentIndex);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        showQuestion(currentIndex);
      }
    });
  }

  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      const total = questions.length;
      const percent = Math.round((correctAnswers / total) * 100);

      let message = "";
      if (percent < 10) {
        message = "Opa, parece que você precisa melhorar bastante nessa matéria";
      } else if (percent < 50) {
        message = "Ok, o resultado não foi tão ruim, mas pode melhorar";
      } else if (percent < 80) {
        message = "Esse resultado é bom, estudo sempre é recompensado";
      } else if (percent < 100) {
        message = "Ótimo, esse conteúdo está bem fixado, mas não esqueça de voltar de vez em quando";
      } else {
        message = "Perfeitíssimo, você é um mestre nisso";
      }

      resultBox.style.display = "block";
      resultBox.textContent = `Você acertou ${correctAnswers} de ${total} questões (${percent}%). ${message}`;
    });
  }

  showQuestion(currentIndex);
}
