import React, { useState } from 'react';
import './ChatApp.css';

const ContentGenerator = () => {
    const [userPrompt, setUserPrompt] = useState('');
    const [lessonContent, setLessonContent] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userPrompt) {
            setError('Please enter a prompt');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:1000/generate-lesson', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userPrompt }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch lesson content');
            }

            const data = await response.json();
            console.log(data.generatedText); // Provera kompletnog odgovora
            setLessonContent(data.generatedText);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <h2>Platforma za digitalizaciju obrazovanja pomoću umjetne inteligencije</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="prompt">Enter Prompt</label>
                    <textarea
                        id="prompt"
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder="Enter your prompt here"
                        rows="5"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Lesson'}
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            {lessonContent && (
                <div className="generated-content">
                    <h3>Generated Lesson:</h3>
                    <pre>{lessonContent}</pre>
                </div>
            )}
        </div>
    );
};

export default ContentGenerator;
