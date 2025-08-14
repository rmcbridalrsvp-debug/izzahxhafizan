// This function fetches the wishes from our Google Sheet via the Apps Script.
exports.handler = async function(event) {
    // We only want to handle GET requests
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!googleScriptUrl) {
        return { statusCode: 500, body: 'Google Script URL is not configured.' };
    }

    try {
        // Make a GET request to the Google Apps Script URL
        const response = await fetch(googleScriptUrl, {
            method: 'GET',
        });

        if (!response.ok) {
           throw new Error(`Google Script request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result.result === 'success') {
            return {
                statusCode: 200,
                // Pass the data from Google Sheets back to the front-end
                body: JSON.stringify(result.data),
            };
        } else {
            throw new Error(result.message || 'An unknown error occurred in Google Apps Script.');
        }

    } catch (error) {
        console.error('Error fetching wishes:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch wishes.' }),
        };
    }
};
