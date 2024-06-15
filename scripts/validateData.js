function validateTrackData(track) {
    const errors = [];
    track.forEach((entry, index) => {
        if (!Array.isArray(entry) || entry.length !== 2) {
            errors.push(`Invalid format at index ${index}: ${JSON.stringify(entry)}`);
        } else {
            const [gesture, delay] = entry;
            if (typeof gesture !== 'string' || !['u', 'd', 'l', 'r'].includes(gesture)) {
                errors.push(`Invalid gesture at index ${index}: ${gesture}`);
            }
            if (typeof delay !== 'number' || delay < 0) {
                errors.push(`Invalid delay at index ${index}: ${delay}`);
            }
        }
    });
    return errors;
}

function validateCustomTrack() {
    const input = document.getElementById('custom-track');
    const file = input.files[0];
    if (!file) {
        document.getElementById('validation-results').innerHTML = '<p>No file selected.</p>';
        console.log('No file selected.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const json = JSON.parse(event.target.result);
            console.log('JSON file loaded successfully.');

            if (!Array.isArray(json)) {
                document.getElementById('validation-results').innerHTML = '<p>Invalid JSON format: Root element is not an array.</p>';
                console.log('Invalid JSON format: Root element is not an array.');
                return;
            }

            const errors = validateTrackData(json);

            if (errors.length > 0) {
                document.getElementById('validation-results').innerHTML = '<p>Data validation errors:</p><ul>' + errors.map(error => '<li>' + error + '</li>').join('') + '</ul>';
                console.log('Data validation errors:', errors);
            } else {
                document.getElementById('validation-results').innerHTML = '<p>Data validation passed.</p>';
                console.log('Data validation passed.');
                
                // Create a downloadable link for the validated file
                const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const downloadLink = document.getElementById('download-link');
                downloadLink.href = url;
                downloadLink.style.display = 'block';
            }
        } catch (error) {
            document.getElementById('validation-results').innerHTML = '<p>Error reading or parsing JSON file: ' + error.message + '</p>';
            console.log('Error reading or parsing JSON file:', error);
        }
    };
    reader.readAsText(file);
}
