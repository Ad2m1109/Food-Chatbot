const API_KEY = 'AIzaSyC0_zp5QfbSOmZUjgeQwyT60jYXV9ha37o';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

async function sendQuery() {
    const userInput = document.getElementById('userInput').value.trim();
    const responseDiv = document.getElementById('response');
    const loader = document.getElementById('loader');

    if (!userInput) {
        responseDiv.innerHTML = '<p class="text-red-400">Please enter an ingredient.</p>';
        return;
    }

    const query = `What foods can be made using ${userInput}?
    Please provide the result in the following format:
    
    Dish Name: [Name of the dish]
    What I Need More: [Additional ingredients required]
    How Can I Make It: [Step-by-step instructions]
    Next Dish Name: [Continue in the same format for subsequent dishes]`;

    responseDiv.innerHTML = '';
    loader.classList.remove('hidden');

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: query }] }]
            })
        });

        loader.classList.add('hidden');

        if (response.ok) {
            const result = await response.json();
            const chatbotResponse = result.candidates[0].content.parts[0].text;
            renderRecipes(chatbotResponse);
        } else {
            responseDiv.innerHTML = `<p class="text-red-400">Error: ${response.status}</p>`;
        }
    } catch (error) {
        loader.classList.add('hidden');
        responseDiv.innerHTML = '<p class="text-red-400">An error occurred while fetching recipes.</p>';
        console.error('Error:', error);
    }
}

function renderRecipes(responseText) {
    const responseDiv = document.getElementById('response');
    const dishes = responseText.split('Dish Name:').slice(1);

    if (dishes.length === 0) {
        responseDiv.innerHTML = '<p class="text-yellow-400">No recipes found for this ingredient.</p>';
        return;
    }

    responseDiv.innerHTML = dishes.map(dish => {
        const lines = dish.trim().split('\n');
        let dishName = '', ingredients = '', instructions = '';
        
        lines.forEach(line => {
            if (line.startsWith('Dish Name:')) {
                dishName = line.replace('Dish Name:', '').trim();
            } else if (line.startsWith('What I Need More:')) {
                ingredients = line.replace('What I Need More:', '').trim();
            } else if (line.startsWith('How Can I Make It:')) {
                instructions = line.replace('How Can I Make It:', '').trim();
            } else if (line.startsWith('Next Dish Name:')) {
                // Ignore, as splitting handles this
            } else {
                instructions += ' ' + line.trim();
            }
        });

        return `
            <div class="recipe-card bg-white text-gray-800 rounded-lg p-6 mb-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform">
                <h2 class="text-xl font-semibold mb-2">${dishName}</h2>
                <p class="text-sm mb-2"><strong>Additional Ingredients:</strong> ${ingredients}</p>
                <p class="text-sm"><strong>Instructions:</strong> ${instructions}</p>
            </div>
        `;
    }).join('');
}