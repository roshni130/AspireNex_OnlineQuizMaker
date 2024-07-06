
document.addEventListener('DOMContentLoaded', () => {
    const createMcqButton = document.getElementById('createMcqButton');
    const takeQuizButton = document.getElementById('takeQuizButton');
    const logoutButton = document.getElementById('logoutButton');
    const viewLibraryButton = document.getElementById('viewLibraryButton');
    const mcqFormContainer = document.getElementById('mcqFormContainer');
    const questionsContainer = document.getElementById('questionsContainer');
    const quizContainer = document.getElementById('quizContainer');
    const libraryContainer = document.getElementById('libraryContainer');
    const questionsList = document.getElementById('questionsList');
    const quizQuestions = document.getElementById('quizQuestions');
    const libraryList = document.getElementById('libraryList');
    const mcqForm = document.getElementById('mcqForm');
    const submitQuizButton = document.getElementById('submitQuiz');

    if (createMcqButton) {
        createMcqButton.addEventListener('click', () => {
            showCreateMcq();
        });
    }

    if (takeQuizButton) {
        takeQuizButton.addEventListener('click', () => {
            showTakeQuiz();
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            logoutUser();
        });
    }

    if (viewLibraryButton) {
        viewLibraryButton.addEventListener('click', () => {
            showViewLibrary();
        });
    }

    if (mcqForm) {
        mcqForm.addEventListener('submit', (event) => {
            event.preventDefault();
            createMCQ();
        });
    }

    if (submitQuizButton) {
        submitQuizButton.addEventListener('click', () => {
            submitQuiz();
        });
    }

    function showCreateMcq() {
        showContainer(mcqFormContainer);
        hideContainer(questionsContainer);
        hideContainer(quizContainer);
        hideContainer(libraryContainer);
    }

    function showTakeQuiz() {
        hideContainer(mcqFormContainer);
        hideContainer(questionsContainer);
        hideContainer(libraryContainer);
        showContainer(quizContainer);

        fetch('http://localhost:3000/api/mcq', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            quizQuestions.innerHTML = '';
            data.forEach((mcq, index) => {
                const questionItem = createQuizQuestionItem(mcq, index);
                quizQuestions.appendChild(questionItem);
            });
        })
        .catch(error => {
            console.error('Error fetching quiz questions:', error);
            alert('Failed to fetch quiz questions. Please try again later.');
        });
    }

    function showViewLibrary() {
        hideContainer(mcqFormContainer);
        hideContainer(questionsContainer);
        hideContainer(quizContainer);
        showContainer(libraryContainer);

        fetch('http://localhost:3000/api/mcq', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            libraryList.innerHTML = '';
            data.forEach((mcq, index) => {
                const questionItem = createLibraryQuestionItem(mcq, index);
                libraryList.appendChild(questionItem);
            });
        })
        .catch(error => {
            console.error('Error fetching library:', error);
            alert('Failed to fetch library. Please try again later.');
        });
    }

    function createLibraryQuestionItem(mcq, index) {
        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');
    
        const questionTitle = document.createElement('h3');
        questionTitle.textContent = `${index + 1}. ${mcq.question}`;
        questionItem.appendChild(questionTitle);
    
        const optionsList = document.createElement('ul');
        optionsList.classList.add('options-list');
    
        mcq.options.forEach((option) => {
            const optionItem = document.createElement('li');
            optionItem.textContent = option;
            if (option === mcq.correctAnswer) {
                optionItem.classList.add('correct-answer');
            }
            optionsList.appendChild(optionItem);
        });
    
        questionItem.appendChild(optionsList);
    
        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => {
            deleteMCQ(mcq._id); // Assuming mcq._id is the MongoDB ID of the MCQ
        });
        questionItem.appendChild(deleteButton);
    
        return questionItem;
    }
    
    function deleteMCQ(mcqId) {
        fetch(`http://localhost:3000/api/mcq/${mcqId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert('MCQ deleted successfully!');
            showViewLibrary(); // Refresh the library view after deletion
        })
        .catch(error => {
            console.error('Error deleting MCQ:', error);
            alert('Failed to delete MCQ. Please try again later.');
        });
    }
    

    function createQuizQuestionItem(mcq, index) {
        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');

        const questionTitle = document.createElement('h3');
        questionTitle.textContent = `${index + 1}. ${mcq.question}`;
        questionItem.appendChild(questionTitle);

        const optionsList = document.createElement('ul');
        optionsList.classList.add('options-list');

        mcq.options.forEach((option, idx) => {
            const optionItem = document.createElement('li');
            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = `question${index}`;
            radioInput.value = option;
            radioInput.dataset.question = mcq.question;
            radioInput.id = `question${index}_option${idx}`;

            const label = document.createElement('label');
            label.htmlFor = radioInput.id;
            label.textContent = option;

            optionItem.appendChild(radioInput);
            optionItem.appendChild(label);

            optionsList.appendChild(optionItem);
        });

        questionItem.appendChild(optionsList);

        return questionItem;
    }

    function createMCQ() {
        const question = document.getElementById('question').value;
        const options = [
            document.getElementById('option1').value,
            document.getElementById('option2').value,
            document.getElementById('option3').value,
            document.getElementById('option4').value,
        ];
        const correctAnswerIndex = ['a', 'b', 'c', 'd'].indexOf(document.getElementById('correctAnswer').value.toLowerCase());
        const correctAnswer = options[correctAnswerIndex];

        const mcqData = {
            question,
            options,
            correctAnswer
        };

        fetch('http://localhost:3000/api/mcq', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(mcqData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert('MCQ created successfully!');
            mcqForm.reset();
        })
        .catch(error => {
            console.error('Error creating MCQ:', error);
            alert('Failed to create MCQ. Please try again later.');
        });
    }
    
    function submitQuiz() {
        const quizForm = document.getElementById('quizForm');
        const formData = new FormData(quizForm);
        const answers = {};
    
        formData.forEach((value, key) => {
            answers[key] = value;
        });
    
        fetch('http://localhost:3000/api/submit-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ answers }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const score = data.score; // Assuming the API returns the score
            const correctCount = score / 10; // Each correct answer scores 10 points
            alert(`Your score is ${score} (${correctCount} correct answers)`);
        })
        .catch(error => {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz. Please try again later.');
        });
    }
    
    
    function displayQuizResult(result) {
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = '';

        const correctCount = result.filter(answer => answer.correct).length;
        const totalCount = result.length;
        const scoreMessage = document.createElement('p');
        scoreMessage.textContent = `You scored ${correctCount} out of ${totalCount}`;
        resultContainer.appendChild(scoreMessage);

        result.forEach((answer, index) => {
            const questionResult = document.createElement('div');
            questionResult.classList.add('question-result');

            const questionTitle = document.createElement('h4');
            questionTitle.textContent = `${index + 1}. ${answer.question}`;
            questionResult.appendChild(questionTitle);

            const selectedAnswer = document.createElement('p');
            selectedAnswer.textContent = `Your answer: ${answer.selectedAnswer}`;
            if (answer.correct) {
                selectedAnswer.classList.add('correct-answer');
            } else {
                selectedAnswer.classList.add('incorrect-answer');
            }
            questionResult.appendChild(selectedAnswer);

            const correctAnswer = document.createElement('p');
            correctAnswer.textContent = `Correct answer: ${answer.correctAnswer}`;
            questionResult.appendChild(correctAnswer);

            resultContainer.appendChild(questionResult);
        });
    }

    function showContainer(container) {
        container.style.display = 'block';
    }

    function hideContainer(container) {
        container.style.display = 'none';
    }

    function logoutUser() {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
});
