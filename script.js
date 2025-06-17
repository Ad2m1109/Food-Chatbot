const API_KEY = 'AIzaSyC0_zp5QfbSOmZUjgeQwyT60jYXV9ha37o';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

async function sendQuery() {
    const userInput = document.getElementById('userInput').value.trim();
    const responseDiv = document.getElementById('response');
    const loader = document.getElementById('loader');

    if (!userInput) {
        responseDiv.innerHTML = '<p class="text-red-400 text-center py-4">Please enter an ingredient.</p>';
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
            responseDiv.innerHTML = `<p class="text-red-400 text-center py-4">Error: ${response.status}</p>`;
        }
    } catch (error) {
        loader.classList.add('hidden');
        responseDiv.innerHTML = '<p class="text-red-400 text-center py-4">An error occurred while fetching recipes.</p>';
        console.error('Error:', error);
    }
}

function renderRecipes(responseText) {
    const responseDiv = document.getElementById('response');
    const dishes = responseText.split('Dish Name:').slice(1);

    if (dishes.length === 0) {
        responseDiv.innerHTML = '<p class="text-yellow-400 text-center py-4">No recipes found for this ingredient.</p>';
        return;
    }

    // Add a header for the results
    const headerHTML = `
        <div class="results-header mb-6">
            <h2 class="text-2xl font-bold text-white text-center mb-2">🍳 Recipe Suggestions</h2>
            <div class="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full"></div>
        </div>
    `;

    const recipesHTML = dishes.map((dish, index) => {
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

        // Parse ingredients into array for better display
        const ingredientsList = ingredients.split(',').map(ing => ing.trim()).filter(ing => ing);
        
        // Parse instructions into steps
        const instructionSteps = instructions.split(/\d+\.|\.|•/).map(step => step.trim()).filter(step => step && step.length > 3);

        return `
            <div class="recipe-card group relative bg-gradient-to-br from-white to-gray-50 text-gray-800 rounded-2xl p-6 mb-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 overflow-hidden">
                <!-- Recipe Number Badge -->
                <div class="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                    ${index + 1}
                </div>
                
                <!-- Decorative Element -->
                <div class="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full -translate-x-10 -translate-y-10 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                
                <!-- Dish Name -->
                <div class="mb-4">
                    <h3 class="text-2xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">
                        🍽️ ${dishName}
                    </h3>
                    <div class="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                </div>

                <!-- Additional Ingredients Section -->
                <div class="mb-6">
                    <div class="flex items-center mb-3">
                        <div class="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-2 mr-3">
                            <span class="text-green-600 text-lg">🛒</span>
                        </div>
                        <h4 class="text-lg font-semibold text-gray-700">Additional Ingredients</h4>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4 shadow-inner">
                        ${ingredientsList.length > 0 ? 
                            `<div class="flex flex-wrap gap-2">
                                ${ingredientsList.map(ing => 
                                    `<span class="inline-block bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow">
                                        ${ing}
                                    </span>`
                                ).join('')}
                            </div>` : 
                            `<p class="text-gray-500 italic">No additional ingredients needed</p>`
                        }
                    </div>
                </div>

                <!-- Instructions Section -->
                <div class="mb-4">
                    <div class="flex items-center mb-3">
                        <div class="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-2 mr-3">
                            <span class="text-blue-600 text-lg">👨‍🍳</span>
                        </div>
                        <h4 class="text-lg font-semibold text-gray-700">How to Make It</h4>
                    </div>
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 shadow-inner">
                        ${instructionSteps.length > 1 ? 
                            `<ol class="space-y-2">
                                ${instructionSteps.map((step, i) => 
                                    `<li class="flex items-start">
                                        <span class="inline-block bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                                            ${i + 1}
                                        </span>
                                        <span class="text-gray-700 leading-relaxed">${step}</span>
                                    </li>`
                                ).join('')}
                            </ol>` : 
                            `<p class="text-gray-700 leading-relaxed">${instructions}</p>`
                        }
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3 mt-6">
                    <button onclick="saveRecipe('${dishName.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}', '${ingredientsList.join(', ').replace(/'/g, '\\\'').replace(/"/g, '&quot;')}', '${instructions.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}')" class="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        ⭐ Save Recipe
                    </button>
                    <button onclick="shareRecipe('${dishName.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}', '${ingredientsList.join(', ').replace(/'/g, '\\\'').replace(/"/g, '&quot;')}', '${instructions.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}')" class="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        📋 Copy Recipe
                    </button>
                </div>

                <!-- Cooking Time Estimate (decorative) -->
                <div class="mt-4 flex items-center justify-center text-gray-500 text-sm">
                    <span class="mr-2">⏱️</span>
                    <span>Estimated cooking time: ${Math.floor(Math.random() * 30) + 15} minutes</span>
                </div>
            </div>
        `;
    }).join('');

    responseDiv.innerHTML = headerHTML + recipesHTML;

    // Add a smooth scroll to results
    setTimeout(() => {
        responseDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Save Recipe Function
function saveRecipe(dishName, ingredients, instructions) {
    const recipe = {
        name: dishName,
        ingredients: ingredients,
        instructions: instructions,
        savedAt: new Date().toISOString()
    };

    // Get existing saved recipes from localStorage
    let savedRecipes = [];
    try {
        const stored = localStorage.getItem('savedRecipes');
        if (stored) {
            savedRecipes = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading saved recipes:', error);
    }

    // Check if recipe already exists
    const existingIndex = savedRecipes.findIndex(r => r.name === dishName);
    
    if (existingIndex !== -1) {
        // Update existing recipe
        savedRecipes[existingIndex] = recipe;
        showNotification('Recipe updated successfully! 📝', 'success');
    } else {
        // Add new recipe
        savedRecipes.push(recipe);
        showNotification('Recipe saved successfully! ⭐', 'success');
    }

    // Save back to localStorage
    try {
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    } catch (error) {
        console.error('Error saving recipe:', error);
        showNotification('Error saving recipe. Storage might be full.', 'error');
    }
}

// Share Recipe Function
async function shareRecipe(dishName, ingredients, instructions) {
    const recipeText = `🍳 ${dishName}

📋 Additional Ingredients:
${ingredients || 'None needed'}

👨‍🍳 Instructions:
${instructions}

Generated by AI Recipe Generator 🤖✨`;

    try {
        // Try modern clipboard API first
        await navigator.clipboard.writeText(recipeText);
        showNotification('Recipe copied to clipboard! 📋', 'success');
    } catch (error) {
        console.error('Modern clipboard failed, trying fallback:', error);
        
        // Fallback: Create a temporary text area
        const textArea = document.createElement('textarea');
        textArea.value = recipeText;
        textArea.style.position = 'fixed';
        textArea.style.top = '-1000px';
        textArea.style.left = '-1000px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        
        try {
            textArea.select();
            textArea.setSelectionRange(0, 99999); // For mobile devices
            
            const successful = document.execCommand('copy');
            if (successful) {
                showNotification('Recipe copied to clipboard! 📋', 'success');
            } else {
                throw new Error('Copy command failed');
            }
        } catch (fallbackError) {
            console.error('Fallback copy failed:', fallbackError);
            showNotification('Unable to copy recipe. Please copy manually.', 'error');
            
            // Show the recipe text in an alert as last resort
            alert(`Recipe copied below:\n\n${recipeText}`);
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

// Show Notification Function
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transform transition-all duration-300 translate-x-full`;
    
    if (type === 'success') {
        notification.classList.add('bg-gradient-to-r', 'from-green-500', 'to-emerald-600');
    } else {
        notification.classList.add('bg-gradient-to-r', 'from-red-500', 'to-red-600');
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 100);

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// View Saved Recipes Function (bonus feature)
function viewSavedRecipes() {
    try {
        const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
        
        if (savedRecipes.length === 0) {
            showNotification('No saved recipes found! 📝', 'error');
            return;
        }

        const responseDiv = document.getElementById('response');
        const headerHTML = `
            <div class="results-header mb-6">
                <h2 class="text-2xl font-bold text-white text-center mb-2">⭐ Your Saved Recipes</h2>
                <div class="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full"></div>
                <p class="text-gray-300 text-center mt-2">${savedRecipes.length} recipe(s) saved</p>
            </div>
        `;

        const recipesHTML = savedRecipes.map((recipe, index) => {
            const ingredientsList = recipe.ingredients.split(',').map(ing => ing.trim()).filter(ing => ing);
            const savedDate = new Date(recipe.savedAt).toLocaleDateString();

            return `
                <div class="recipe-card group relative bg-gradient-to-br from-white to-gray-50 text-gray-800 rounded-2xl p-6 mb-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 overflow-hidden">
                    <div class="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg">
                        Saved ${savedDate}
                    </div>
                    
                    <div class="mb-4">
                        <h3 class="text-2xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">
                            ⭐ ${recipe.name}
                        </h3>
                        <div class="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                    </div>

                    <div class="mb-4">
                        <h4 class="text-lg font-semibold text-gray-700 mb-2">📋 Ingredients:</h4>
                        <p class="text-gray-600">${recipe.ingredients}</p>
                    </div>

                    <div class="mb-4">
                        <h4 class="text-lg font-semibold text-gray-700 mb-2">👨‍🍳 Instructions:</h4>
                        <p class="text-gray-600">${recipe.instructions}</p>
                    </div>

                    <div class="flex gap-3 mt-6">
                        <button onclick="shareRecipe('${recipe.name.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}', '${recipe.ingredients.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}', '${recipe.instructions.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}')" class="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                            📋 Copy Recipe
                        </button>
                        <button onclick="deleteRecipe('${recipe.name.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}')" class="flex-1 bg-gradient-to-r from-red-400 to-red-600 text-white py-2 px-4 rounded-lg font-medium hover:from-red-500 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        responseDiv.innerHTML = headerHTML + recipesHTML;
        responseDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Error loading saved recipes:', error);
        showNotification('Error loading saved recipes!', 'error');
    }
}

// Delete Recipe Function
function deleteRecipe(dishName) {
    if (confirm(`Are you sure you want to delete "${dishName}"?`)) {
        try {
            let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
            savedRecipes = savedRecipes.filter(recipe => recipe.name !== dishName);
            localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
            showNotification('Recipe deleted successfully! 🗑️', 'success');
            
            // Refresh the saved recipes view
            setTimeout(() => viewSavedRecipes(), 500);
        } catch (error) {
            console.error('Error deleting recipe:', error);
            showNotification('Error deleting recipe!', 'error');
        }
    }
}