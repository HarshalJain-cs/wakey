import { BookOpen, Video, Users, FileText, MessageCircle, Mail, AlertTriangle, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 200); // Wait for animation
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const sections = [
        {
            title: 'Video Tutorials',
            description: 'Get started with basic features and settings.',
            icon: Video,
            action: () => window.open('https://www.youtube.com/@wakey_app', '_blank'),
        },
        {
            title: 'User Guide',
            description: 'Learn how to get the most out of Wakey.',
            icon: BookOpen,
            action: () => window.open('https://docs.wakey.app', '_blank'),
        },
        {
            title: 'Join Our Discord Community',
            description: 'Ask questions, report bugs, and help others.',
            icon: Users,
            action: () => window.open('https://discord.gg/wakey', '_blank'),
        },
        {
            title: 'Changelog',
            description: 'View new feature releases.',
            icon: FileText,
            action: () => window.open('https://wakey.app/changelog', '_blank'),
        }
    ];

    const contactSections = [
        {
            title: 'Chat Support',
            description: 'Connect with us directly for immediate support.',
            icon: MessageCircle,
            action: () => window.open('https://wakey.app/chat', '_blank'),
        },
        {
            title: 'Email Support',
            description: 'Get assistance with issues or questions via email.',
            icon: Mail,
            action: () => window.open('mailto:support@wakey.app', '_blank'),
        },
        {
            title: 'Bug Report',
            description: 'Report an issue or bug you encountered.',
            icon: AlertTriangle,
            action: () => window.open('https://github.com/wakey/wakey/issues', '_blank'),
        },
        {
            title: 'Feature Request',
            description: 'Suggest a new feature or improvement.',
            icon: Lightbulb,
            action: () => window.open('https://wakey.app/feature-requests', '_blank'),
        }
    ];

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            <div
                className={`bg-[#1a1b26] w-[450px] max-h-[85vh] rounded-xl shadow-2xl border border-dark-700 overflow-hidden transform transition-all duration-200 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-2">
                    <h2 className="text-2xl font-bold text-white mb-1">Support</h2>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[60vh]">
                    <div className="p-4 space-y-1">
                        {sections.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.action}
                                className="w-full flex items-start gap-4 p-3 rounded-lg hover:bg-dark-800 transition-colors text-left group"
                            >
                                <div className="mt-1">
                                    <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors">{item.title}</h3>
                                    <p className="text-sm text-dark-400">{item.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="h-px bg-dark-700 mx-4 my-2" />

                    <div className="p-4 space-y-1">
                        {contactSections.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.action}
                                className="w-full flex items-start gap-4 p-3 rounded-lg hover:bg-dark-800 transition-colors text-left group"
                            >
                                <div className="mt-1">
                                    <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors">{item.title}</h3>
                                    <p className="text-sm text-dark-400">{item.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#16161e] border-t border-dark-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-full transition-colors font-medium text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
