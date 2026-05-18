// Conversation Starter Cards - Client-side logic

(function () {
  'use strict';

  var data = null;
  var filteredQuestions = [];
  var lastIndex = -1;

  var categoryLabel = document.getElementById('category-label');
  var questionText = document.getElementById('question-text');
  var card = document.getElementById('card');
  var drawBtn = document.getElementById('draw-btn');
  var categoryFilter = document.getElementById('category-filter');

  function buildQuestionList(selectedCategory) {
    filteredQuestions = [];
    data.categories.forEach(function (cat) {
      if (selectedCategory === 'all' || cat.name === selectedCategory) {
        cat.questions.forEach(function (q) {
          filteredQuestions.push({ category: cat.name, question: q });
        });
      }
    });
  }

  function drawCard() {
    if (filteredQuestions.length === 0) return;

    var index;
    if (filteredQuestions.length === 1) {
      index = 0;
    } else {
      do {
        index = Math.floor(Math.random() * filteredQuestions.length);
      } while (index === lastIndex);
    }
    lastIndex = index;

    var item = filteredQuestions[index];

    // Fade out
    card.classList.remove('fade-in');
    card.classList.add('fade-out');

    setTimeout(function () {
      categoryLabel.textContent = item.category;
      questionText.textContent = item.question;
      card.classList.remove('fade-out');
      card.classList.add('fade-in');
    }, 300);
  }

  function populateCategories() {
    data.categories.forEach(function (cat) {
      var option = document.createElement('option');
      option.value = cat.name;
      option.textContent = cat.name;
      categoryFilter.appendChild(option);
    });
  }

  function init(promptsData) {
    data = promptsData;
    populateCategories();
    buildQuestionList('all');

    drawBtn.addEventListener('click', drawCard);

    categoryFilter.addEventListener('change', function () {
      buildQuestionList(categoryFilter.value);
      lastIndex = -1;
      drawCard();
    });

    document.addEventListener('keydown', function (e) {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        drawCard();
      }
    });

    // Draw the first card automatically
    drawCard();
  }

  // Load prompts data
  fetch('/data/prompts.json')
    .then(function (response) {
      if (!response.ok) throw new Error('Failed to load prompts');
      return response.json();
    })
    .then(init)
    .catch(function (err) {
      questionText.textContent = 'Failed to load questions. Please refresh.';
      console.error(err);
    });
})();
