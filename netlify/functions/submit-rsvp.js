// This is the serverless function that will run on Netlify
// It acts as a secure bridge between your website and Google Sheets.

// The handler function is the entry point for the Netlify Function.
exports.handler = async function(event) {
    // We only want to handle POST requests from our form
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // The GOOGLE_SCRIPT_URL is a secret environment variable you'll set in Netlify.
    // It's the URL of your Google Apps Script Web App.
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!googleScriptUrl) {
        return { statusCode: 500, body: 'Google Script URL is not configured.' };
    }

    try {
        // Get the form data from the request body
        const formData = JSON.parse(event.body);

        // Send the data to your Google Apps Script using a fetch request
        const response = await fetch(googleScriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        // Check if the data was sent to Google Sheets successfully
        if (!response.ok) {
           throw new Error(`Google Script request failed with status ${response.status}`);
        }

        const result = await response.json();

        // If Google Apps Script reports success, return a success message
        if (result.result === 'success') {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'RSVP submitted successfully!' }),
            };
        } else {
            // If Google Apps Script reports an error, return that error
            throw new Error(result.message || 'An unknown error occurred in Google Apps Script.');
        }

    } catch (error) {
        // If any other error occurs, log it and return a server error message
        console.error('Error submitting RSVP:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to submit RSVP.' }),
        };
    }
};
