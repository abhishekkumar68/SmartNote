import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimeout = useRef(null);
    const wrapperRef = useRef(null);

    // Detect clicks outside to close dropdown natively
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (val.trim() === '') {
            setSuggestions([]);
            onSearch(''); // Immediately syncs the Dashboard back
            return;
        }

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(async () => {
            try {
                const { data } = await API.get(`/resources/search?q=${val}`);
                setSuggestions(data.slice(0, 5)); // Restrict to top 5 results predicting visually
            } catch (err) {
                console.error('Error fetching suggestions', err);
            }
        }, 300); // 300ms throttle
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
        setIsFocused(false);
    };

    const handleSelectSuggestion = (suggestion) => {
        setQuery(suggestion.title);
        setSuggestions([]);
        setIsFocused(false);
        onSearch(suggestion.title); // Trigger search instantly utilizing their pick
    };

    return (
        <div ref={wrapperRef} className="search-container" style={{ position: 'relative', width: '100%' }}>
            <form className="search-bar" onSubmit={handleSubmit} style={{ marginBottom: 0, position: 'relative', display: 'flex', width: '100%' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    placeholder="Search resources by title, description or tags..."
                    autoComplete="off"
                    style={{ 
                        width: '100%',
                        padding: '12px 110px 12px 48px', 
                        borderRadius: '12px', 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid var(--border-color)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: isFocused ? '0 0 0 3px rgba(79, 70, 229, 0.15)' : '0 2px 8px rgba(0,0,0,0.02)',
                        transition: 'all 0.3s ease',
                        color: 'var(--text-color)',
                        fontSize: '0.95rem'
                    }}
                />
                <button type="submit" className="btn-primary" style={{ position: 'absolute', right: '6px', top: '6px', bottom: '6px', padding: '0 1.5rem', borderRadius: '8px', height: 'auto', display: 'flex', alignItems: 'center' }}>Search</button>
            </form>

            {isFocused && suggestions.length > 0 && query.trim() !== '' && (
                <ul className="search-suggestions">
                    {suggestions.map((item) => (
                        <li key={item._id} onClick={() => handleSelectSuggestion(item)}>
                            <div className="suggestion-title">{item.title}</div>
                            {item.tags && item.tags.length > 0 && (
                                <div className="suggestion-tags">
                                    {item.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="tag" style={{ padding: '0.1rem 0.3rem', fontSize: '0.65rem' }}>{tag}</span>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
