// Your React component (e.g., FileUpload.js)
import React, { useState } from 'react';

const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('https://localhost:7135/api/ImportMeals/ImportMeals', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                console.log('File uploaded successfully!');
            } else {
                console.error('Error uploading file.');
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default FileUpload;
