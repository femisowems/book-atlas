import type { Book } from '../types/Book';

interface BookCardProps {
    book: Book;
    onClick: (book: Book) => void;
}

const BookCard = ({ book, onClick }: BookCardProps) => {
    return (
        <button
            type="button"
            onClick={() => onClick(book)}
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full text-left transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label={`Open details for ${book.title}`}
        >
            <div className="relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
                {/* Source Badges */}
                {book.source === 'nyt' && (
                    <div className="absolute top-2 right-2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm z-[1] uppercase tracking-widest">
                        {(book.rank && book.rank > 0) ? 'NYT Best Seller' : 'NYT Review'}
                    </div>
                )}
                {book.source === 'google' && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm z-[1] uppercase tracking-widest">
                        Google Books
                    </div>
                )}

                <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-100 text-[11px] font-semibold px-2 py-1 rounded-sm shadow-sm z-[1]">
                    {book.publishedYear && book.publishedYear !== 'N/A' ? book.publishedYear : 'Year N/A'}
                </div>

                {book.image ? (
                    <img
                        src={book.image}
                        alt={`Cover of ${book.title}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-sm">No Image</span>
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow gap-2">
                <h3 className="font-bold text-lg leading-snug line-clamp-2" title={book.title}>
                    {book.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                    {book.authors.join(', ') || 'Unknown Author'}
                </p>
                <div className="mt-auto flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                    {book.publisher && (
                        <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 max-w-full truncate">
                            {book.publisher}
                        </span>
                    )}
                    {book.pageCount && (
                        <span className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200">
                            {book.pageCount} pages
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};

export default BookCard;
