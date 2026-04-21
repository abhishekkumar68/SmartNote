import React from 'react';
import { motion } from 'framer-motion';
import { FolderPlus } from 'lucide-react';
import './EmptyState.css';

const EmptyState = ({ title, message, actionText, onAction, icon: Icon = FolderPlus }) => {
    return (
        <motion.div 
            className="empty-state-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div 
                className="empty-state-icon-wrapper" 
                onClick={onAction}
                style={{ cursor: onAction ? 'pointer' : 'default', transition: 'transform 0.2s' }}
            >
                <Icon size={48} className="empty-state-icon" />
            </div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-message">{message}</p>
            {actionText && onAction && (
                <button onClick={onAction} className="btn-primary empty-state-btn">
                    {actionText}
                </button>
            )}
        </motion.div>
    );
};

export default EmptyState;
