const API_KEY = 'AIzaSyC0_zp5QfbSOmZUjgeQwyT60jYXV9ha37o';

        const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

        async function sendQuery() {
            const userInput = document.getElementById('userInput').value;
            const query = `What foods can be made using a ${userInput}?
Please provide the result in the following format:

Dish Name: [Name of the dish]
What I Need More: [Additional ingredients required]
How Can I Make It: [Step-by-step instructions]
Next Dish Name: [Continue in the same format for subsequent dishes]`;
            
            const payload = {
                contents: [
                    {
                        parts: [
                            { text: query }
                        ]
                    }
                ]
            };

            try {
                const response = await fetch(URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const result = await response.json();
                    const chatbotResponse = result.candidates[0].content.parts[0].text;
                    document.getElementById('response').innerText = chatbotResponse;
                } else {
                    document.getElementById('response').innerText = `Error: ${response.status}`;
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('response').innerText = 'An error occurred while fetching the response.';
            }
        }