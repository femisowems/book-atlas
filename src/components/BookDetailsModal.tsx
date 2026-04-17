import { useRef, useEffect } from 'react';
import type { Book } from '../types/Book';

interface BookDetailsModalProps {
    book: Book | null;
    onClose: () => void;
}

const BookDetailsModal = ({ book, onClose }: BookDetailsModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        const handleTrapFocus = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || !modalRef.current) return;
            const focusable = modalRef.current.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (e.shiftKey && active === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        };

        if (book) {
            previouslyFocusedElement.current = document.activeElement as HTMLElement;
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('keydown', handleTrapFocus);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            closeButtonRef.current?.focus();
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleTrapFocus);
            document.body.style.overflow = 'unset';
            previouslyFocusedElement.current?.focus();
        };
    }, [book, onClose]);

    if (!book) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
            role="presentation"
        >
            <div
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="book-modal-title"
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto flex flex-col md:flex-row animate-scale-up relative"
            >
                <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
                    aria-label="Close modal"
                >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-800 p-6 flex items-center justify-center">
                    {book.image ? (
                        <img
                            src={book.image}
                            alt={book.title}
                            className="rounded-lg shadow-lg max-h-80 object-contain"
                        />
                    ) : (
                        <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                            No Cover
                        </div>
                    )}
                </div>

                <div className="w-full md:w-2/3 p-5 md:p-8 flex flex-col">
                    <h2 id="book-modal-title" className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white leading-tight">
                        {book.title}
                    </h2>
                    <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-4">
                        {book.authors.join(', ')}
                    </p>

                    <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Book Snapshot</h3>
                    <div className="flex flex-wrap gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
                        {book.publishedYear && book.publishedYear !== 'N/A' && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                {book.publishedYear}
                            </span>
                        )}
                        {book.publisher && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                {book.publisher}
                            </span>
                        )}
                        {book.pageCount && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                {book.pageCount} pages
                            </span>
                        )}
                        {book.subjects?.slice(0, 3).map((subject, index) => (
                            <span key={index} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800/50">
                                {subject}
                            </span>
                        ))}
                    </div>

                    <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Summary</h3>
                    <div className="prose dark:prose-invert max-w-none flex-grow overflow-y-auto mb-6">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {book.description}
                        </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-end sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm pb-1">
                        {/* NYT Review Link (Existing Preview Link) */}
                        {book.previewLink && (
                            <a
                                href={book.previewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
                            >
                                Read NYT Review
                            </a>
                        )}

                        {/* Google Books Preview */}
                        {book.isbn && (
                            <a
                                href={`https://books.google.com/books?vid=ISBN${book.isbn}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                            >
                                Preview on Google Books
                            </a>
                        )}

                        {/* Amazon Link */}
                        {book.amazonUrl && (
                            <a
                                href={book.amazonUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors shadow-sm"
                            >
                                Buy on Amazon
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsModal;
