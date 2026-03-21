import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useKeyboardShortcuts = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Do not trigger shortcuts if user is typing in an input
            if (
                e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.isContentEditable
            ) {
                return;
            }

            // Dashboard shortcuts
            switch (e.key.toLowerCase()) {
                case 'd':
                    navigate('/');
                    break;
                case 'c':
                    navigate('/collections');
                    break;
                case 'f':
                    // Focus search
                    window.dispatchEvent(new CustomEvent('focus-search'));
                    e.preventDefault();
                    break;
                case 'n':
                    // Open new resource
                    window.dispatchEvent(new CustomEvent('open-new-resource'));
                    e.preventDefault();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);
};

export default useKeyboardShortcuts;
