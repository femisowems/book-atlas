import type { Book } from '../types/Book';

interface BookCardProps {
    book: Book;
    onClick: (book: Book) => void;
}

const BookCard = ({ book, onClick }: BookCardProps) => {
    return (
        <div
            onClick={() => onClick(book)}
            className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
        >
            <div className="relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
                {/* Source Badges */}
                {book.source === 'nyt' && (
                    <div className="absolute top-2 right-2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm z-10 uppercase tracking-widest">
                        {(book.rank && book.rank > 0) ? 'NYT Best Seller' : 'NYT Review'}
                    </div>
                )}
                {book.source === 'google' && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm z-10 uppercase tracking-widest">
                        Google Books
                    </div>
                )}

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
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg mb-1 leading-snug line-clamp-2" title={book.title}>
                    {book.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                    {book.authors.join(', ') || 'Unknown Author'}
                </p>
                <div className="mt-auto flex justify-between items-center text-xs text-gray-500">
                    <span>{book.publishedYear}</span>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
